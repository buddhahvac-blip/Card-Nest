import {currentUser} from '@/lib/auth/server';
import {database} from '@/lib/postgres';
import {stripe,paymentReadiness} from '@/lib/stripe';
import {failure,json,RequestError,sameOrigin,rateLimit,limitedText} from '@/lib/http';
import {auditEvent} from '@/lib/security';

export const runtime='nodejs';
export const dynamic='force-dynamic';

async function founder(){
  const u=await currentUser();
  if(!u||u.role!=='admin')throw new RequestError('Founder access required',403);
  return u;
}

async function status(){
  const payment=paymentReadiness();
  const [{rows:packs},{rows:[cardStats]}]=await Promise.all([
    database().query('SELECT id,name,price_cents,currency,stripe_price_id,sale_enabled FROM packs ORDER BY count'),
    database().query(`SELECT
      count(*) FILTER (WHERE release_status='released' AND is_collectible=true AND is_pack_eligible=true AND art IS NOT NULL AND art_status='live')::int AS paid_eligible_cards,
      count(*) FILTER (WHERE rarity='common' AND release_status='released' AND is_collectible=true AND is_pack_eligible=true AND art IS NOT NULL AND art_status='live')::int AS paid_eligible_common_cards
      FROM cards WHERE season_id='season-1'`)
  ]);
  return {
    ...payment,
    paymentsEnabled:payment.checkoutReady,
    saleEnabledPacks:packs.filter((p:any)=>p.sale_enabled).length,
    paidEligibleCards:cardStats?.paid_eligible_cards||0,
    paidEligibleCommonCards:cardStats?.paid_eligible_common_cards||0,
    packs
  };
}

export async function GET(){
  try{
    await founder();
    return json(await status());
  }catch(e){return failure(e)}
}

export async function POST(req:Request){
  try{
    const u=await founder();sameOrigin(req);await limitedText(req,0);await rateLimit('stripe-admin:'+u.userId,3);
    const payment=paymentReadiness();
    if(!payment.stripeConnected||!payment.keyMatchesMode)throw new RequestError('Stripe key does not match the configured payment mode',503);

    const api=stripe();
    const {rows:packs}=await database().query('SELECT id,name,price_cents,currency,stripe_price_id,sale_enabled FROM packs ORDER BY count');
    const existingProducts=await api.products.list({active:true,limit:100});
    const results=[] as any[];

    for(const pack of packs){
      if(!pack.price_cents||pack.price_cents<50)throw new RequestError('Pack pricing is incomplete',409);
      let product=existingProducts.data.find(p=>p.metadata?.cardnest_pack_id===pack.id&&p.metadata?.cardnest_environment===payment.mode);
      if(!product){
        product=await api.products.create({
          name:`CardNest ${pack.name} Pack`,
          description:`Season One: The First Flight digital collectible pack — Stripe ${payment.mode} configuration.`,
          metadata:{cardnest_pack_id:pack.id,cardnest_environment:payment.mode}
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
          metadata:{cardnest_pack_id:pack.id,cardnest_environment:payment.mode}
        });
      }
      await database().query('UPDATE packs SET stripe_price_id=$2 WHERE id=$1',[pack.id,price.id]);
      results.push({id:pack.id,name:pack.name,price_cents:pack.price_cents,currency:pack.currency,product_id:product.id,price_id:price.id,sale_enabled:pack.sale_enabled});
    }

    await auditEvent('stripe-admin',u.userId,`${payment.mode}-bootstrap`,{packs:results.length});
    return json({ok:true,mode:payment.mode,salesRemainDisabled:process.env.PAYMENTS_ENABLED!=='true'||process.env.CARDNEST_FOUNDER_PAYMENT_APPROVAL!=='true',packs:results});
  }catch(e){return failure(e)}
}
