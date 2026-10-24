import Stripe from 'stripe';
import {stripe,stripeEventMatchesConfiguredMode} from '@/lib/stripe';
import {finalizeCollectorEvent,markCollectorPaymentReview} from '@/lib/collector-orders';
import {json,limitedText,RequestError} from '@/lib/http';

export const runtime='nodejs';
export async function POST(req:Request){
 const secret=process.env.COLLECTOR_STRIPE_WEBHOOK_SECRET;
 if(!secret?.startsWith('whsec_'))return json({error:'Collector webhook not configured'},503);
 let raw:string;
 try{raw=await limitedText(req,1048576)}
 catch(e){return json({error:'Payload too large'},e instanceof RequestError?e.status:400)}
 let event:Stripe.Event;
 try{event=stripe().webhooks.constructEvent(raw,req.headers.get('stripe-signature')||'',secret)}
 catch{return json({error:'Invalid Stripe signature'},400)}
 if(!stripeEventMatchesConfiguredMode(event.livemode))return json({error:'Collector webhook mode does not match API key'},409);
 try{
  if(['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.expired'].includes(event.type)){
   const initial=event.data.object as Stripe.Checkout.Session;
   const s=await stripe().checkout.sessions.retrieve(initial.id);
   if(s.metadata?.purpose!=='collector-physical')return json({received:true,ignored:true});
   const result=await finalizeCollectorEvent(event.id,event.type,{
    id:s.id,metadata:s.metadata,mode:s.mode||'',
    payment_status:s.payment_status||'',
    currency:s.currency||null,amount_subtotal:s.amount_subtotal??null,
    amount_total:s.amount_total??null,
    payment_intent:typeof s.payment_intent==='string'?s.payment_intent:null,
    shipping_cost:s.shipping_cost?{amount_total:s.shipping_cost.amount_total}:null
   });
   return json({received:true,...result});
  }
  if(event.type==='charge.refunded'||event.type==='charge.dispute.created'){
   const charge=event.data.object as Stripe.Charge;
   if(typeof charge.payment_intent==='string')
    await markCollectorPaymentReview(event.id,event.type,charge.payment_intent);
  }
  return json({received:true});
 }catch{
  return json({error:'Collector event requires retry or manual review'},500);
 }
}
