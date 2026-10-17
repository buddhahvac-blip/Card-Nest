import Stripe from 'stripe';
import {stripe,stripeEventMatchesConfiguredMode,paymentMode} from '@/lib/stripe';
import {limitedText,json,RequestError} from '@/lib/http';
import {confirmVerifiedPhysicalPayment} from '@/lib/physical-payment-confirmation';

export const runtime='nodejs';
export async function POST(req:Request){
 const secret=process.env.STRIPE_PHYSICAL_WEBHOOK_SECRET;
 if(paymentMode()!=='test'||process.env.PHYSICAL_CHECKOUT_TEST_ENABLED!=='true')return json({error:'Physical payment testing is disabled'},503);
 if(!secret)return json({error:'Physical webhook not configured'},503);
 let raw:string;
 try{raw=await limitedText(req,1048576)}
 catch(e){return json({error:'Invalid webhook payload'},e instanceof RequestError?e.status:400)}
 let event:Stripe.Event;
 try{event=stripe().webhooks.constructEvent(raw,req.headers.get('stripe-signature')||'',secret)}
 catch{return json({error:'Invalid signature'},400)}
 if(!stripeEventMatchesConfiguredMode(event.livemode))return json({error:'Payment mode mismatch'},409);
 if(event.type!=='checkout.session.completed'&&event.type!=='checkout.session.async_payment_succeeded')return json({received:true,ignored:true});
 try{
  const initial=event.data.object as Stripe.Checkout.Session;
  const session=await stripe().checkout.sessions.retrieve(initial.id);
  if(session.metadata?.purpose!=='physical-etb'||!session.metadata?.physical_order_id)return json({received:true,ignored:true});
  if(session.mode!=='payment'||session.livemode!==event.livemode)throw Error('Invalid physical checkout mode');
  const result=await confirmVerifiedPhysicalPayment({
   eventId:event.id,sessionId:session.id,orderId:session.metadata.physical_order_id,
   paymentIntentId:typeof session.payment_intent==='string'?session.payment_intent:null,
   paymentStatus:session.payment_status,currency:session.currency,amountTotal:session.amount_total,
   livemode:session.livemode
  });
  return json({received:true,...result});
 }catch{return json({error:'Physical payment requires retry or manual review'},500)}
}
