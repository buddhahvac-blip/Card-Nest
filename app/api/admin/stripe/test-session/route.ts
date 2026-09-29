import {currentUser} from '@/lib/auth/server';
import {database} from '@/lib/postgres';
import {stripe} from '@/lib/stripe';
import {failure,json,RequestError,sameOrigin,rateLimit,limitedText} from '@/lib/http';
import {auditEvent,auditDenied} from '@/lib/security';

export const runtime='nodejs';

export async function POST(req:Request){
  try{
    const u=await currentUser();
    if(!u||u.role!=='admin')throw new RequestError('Founder access required',403);sameOrigin(req);await limitedText(req,0);await rateLimit('stripe-admin:'+u.userId,3);
    if(!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_'))throw new RequestError('Stripe sandbox is not connected',503);
    const {rows:[pack]}=await database().query("SELECT id,name,stripe_price_id FROM packs WHERE id='hatchling'");
    if(!pack?.stripe_price_id)throw new RequestError('Run Stripe sandbox setup first',409);
    const s=await stripe().checkout.sessions.create({
      mode:'payment',
      line_items:[{price:pack.stripe_price_id,quantity:1}],
      customer_email:u.email,
      metadata:{purpose:'integration-test',pack_id:'hatchling'},
      success_url:'https://card-nest-iota.vercel.app/?stripe_test=success#My%20Nest',
      cancel_url:'https://card-nest-iota.vercel.app/?stripe_test=cancel#My%20Nest',
      allow_promotion_codes:false
    });
    if(!s.url)throw new RequestError('Stripe did not return a checkout URL',503);
    await auditEvent('stripe-admin',u.userId,'sandbox-test-session');return json({url:s.url});
  }catch(e){return failure(e)}
}
