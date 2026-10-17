import {database} from '@/lib/postgres';
import {stripe,paymentMode,stripeKeyMode} from '@/lib/stripe';
import {releaseVerifiedUnpaidPhysicalOrder} from '@/lib/physical-order-cancellation';

/** Founder sandbox reconciliation only. Do not run against production DB.
 * Requires explicit opt-in and a separate cron secret. Never infer nonpayment from age alone.
 */
export async function reconcileAbandonedPhysicalSandboxOrders(limit=20){
 if(process.env.PHYSICAL_CHECKOUT_TEST_ENABLED!=='true'||
    process.env.PHYSICAL_CHECKOUT_TEST_DATABASE_APPROVED!=='true'||
    paymentMode()!=='test'||stripeKeyMode(process.env.STRIPE_SECRET_KEY)!=='test')
  throw Error('Physical sandbox reconciliation is disabled');
 if(!Number.isSafeInteger(limit)||limit<1||limit>50)throw Error('Invalid reconciliation limit');
 const rows=await database().query(`SELECT id,stripe_session_id FROM physical_orders
   WHERE status='pending' AND created_at < now()-interval '35 minutes'
   ORDER BY created_at ASC LIMIT $1`,[limit]);
 let released=0,stillOpen=0,manualReview=0;
 for(const row of rows.rows){
  try{
   if(!row.stripe_session_id){manualReview++;continue}
   let session=await stripe().checkout.sessions.retrieve(row.stripe_session_id);
   if(session.livemode||session.metadata?.physical_order_id!==row.id||session.metadata?.purpose!=='physical-etb'){
    manualReview++;continue;
   }
   if(session.status==='open'&&session.payment_status==='unpaid'){
    // Only expire checkout after Stripe's session expiration time has elapsed.
    // Stripe may refuse expiration if payment has already begun; then retain reservation.
    if(session.expires_at*1000>Date.now()){stillOpen++;continue}
    session=await stripe().checkout.sessions.expire(session.id);
   }
   if(session.status==='expired'&&session.payment_status==='unpaid'){
    if(await releaseVerifiedUnpaidPhysicalOrder(row.id,session.id))released++;
   }else{manualReview++}
  }catch{manualReview++}
 }
 return {scanned:rows.rowCount??rows.rows.length,released,stillOpen,manualReview};
}
