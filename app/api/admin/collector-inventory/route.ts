import {z} from 'zod';
import {studioOwner} from '@/lib/studio-auth';
import {transaction,database} from '@/lib/postgres';
import {strictBody,rateLimit,failure,json,RequestError} from '@/lib/http';
import {collectorIds} from '@/lib/collector-checkout';

export const runtime='nodejs';export const dynamic='force-dynamic';
const update=z.strictObject({
 id:z.enum(collectorIds),
 onHand:z.number().int().min(0).max(10000),
 unitPriceCents:z.number().int().min(50).max(10000000),
 photoUrl:z.string().max(220).regex(/^\/collector\/real\/[a-zA-Z0-9_.-]+\.(webp|png|jpg|jpeg)$/),
 verifiedPhotos:z.literal(true),
 sellable:z.boolean(),
 confirmedPhysicalCount:z.literal(true)
});
export async function GET(){
 try{
  const owner=await studioOwner();if(!owner)throw new RequestError('Founder access required',403);
  const items=await database().query('SELECT id,name,unit_price_cents,on_hand,reserved,sellable,verified_photos,photo_url,updated FROM collector_inventory ORDER BY id');
  const orders=await database().query('SELECT id,item_id,quantity,email,unit_price_cents,status,session_id,paid_total_cents,created,paid_at FROM collector_orders ORDER BY created DESC LIMIT 100');
  return json({items:items.rows,orders:orders.rows});
 }catch(e){return failure(e)}
}
export async function PATCH(req:Request){
 try{
  const owner=await studioOwner();if(!owner)throw new RequestError('Founder access required',403);
  const b=await strictBody(req,update,1600);
  await rateLimit('collector-inventory-admin:'+owner.userId,20);
  const result=await transaction(async c=>{
   const r=await c.query(
    `UPDATE collector_inventory SET on_hand=$2,unit_price_cents=$3,photo_url=$4,
    verified_photos=$5,sellable=$6,updated=now()
    WHERE id=$1 AND reserved=0 RETURNING id,name,on_hand,reserved,sellable,unit_price_cents,photo_url`,
    [b.id,b.onHand,b.unitPriceCents,b.photoUrl,b.verifiedPhotos,b.sellable]);
   if(!r.rowCount)throw new RequestError('An order reservation is active or product was not found; retry after reservation is cleared',409);
   return r.rows[0];
  });
  return json({item:result});
 }catch(e){return failure(e)}
}
