import {currentUser} from '@/lib/auth/server';
import {stripe,paymentReadiness} from '@/lib/stripe';
import {failure,json,RequestError,sameOrigin,rateLimit,limitedText} from '@/lib/http';
import {auditEvent} from '@/lib/security';

export const runtime='nodejs';

async function founder(){
  const u=await currentUser();
  if(!u||u.role!=='admin')throw new RequestError('Founder access required',403);
  return u;
}

export async function POST(req:Request){
  try{
    const u=await founder();sameOrigin(req);await limitedText(req,0);await rateLimit('stripe-admin:'+u.userId,3);
    const payment=paymentReadiness();
    if(!payment.stripeConnected||!payment.keyMatchesMode)throw new RequestError('Stripe key does not match the configured payment mode',503);
    const api=stripe();
    const url=(process.env.APP_URL||'https://nestrune.vercel.app')+'/api/webhooks/stripe';
    const description=`NestRune ${payment.mode} payment webhook`;
    const existing=await api.webhookEndpoints.list({limit:100});
    for(const endpoint of existing.data){
      if(endpoint.url===url&&endpoint.description===description){
        await api.webhookEndpoints.del(endpoint.id);
      }
    }
    const endpoint=await api.webhookEndpoints.create({
      url,
      description,
      enabled_events:[
        'checkout.session.completed',
        'checkout.session.async_payment_succeeded',
        'charge.refunded',
        'charge.dispute.created',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted'
      ]
    });
    await auditEvent('stripe-admin',u.userId,`${payment.mode}-webhook`);
    return json({ok:true,mode:payment.mode,endpointId:endpoint.id,url,secret:endpoint.secret});
  }catch(e){return failure(e)}
}
