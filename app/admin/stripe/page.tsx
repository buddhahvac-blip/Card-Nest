'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';

type Status={
 mode:'test'|'live';
 keyMode:'test'|'live'|'unknown'|'missing';
 stripeConnected:boolean;
 keyMatchesMode:boolean;
 webhookSecretConfigured:boolean;
 appUrlConfigured:boolean;
 appUrlSecure:boolean;
 paymentsEnabledFlag:boolean;
 founderApproved:boolean;
 commercialPolicyApproved:boolean;
 checkoutReady:boolean;
 paymentsEnabled:boolean;
 saleEnabledPacks:number;
 paidEligibleCards:number;
 paidEligibleCommonCards:number;
 packs:Array<{id:string;name:string;price_cents:number;currency:string;stripe_price_id:string|null;sale_enabled:boolean}>
};

const mark=(ok:boolean)=>ok?'✓':'—';

export default function StripeSetup(){
 const [status,setStatus]=useState<Status|null>(null);
 const [busy,setBusy]=useState('');
 const [message,setMessage]=useState('');
 const [secret,setSecret]=useState('');

 async function refresh(){
   const r=await fetch('/api/admin/stripe/bootstrap',{cache:'no-store'});
   const d=await r.json();
   if(!r.ok)throw Error(d.error||'Could not load Stripe status');
   setStatus(d);
 }
 useEffect(()=>{queueMicrotask(()=>refresh().catch(e=>setMessage(e.message)))},[]);

 async function run(kind:string,url:string){
   setBusy(kind);setMessage('');setSecret('');
   try{
     const r=await fetch(url,{method:'POST',signal:AbortSignal.timeout(25000)});
     const d=await r.json();
     if(!r.ok)throw Error(d.error||'Stripe setup failed');
     if(d.secret)setSecret(d.secret);
     if(d.url&&kind==='test'){window.location.assign(d.url);return}
     if(kind==='products')setMessage(`${d.mode==='live'?'Live':'Test'} Stripe products and prices are linked. This does not enable customer charges.`);
     if(kind==='webhook')setMessage(`${d.mode==='live'?'Live':'Test'} Stripe webhook created. Copy the signing secret below into Vercel before leaving this page.`);
     await refresh();
   }catch(e:any){setMessage(e.message)}finally{setBusy('')}
 }

 const mode=status?.mode||'test';
 return <main className="shell" style={{maxWidth:900,paddingTop:70}}>
   <Link className="brand" href="/">✧ NestRune</Link>
   <div className="eyebrow">FOUNDER · STRIPE PAYMENT READINESS</div>
   <h1 className="page-title">Payment setup</h1>
   <p className="intro">Prepare Stripe test or live infrastructure without accidentally opening sales. NestRune requires several independent gates before checkout can charge a customer.</p>

   <section className="panel">
     <h2>Current mode · {mode.toUpperCase()}</h2>
     <p>Stripe key: <strong>{status?.stripeConnected?status.keyMode.toUpperCase():'Not connected'}</strong> {status?.keyMatchesMode?'· matches configured mode':''}</p>
     <p>Webhook signing secret: <strong>{status?.webhookSecretConfigured?'Configured':'Missing'}</strong></p>
     <p>Secure app URL: <strong>{status?.appUrlConfigured?(status.appUrlSecure?'Configured':'Configured but not HTTPS'):'Missing'}</strong></p>
     <p>Global payment switch: <strong>{status?.paymentsEnabledFlag?'ON':'OFF'}</strong></p>
     <p>Founder real-payment approval: <strong>{status?.founderApproved?'APPROVED':'NOT APPROVED'}</strong></p>
     <p>Commercial policy approval: <strong>{status?.commercialPolicyApproved?'APPROVED':'NOT APPROVED'}</strong></p>
     <p>Public checkout: <strong>{status?.checkoutReady?'READY':'BLOCKED'}</strong></p>
   </section>

   <section className="panel" style={{marginTop:20}}>
     <h2>Commercial release gates</h2>
     <p>{mark(!!status?.paidEligibleCommonCards)} Paid-eligible Common cards: <strong>{status?.paidEligibleCommonCards??0}</strong></p>
     <p>{mark(!!status?.saleEnabledPacks)} Packs explicitly enabled for sale: <strong>{status?.saleEnabledPacks??0}</strong></p>
     <p>{mark(!!status?.webhookSecretConfigured)} Signed Stripe webhook configured</p>
     <p>{mark(!!status?.keyMatchesMode)} Stripe secret key matches {mode} mode</p>
     <p>{mark(!!status?.paymentsEnabledFlag)} PAYMENTS_ENABLED=true</p>
     <p>{mark(!!status?.founderApproved)} CARDNEST_FOUNDER_PAYMENT_APPROVAL=true</p>
     <p>{mark(mode==='test'||!!status?.commercialPolicyApproved)} Live-only policy review approved: terms, refunds, randomized-pack disclosure, age/parent approach and tax decision</p>
     <p className="disclaimer">Rare, Epic and Legendary cards do not become paid-pack eligible from this screen. Their release gates remain separate.</p>
   </section>

   <section className="panel" style={{marginTop:20}}>
     <h2>1. Link {mode} products & prices</h2>
     <p>Creates or reuses the four NestRune {mode} products and stores matching Stripe price IDs in Neon. It never turns on pack sales.</p>
     <button type="button" className="gold" disabled={!!busy||!status?.keyMatchesMode} onClick={()=>run('products','/api/admin/stripe/bootstrap')}>{busy==='products'?'Working…':!status?'Checking Stripe…':!status.keyMatchesMode?`${mode.toUpperCase()} Stripe key mismatch`:`Create / link ${mode} prices`}</button>
     {status?.packs?.length?<div style={{marginTop:18}}>
       {status.packs.map(p=><p key={p.id}><strong>{p.name}</strong> · {'$'}{(p.price_cents/100).toFixed(2)} · {p.stripe_price_id?'price linked':'not linked'} · sales {p.sale_enabled?'ON':'OFF'}</p>)}
     </div>:null}
   </section>

   <section className="panel" style={{marginTop:20}}>
     <h2>2. Create {mode} webhook</h2>
     <p>Creates the Stripe endpoint for NestRune payment confirmations, refunds, and disputes. The signing secret is shown once and must be saved as <code>STRIPE_WEBHOOK_SECRET</code> in Vercel.</p>
     <button type="button" className="outline" disabled={!!busy||!status?.keyMatchesMode} onClick={()=>run('webhook','/api/admin/stripe/webhook')}>{busy==='webhook'?'Creating…':!status?'Checking Stripe…':!status.keyMatchesMode?`${mode.toUpperCase()} webhook blocked`:`Create ${mode} webhook`}</button>{status&&!status.keyMatchesMode?<p className="notice" style={{marginTop:12}}>Webhook creation is blocked because NestRune is in <strong>{mode.toUpperCase()}</strong> mode but the connected Stripe secret key is <strong>{status.keyMode.toUpperCase()}</strong>. Update the Stripe secret for this environment, redeploy, then refresh this page.</p>:null}
     {secret&&<div className="notice" style={{marginTop:18}}>
       <strong>Webhook signing secret — copy this now and do not share it:</strong>
       <input value={secret} readOnly onFocus={e=>e.currentTarget.select()} style={{width:'100%',marginTop:10}}/>
       <p>In Vercel → card-nest → Environment Variables, replace <code>STRIPE_WEBHOOK_SECRET</code> for Production, then redeploy.</p>
     </div>}
   </section>

   {mode==='test'?<section className="panel" style={{marginTop:20}}>
     <h2>3. Run sandbox checkout test</h2>
     <p>Opens Stripe-hosted test checkout using the Hatchling test price. It is an integration test only and does not grant a paid NestRune pack.</p>
     <button type="button" className="outline" disabled={!!busy||!status?.packs?.find(p=>p.id==='hatchling')?.stripe_price_id} onClick={()=>run('test','/api/admin/stripe/test-session')}>{busy==='test'?'Opening…':'Open Stripe sandbox checkout'}</button>
   </section>:<section className="panel" style={{marginTop:20}}>
     <h2>3. Live mode safety</h2>
     <p>There is intentionally no “test charge” button in live mode. Product/webhook setup can be completed first while both payment switches stay OFF.</p>
   </section>}

   <section className="panel" style={{marginTop:20}}>
     <h2>4. Final real-sales switch</h2>
     <p>Real checkout remains blocked until a founder deliberately sets <code>CARDNEST_PAYMENT_MODE=live</code>, uses matching live Stripe credentials/webhook, commercially releases selected Common cards, enables chosen packs, then sets <code>CARDNEST_COMMERCIAL_POLICY_APPROVAL=true</code>, <code>PAYMENTS_ENABLED=true</code> and <code>CARDNEST_FOUNDER_PAYMENT_APPROVAL=true</code>.</p>
     <p><strong>This page does not turn those final switches on.</strong></p>
   </section>

   {message&&<div className="notice" style={{marginTop:20}}>{message}</div>}
   <p className="disclaimer">Stripe-hosted Checkout handles card entry. NestRune grants an unopened paid pack only after a signed Stripe server webhook confirms the exact order, user, amount, currency and pack. Refunds and disputes can hold unopened entitlements even when new checkout is paused.</p>
 </main>
}
