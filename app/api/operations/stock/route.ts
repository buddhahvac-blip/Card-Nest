import {z} from 'zod';
import {currentUser} from '@/lib/auth/server';
import {transaction} from '@/lib/postgres';
import {failure,json,RequestError,rateLimit,strictBody} from '@/lib/http';
import {canApplyStockDelta,signedStockDelta} from '@/lib/physical-stock';

export const runtime='nodejs';

const schema=z.strictObject({
  sku:z.string().trim().min(3).max(80),
  reason:z.enum(['receipt','return','live_sale','damage']),
  source:z.enum(['manual','supplier','whatnot','ebay']),
  reference:z.string().trim().min(4).max(120),
  quantity:z.number().int().min(1).max(1000)
});

type LockedStock={on_hand:number;reserved:number};
type ExistingMovement={delta:number;reason:string;source:string};
export async function POST(req:Request){
  try{
    const user=await currentUser();
    if(!user||user.role!=='admin')throw new RequestError('Not found',404);
    const input=await strictBody(req,schema);
    // External sales require manual recording until a tested integration exists.
    if(input.reason==='live_sale'&&!['whatnot','ebay','manual'].includes(input.source))
      throw new RequestError('Select the sale source',400);
    if(input.reason==='receipt'&&input.source!=='supplier'&&input.source!=='manual')
      throw new RequestError('Receipts must use supplier or manual as the source',400);
    const delta=signedStockDelta(input.reason,input.quantity);
    await rateLimit('operations:stock:'+user.userId,15);
    const result=await transaction(async c=>{
      const {rows:[stock]}=await c.query<LockedStock>(
        'SELECT on_hand,reserved FROM cardnest_v1.physical_stock WHERE sku=$1 FOR UPDATE',[input.sku]);
      if(!stock)throw new RequestError('SKU has not been imported into physical inventory',404);
      // The locked stock row serializes concurrent adjustments for this SKU.
      const {rows:[existing]}=await c.query<ExistingMovement>(
        'SELECT delta,reason,source FROM cardnest_v1.physical_stock_movements WHERE sku=$1 AND source=$2 AND external_id=$3',
        [input.sku,input.source,input.reference]);
      if(existing){
        if(existing.delta!==delta||existing.reason!==input.reason)
          throw new RequestError('Reference already used for a different stock adjustment',409);
        return {duplicate:true,available:stock.on_hand-stock.reserved,onHand:stock.on_hand};
      }
      if(!canApplyStockDelta({onHand:stock.on_hand,reserved:stock.reserved},delta))
        throw new RequestError('Insufficient unreserved stock for this adjustment',409);
      const {rows:[updated]}=await c.query<LockedStock>(
        `UPDATE cardnest_v1.physical_stock
          SET on_hand=on_hand+$2,version=version+1,updated_at=now()
          WHERE sku=$1 AND on_hand+$2>=reserved AND on_hand+$2>=0
          RETURNING on_hand,reserved`,[input.sku,delta]);
      if(!updated)throw new RequestError('Stock changed; retry after refreshing',409);
      await c.query(
        `INSERT INTO cardnest_v1.physical_stock_movements
          (sku,delta,reason,actor_id,source,external_id)
          VALUES($1,$2,$3,$4,$5,$6)`,
        [input.sku,delta,input.reason,user.userId,input.source,input.reference]);
      return {duplicate:false,available:updated.on_hand-updated.reserved,onHand:updated.on_hand};
    });
    return json({ok:true,sku:input.sku,reference:input.reference,...result});
  }catch(err){return failure(err)}
}
