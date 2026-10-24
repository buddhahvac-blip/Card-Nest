import Stripe from 'stripe';
import {studioOwner} from '@/lib/studio-auth';
import {database} from '@/lib/postgres';
import {stripe} from '@/lib/stripe';
import {finalizeCollectorEvent,releaseOrphanCollectorHold,markCollectorPaymentReview} from '@/lib/collector-orders';
import {rateLimit,RequestError,failure,json,sameOrigin} from '@/lib/http';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(req:Request){
 try{
  sameOrigin(req);
  const owner=await studioOwner();if(!owner)throw new RequestError('Founder access required',403);
  await rateLimit('collector-reconcile:'+owner.userId,2);
  const orders=await database().query(
   "SELECT id,session_id FROM collector_orders WHERE status='pending' AND created<now()-interval '31 minutes' ORDER BY created ASC LIMIT 50"
  );
  let paid=0,expired=0,skipped=0;
  const api=stripe();
  for(const o of orders.rows){
   try{
    if(!o.session_id){
     const changed=await releaseOrphanCollectorHold(o.id);
     if(changed)expired++;else skipped++;
     continue;
    }
    const s:Stripe.Checkout.Session=await api.checkout.sessions.retrieve(o.session_id);
    let type='';
    if(s.status==='expired'&&s.payment_status!=='paid')type='checkout.session.expired';
    else if(s.status==='complete'&&s.payment_status==='paid')type='checkout.session.completed';
    else {skipped++;continue}
    if(type==='checkout.session.completed'&&typeof s.payment_intent==='string'){
     const pi=await api.paymentIntents.retrieve(s.payment_intent,{expand:['latest_charge']});
     const charge=pi.latest_charge;
     if(typeof charge==='object'&&charge&&(charge.refunded||charge.disputed||charge.amount_refunded>0)){
      await markCollectorPaymentReview('reconcile:review:'+o.id,'charge.refunded',pi.id,o.id);
      skipped++;continue;
     }
    }
    const result=await finalizeCollectorEvent('reconcile:'+type+':'+o.id,type,{
     id:s.id,metadata:s.metadata,mode:s.mode||'',payment_status:s.payment_status||'',
     currency:s.currency||null,amount_subtotal:s.amount_subtotal??null,
     amount_total:s.amount_total??null,payment_intent:typeof s.payment_intent==='string'?s.payment_intent:null,
     shipping_cost:s.shipping_cost?{amount_total:s.shipping_cost.amount_total}:null
    });
    if(result.paid)paid++;else if(result.expired)expired++;else skipped++;
   }catch{skipped++}
  }
  return json({checked:orders.rowCount,paid,expired,skipped,note:'Only verified Stripe sessions are reconciled. Manually review any skipped orders.'});
 }catch(e){return failure(e)}
}
