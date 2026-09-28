import {currentUser} from '@/lib/auth/server';
import {stripe} from '@/lib/stripe';
import {failure,json,RequestError} from '@/lib/http';

export const runtime='nodejs';

async function founder(){
  const u=await currentUser();
  if(!u||u.role!=='admin')throw new RequestError('Founder access required',403);
  if(!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_'))throw new RequestError('Stripe sandbox is not connected',503);
}

export async function POST(){
  try{
    await founder();
    const api=stripe();
    const url='https://card-nest-iota.vercel.app/api/webhooks/stripe';
    const description='CardNest sandbox test webhook';
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
    return json({ok:true,endpointId:endpoint.id,url,secret:endpoint.secret});
  }catch(e){return failure(e)}
}
