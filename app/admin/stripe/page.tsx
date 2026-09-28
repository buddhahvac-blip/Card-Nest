'use client';
import {useEffect,useState} from 'react';

type Status={
 stripeConnected:boolean;
 testMode:boolean;
 webhookSecretConfigured:boolean;
 appUrlConfigured:boolean;
 paymentsEnabled:boolean;
 packs:Array<{id:string;name:string;price_cents:number;currency:string;stripe_price_id:string|null;sale_enabled:boolean}>
};

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
 useEffect(()=>{refresh().catch(e=>setMessage(e.message))},[]);

 async function run(kind:string,url:string){
   setBusy(kind);setMessage('');setSecret('');
   try{
     const r=await fetch(url,{method:'POST'});
     const d=await r.json();
     if(!r.ok)throw Error(d.error||'Stripe setup failed');
     if(d.secret)setSecret(d.secret);
     if(d.url&&kind==='test'){window.location.assign(d.url);return}
     setMessage(kind==='products'?'Sandbox products and prices are linked. Paid pack sales remain disabled.':'Sandbox webhook created. Copy the signing secret below into Vercel before leaving this page.');
     await refresh();
   }catch(e:any){setMessage(e.message)}finally{setBusy('')}
 }

 return <main className="shell" style={{maxWidth:900,paddingTop:70}}>
   <a className="brand" href="/">✧ CardNest</a>
   <div className="eyebrow">FOUNDER · STRIPE SANDBOX</div>
   <h1 className="page-title">Payment setup</h1>
   <p className="intro">Configure and test CardNest payments without enabling real sales. This page only accepts a founder/admin session and only works with a Stripe test key.</p>

   <section className="panel">
     <h2>Connection status</h2>
     <p>Stripe sandbox: <strong>{status?.stripeConnected?'Connected':'Checking…'}</strong></p>
     <p>Webhook secret in Vercel: <strong>{status?.webhookSecretConfigured?'Configured':'Not configured yet'}</strong></p>
     <p>Public paid checkout: <strong>{status?.paymentsEnabled?'Enabled':'Disabled'}</strong></p>
   </section>

   <section className="panel" style={{marginTop:20}}>
     <h2>1. Create sandbox products & prices</h2>
     <p>Creates or reuses the four CardNest sandbox products and stores their Stripe price IDs in Neon. It does not turn on sales.</p>
     <button className="gold" disabled={!!busy} onClick={()=>run('products','/api/admin/stripe/bootstrap')}>{busy==='products'?'Working…':'Create / link sandbox prices'}</button>
     {status?.packs?.length? <div style={{marginTop:18}}>
       {status.packs.map(p=><p key={p.id}><strong>{p.name}</strong> · {'$'}{(p.price_cents/100).toFixed(2)} · {p.stripe_price_id?'price linked':'not linked'} · sales {p.sale_enabled?'ON':'OFF'}</p>)}
     </div>:null}
   </section>

   <section className="panel" style={{marginTop:20}}>
     <h2>2. Create sandbox webhook</h2>
     <p>Creates the Stripe sandbox endpoint for CardNest. The signing secret is displayed once so you can paste it directly into Vercel as <code>STRIPE_WEBHOOK_SECRET</code>.</p>
     <button className="outline" disabled={!!busy} onClick={()=>run('webhook','/api/admin/stripe/webhook')}>{busy==='webhook'?'Creating…':'Create sandbox webhook'}</button>
     {secret&&<div className="notice" style={{marginTop:18}}>
       <strong>Webhook signing secret — copy this now and do not share it:</strong>
       <input value={secret} readOnly onFocus={e=>e.currentTarget.select()} style={{width:'100%',marginTop:10}}/>
       <p>In Vercel → card-nest → Environment Variables, add <code>STRIPE_WEBHOOK_SECRET</code> as a Secret for Production, then redeploy.</p>
     </div>}
   </section>

   <section className="panel" style={{marginTop:20}}>
     <h2>3. Run sandbox checkout test</h2>
     <p>This opens a Stripe-hosted sandbox checkout using the Hatchling $1.99 test price. It is an integration test only and does not grant a paid CardNest pack.</p>
     <button className="outline" disabled={!!busy||!status?.packs?.find(p=>p.id==='hatchling')?.stripe_price_id} onClick={()=>run('test','/api/admin/stripe/test-session')}>{busy==='test'?'Opening…':'Open Stripe sandbox checkout'}</button>
   </section>

   {message&&<div className="notice" style={{marginTop:20}}>{message}</div>}
   <p className="disclaimer">Real charges remain blocked: production code still rejects live Stripe keys/events, public paid checkout is disabled, and the Season One release gates remain enforced.</p>
 </main>
}
