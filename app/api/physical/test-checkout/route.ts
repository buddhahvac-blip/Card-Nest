import {z} from 'zod';
import {studioOwner} from '@/lib/studio-auth';
import {stripe,paymentMode,stripeKeyMode} from '@/lib/stripe';
import {strictBody,json,failure,RequestError,rateLimit} from '@/lib/http';
import {reservePhysicalOrder} from '@/lib/physical-orders';
import {database} from '@/lib/postgres';

/** Founder-only sandbox checkout. No customer-facing endpoint or live mode.
 * Pickup only until verified carrier quotes, taxes and margin gates are integrated.
 * Requires separate test database with physical ledger migration and stock initialization.
 */
export const runtime='nodejs';
const schema=z.strictObject({
 productId:z.enum(['anniversary-30','destined-rivals','prismatic-evolutions','surging-sparks']),
 quantity:z.number().int().min(1).max(5)
});
export async function POST(req:Request){
 try{
  if(process.env.PHYSICAL_CHECKOUT_TEST_ENABLED!=='true'||
     process.env.PHYSICAL_CHECKOUT_TEST_DATABASE_APPROVED!=='true'||
     paymentMode()!=='test'||stripeKeyMode(process.env.STRIPE_SECRET_KEY)!=='test')
    throw new RequestError('Physical sandbox checkout is disabled',503);
  const owner=await studioOwner();
  if(!owner)throw new RequestError('Founder authorization required',403);
  const {productId,quantity}=await strictBody(req,schema);
  await rateLimit('physical-sandbox:'+owner.userId,3);
  if(!process.env.APP_URL?.startsWith('https://')||!process.env.STRIPE_PHYSICAL_WEBHOOK_SECRET?.startsWith('whsec_'))
    throw new RequestError('Sandbox return URL or webhook is not configured',503);
  // No shipping charge or live customer payment path: pickup-only sandbox.
  const reserved=await reservePhysicalOrder(owner.userId,[{productId,quantity}],'pickup');
  const session=await stripe().checkout.sessions.create({
   mode:'payment',
   client_reference_id:owner.userId,
   line_items:[{price_data:{
    currency:'usd',
    product_data:{name:'NestRune sandbox physical order — '+productId},
    unit_amount:reserved.subtotalCents/quantity
   },quantity}],
   metadata:{purpose:'physical-etb',physical_order_id:reserved.orderId},
   payment_intent_data:{metadata:{purpose:'physical-etb',physical_order_id:reserved.orderId}},
   success_url:process.env.APP_URL+'/admin/physical-inventory?physical_test=returned',
   cancel_url:process.env.APP_URL+'/admin/physical-inventory?physical_test=cancelled',
   allow_promotion_codes:false
  },{idempotencyKey:'physical-sandbox:'+reserved.orderId});
  if(!session.url||session.livemode)throw new Error('Unexpected Stripe session mode');
  await database().query('UPDATE physical_orders SET stripe_session_id=$2 WHERE id=$1 AND status=$3',[reserved.orderId,session.id,'pending']);
  return json({url:session.url,orderId:reserved.orderId,testOnly:true});
 }catch(e){return failure(e)}
}
