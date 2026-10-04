'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,Leaf,Gem,Shield,Crown} from 'lucide-react';
import {storefrontPacks,checkoutRequest,type PackCatalog} from '@/lib/pack-store';
import PackArtwork from './pack-artwork';
const icons={hatchling:Leaf,nest:Gem,guardian:Shield,royal:Crown};

export default function PackStore({busy,onPreview,onFree}:{busy:boolean;onPreview:(pack:string)=>void;onFree:(pack:string)=>void}){
 const [store,setStore]=useState<PackCatalog|null>(null),[error,setError]=useState(''),[pending,setPending]=useState<string|null>(null),[loadFailed,setLoadFailed]=useState(false);
 useEffect(()=>{const controller=new AbortController();fetch('/api/catalog',{signal:controller.signal}).then(async r=>{if(!r.ok)throw Error('Availability unavailable');return r.json()}).then(d=>{if(!Array.isArray(d.packs)||!Array.isArray(d.cards))throw Error('Invalid catalog');setStore(d)}).catch(e=>{if(e.name!=='AbortError')setLoadFailed(true)});return()=>controller.abort()},[]);
 const packs=storefrontPacks(store);
 async function buy(id:string){
  if(!packs.find(p=>p.id===id)?.canCheckout)return;
  setPending(id);setError('');
  try{
   let key=sessionStorage.getItem('checkout:'+id);if(!key){key=crypto.randomUUID();sessionStorage.setItem('checkout:'+id,key)}
   const r=await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(checkoutRequest(id,key))});const d=await r.json();
   if(!r.ok){if(r.status===409)sessionStorage.removeItem('checkout:'+id);throw Error(d.error||'Checkout is unavailable. Please try again.')}
   const url=new URL(d.url);if(url.protocol!=='https:'||url.hostname!=='checkout.stripe.com')throw Error('Checkout destination could not be verified.');window.location.assign(url.href);
  }catch(e){setError(e instanceof Error?e.message:'Checkout is unavailable.')}finally{setPending(null)}
 }
 return <section id="packs" className="integrated-pack-store" aria-labelledby="pack-store-title">
  <div className="pack-store-heading"><span className="eyebrow">SEASON ONE · THE FIRST FLIGHT</span><h1 id="pack-store-title">A world worth collecting.</h1><p>Choose your pack. Meet a new friend. Find your place in the Garden of Lands.</p><span className="store-beta-state">{store?.paymentsEnabled?store.paymentMode==='live'?'Secure digital pack checkout':'Test checkout only — no real purchases':'Public beta · purchases coming soon'}</span></div>
  <PackArtwork hero/>
  <div className="store-garden-title"><span>✧</span> GARDEN OF LANDS <span>✧</span></div>
  <div className="store-product-grid">{packs.map(p=>{const Icon=icons[p.id as keyof typeof icons];return <article key={p.id} data-pack-id={p.id} className={`store-product store-${p.id}`}>
   <div className="store-mobile-art"><PackArtwork packId={p.id}/></div><div className="store-product-body"><div className="store-pack-icon"><Icon size={25}/></div><span className="store-pack-tag">{p.tag}</span><h2>{p.name}</h2><p className="store-pack-description">{p.description}</p><dl><div><dt>Cards per pack</dt><dd>{p.count}</dd></div><div><dt>{p.rarityLabel}</dt><dd>{p.rarities}</dd></div></dl>
   {p.price?<p className="store-price">{p.price}{p.mode==='test'?' · test mode':''}</p>:<p className="store-price muted">Pricing available at launch</p>}
   <button className="store-buy" disabled={busy||!!pending||!p.canCheckout} onClick={()=>buy(p.id)} data-checkout-pack={p.id}>{pending===p.id?'OPENING CHECKOUT…':p.canCheckout?`${p.mode==='live'?'BUY':'TEST CHECKOUT —'} ${p.name.toUpperCase()}`:`COMING SOON — ${p.name.toUpperCase()}`}<ArrowRight size={18}/></button>
   <button className="store-preview" disabled={busy||!!pending} onClick={()=>onPreview(p.id)} aria-label={`Preview ${p.name} opening`}>Preview Pack Opening <span>· {p.previewCount} {p.previewCount===1?'card':'cards'}</span></button>
   {p.freeAvailable?<button className="store-free" disabled={busy||!!pending} onClick={()=>onFree(p.id)} aria-label={`Open free beta ${p.name}`}>Open free beta pack · save to My Nest</button>:<p className="store-free-note">{store?'Saved beta opening currently unavailable.':'Checking free beta availability…'}</p>}
  </div></article>})}</div>
  {error&&<p role="alert" className="notice error">{error} <Link href="/auth">Sign in</Link></p>}{loadFailed&&<p role="status">Pack availability could not be loaded. Purchases and saved openings are paused; animation previews remain available.</p>}
  <p className="store-disclosure">Digital cards only. Animation previews do not award cards. Available free beta openings require sign-in and save eligible pulls to My Nest; limits apply. Pack artwork celebrates the CardNest world and does not guarantee the featured character in a pull.</p>
  {store?.commonSupply?.capActive&&<p className="store-disclosure">Founding Common beta supply: {store.commonSupply.remaining.toLocaleString()} of {store.commonSupply.commonPullCap.toLocaleString()} awards remain.</p>}
  <div className="store-policy-links"><Link href="/terms">Terms</Link><Link href="/refunds">Refund information</Link><Link href="/support">Support</Link></div>
 </section>;
}
