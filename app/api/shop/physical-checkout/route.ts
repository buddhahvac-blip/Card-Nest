import {randomUUID,createHash} from 'node:crypto';
import {z} from 'zod';
import {collectorBaseUrl,collectorCheckoutReadiness,collectorIds} from '@/lib/collector-checkout';
import {reserveCollectorOrder,attachCollectorSession} from '@/lib/collector-orders';
import {stripe} from '@/lib/stripe';
import {database} from '@/lib/postgres';
import {strictBody,rateLimit,RequestError,failure,json} from '@/lib/http';

export const dynamic='force-dynamic';
export const runtime='nodejs';
const checkoutRequest=z.strictObject({
 itemId:z.enum(collectorIds),
 quantity:z.number().int().min(1).max(4),
 email:z.string().trim().toLowerCase().email().max(254),
 requestKey:z.string().uuid()
});
function ipToken(req:Request){
 const ip=req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()||req.headers.get('x-real-ip')||'unknown';
 return createHash('sha256').update(ip).digest('hex').slice(0,24);
}

export async function GET(){
 try{
  const readiness=collectorCheckoutReadiness();
  const result=await database().query(
   'SELECT id,name,unit_price_cents,on_hand-reserved AS available,photo_url FROM collector_inventory WHERE sellable=true AND verified_photos=true AND unit_price_cents IS NOT NULL AND photo_url IS NOT NULL ORDER BY id'
  );
  return json({checkoutEnabled:readiness.enabled,mode:readiness.mode,
   items:readiness.enabled?result.rows.map(i=>({id:i.id,name:i.name,unitPriceCents:i.unit_price_cents,available:i.available,photoUrl:i.photo_url})):[]});
 }catch{return json({checkoutEnabled:false,mode:collectorCheckoutReadiness().mode,items:[]})}
}

export async function POST(req:Request){
 try{
  const b=await strictBody(req,checkoutRequest,1536);
  const ready=collectorCheckoutReadiness();
  if(!ready.enabled)throw new RequestError('Secure physical checkout is not enabled. Use the purchase request form.',503);
  await rateLimit('collector-checkout:'+ipToken(req),6);
  const api=stripe();
  const rate=await api.shippingRates.retrieve(process.env.COLLECTOR_US_SHIPPING_RATE_ID!);
  if(!rate.active||rate.type!=='fixed_amount'||rate.fixed_amount?.currency!=='usd'||typeof rate.fixed_amount.amount!=='number'||rate.fixed_amount.amount<0)
   throw new RequestError('Shipping configuration is under review',503);
  const id=randomUUID();
  const order=await reserveCollectorOrder(b.itemId,b.quantity,b.email,b.requestKey,id);
  if(order.session_id){
   const old=await api.checkout.sessions.retrieve(order.session_id);
   if(old.status==='open'&&old.url)return json({url:old.url,orderId:order.id});
   throw new RequestError('Checkout session expired. Start again with a new request.',409);
  }
  const base=collectorBaseUrl();
  const now=Math.floor(Date.now()/1000);
  const session=await api.checkout.sessions.create({
   mode:'payment',
   payment_method_types:['card'],
   client_reference_id:order.id,
   customer_email:order.email,
   customer_creation:'always',
   line_items:[{price_data:{
     currency:'usd',unit_amount:order.unit_price_cents,
     product_data:{name:'NestRune — '+order.item_id,description:'Sealed collectible; ships from Hawaiʻi'}
    },quantity:order.quantity}],
   shipping_address_collection:{allowed_countries:['US']},
   shipping_options:[{shipping_rate:rate.id}],
   automatic_tax:{enabled:true},
   billing_address_collection:'required',
   metadata:{purpose:'collector-physical',order_id:order.id,item_id:order.item_id,quantity:String(order.quantity),request_key:order.request_key},
   payment_intent_data:{metadata:{purpose:'collector-physical',order_id:order.id}},
   allow_promotion_codes:false,
   success_url:base+'/pokemon-collectibles?checkout=returned',
   cancel_url:base+'/pokemon-collectibles?checkout=cancelled',
   expires_at:now+1800
  },{idempotencyKey:'collector-checkout:'+order.id});
  if(!session.url)throw new RequestError('Unable to open secure checkout',503);
  await attachCollectorSession(order.id,session.id);
  return json({url:session.url,orderId:order.id});
 }catch(e){return failure(e)}
}
