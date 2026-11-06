import {z} from 'zod';
import {currentUser} from '@/lib/auth/server';
import {transaction} from '@/lib/postgres';
import {failure,json,RequestError,rateLimit,strictBody} from '@/lib/http';

export const runtime='nodejs';

const skuInput=z.strictObject({
  sku:z.string().trim().toUpperCase().regex(/^[A-Z0-9][A-Z0-9_-]{2,79}$/),
  title:z.string().trim().min(3).max(250),
  category:z.enum(['pokemon','one_piece','other']),
  productType:z.enum(['sealed','booster','slab','single','other']),
  language:z.enum(['en','jp','other']),
  conditionNote:z.string().trim().max(1000),
  priceCents:z.number().int().min(0).max(100000000).nullable(),
  costCents:z.number().int().min(0).max(100000000).nullable(),
  lowStockThreshold:z.number().int().min(0).max(1000),
  initialUnits:z.number().int().min(0).max(1000),
  countVerified:z.boolean()
});
export async function POST(req:Request){
  try{
    const user=await currentUser();
    if(!user||user.role!=='admin')throw new RequestError('Not found',404);
    const b=await strictBody(req,skuInput);
    if(b.initialUnits>0&&!b.countVerified)
      throw new RequestError('Count the physical units and confirm the quantity before importing',400);
    await rateLimit('operations:create-product:'+user.userId,10);
    const result=await transaction(async c=>{
      const {rows:[product]}=await c.query<{sku:string}>(
        `INSERT INTO cardnest_v1.physical_products
          (sku,title,category,product_type,language,condition_note,unit_price_cents,
           unit_cost_cents,low_stock_threshold,status,listing_verified)
          VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'draft',false)
          ON CONFLICT (sku) DO NOTHING RETURNING sku`,
        [b.sku,b.title,b.category,b.productType,b.language,b.conditionNote||null,
         b.priceCents,b.costCents,b.lowStockThreshold]);
      if(!product)throw new RequestError('SKU already exists. Choose a different SKU or review its existing stock.',409);
      await c.query('INSERT INTO cardnest_v1.physical_stock(sku,on_hand,reserved) VALUES($1,$2,0)',
        [product.sku,b.initialUnits]);
      if(b.initialUnits>0)await c.query(
        `INSERT INTO cardnest_v1.physical_stock_movements
          (sku,delta,reason,actor_id,source,external_id)
          VALUES($1,$2,'receipt',$3,'manual',$4)`,
        [product.sku,b.initialUnits,user.userId,'initial-count:'+product.sku]);
      return product;
    });
    return json({ok:true,sku:result.sku,status:'draft',checkoutEnabled:false});
  }catch(err){return failure(err)}
}
