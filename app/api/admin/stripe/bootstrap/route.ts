import {currentUser} from '@/lib/auth/server';
import {database} from '@/lib/postgres';
import {stripe} from '@/lib/stripe';
import {failure,json,RequestError,sameOrigin,rateLimit,limitedText} from '@/lib/http';
import {auditEvent,auditDenied} from '@/lib/security';

export const runtime='nodejs';
export const dynamic='force-dynamic';

async function founder(){
  const u=await currentUser();
  if(!u||u.role!=='admin')throw new RequestError('Founder access required',403);
  if(!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_'))throw new RequestError('Stripe sandbox is not connected',503);
  return u;
}

export async function GET(){
  try{
    await founder();
    const {rows:packs}=await database().query('SELECT id,name,price_cents,currency,stripe_price_id,sale_enabled FROM packs ORDER BY count');
    return json({
      stripeConnected:true,
      testMode:true,
      webhookSecretConfigured:!!process.env.STRIPE_WEBHOOK_SECRET,
      appUrlConfigured:!!process.env.APP_URL,
      paymentsEnabled:process.env.PAYMENTS_ENABLED==='true',
      packs
    });
  }catch(e){return failure(e)}
}

export async function POST(req:Request){
  try{
    const u=await founder();sameOrigin(req);await limitedText(req,0);await rateLimit('stripe-admin:'+u.userId,3);
    const api=stripe();
    const {rows:packs}=await database().query('SELECT id,name,price_cents,currency,stripe_price_id,sale_enabled FROM packs ORDER BY count');
    const existingProducts=await api.products.list({active:true,limit:100});
    const results=[] as any[];

    for(const pack of packs){
      if(!pack.price_cents||pack.price_cents<50)throw new RequestError('Pack pricing is incomplete',409);
      let product=existingProducts.data.find(p=>p.metadata?.cardnest_pack_id===pack.id);
      if(!product){
        product=await api.products.create({
          name:`CardNest ${pack.name} Pack`,
          description:'Season One: The First Flight digital collectible pack — Stripe sandbox configuration.',
          metadata:{cardnest_pack_id:pack.id,cardnest_environment:'sandbox'}
        });
      }

      let price:any=null;
      if(pack.stripe_price_id){
        try{
          const current=await api.prices.retrieve(pack.stripe_price_id);
          if(current.active&&current.type==='one_time'&&current.unit_amount===pack.price_cents&&current.currency===pack.currency)price=current;
        }catch{}
      }
      if(!price){
        const prices=await api.prices.list({product:product.id,active:true,limit:100});
        price=prices.data.find(p=>p.type==='one_time'&&p.unit_amount===pack.price_cents&&p.currency===pack.currency);
      }
      if(!price){
        price=await api.prices.create({
          product:product.id,
          unit_amount:pack.price_cents,
          currency:pack.currency,
          metadata:{cardnest_pack_id:pack.id,cardnest_environment:'sandbox'}
        });
      }
      await database().query('UPDATE packs SET stripe_price_id=$2 WHERE id=$1',[pack.id,price.id]);
      results.push({id:pack.id,name:pack.name,price_cents:pack.price_cents,currency:pack.currency,product_id:product.id,price_id:price.id,sale_enabled:pack.sale_enabled});
    }

    await auditEvent('stripe-admin',u.userId,'sandbox-bootstrap',{packs:results.length});return json({ok:true,testMode:true,salesRemainDisabled:true,packs:results});
  }catch(e){return failure(e)}
}
