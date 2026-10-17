import {database} from '@/lib/postgres';
import {stripe,paymentMode,stripeKeyMode} from '@/lib/stripe';
import {releaseVerifiedUnpaidPhysicalOrder} from '@/lib/physical-order-cancellation';

/** Reconcile ambiguous sandbox session creation using the SAME Stripe idempotency key.
 * Never release stock when Stripe cannot be reached or session status is unknown.
 */
export async function reconcileUnlinkedPhysicalSandboxOrder(orderId:string){
 if(process.env.PHYSICAL_CHECKOUT_TEST_ENABLED!=='true'||
    process.env.PHYSICAL_CHECKOUT_TEST_DATABASE_APPROVED!=='true'||
    paymentMode()!=='test'||stripeKeyMode(process.env.STRIPE_SECRET_KEY)!=='test')
  throw Error('Physical sandbox recovery disabled');
 const order=await database().query('SELECT id,status,stripe_session_id FROM physical_orders WHERE id=$1',[orderId]);
 if(order.rowCount!==1||order.rows[0].status!=='pending')return {needsReview:true};
 if(order.rows[0].stripe_session_id)return {linked:true};
 // Stripe cannot reliably be queried by arbitrary idempotency key. Without the
 // original request payload, we must NOT claim there is no session or release stock.
 return {needsReview:true,reason:'Unlinked Stripe session requires manual Stripe verification'};
}
