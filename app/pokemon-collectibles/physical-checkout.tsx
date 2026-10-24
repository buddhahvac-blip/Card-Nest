'use client';
import {useEffect,useState} from 'react';
type Item={id:string;name:string;unitPriceCents:number;available:number;photoUrl:string};
type Status={checkoutEnabled:boolean;mode:'test'|'live';items:Item[]};
export default function PhysicalCheckout(){
 const [status,setStatus]=useState<Status|null>(null);
 const [itemId,setItemId]=useState('');
 const [quantity,setQuantity]=useState(1);
 const [email,setEmail]=useState('');
 const [confirm,setConfirm]=useState(false);
 const [pending,setPending]=useState(false);
 const [error,setError]=useState('');
 const [requestKey,setRequestKey]=useState('');
 const [returned,setReturned]=useState(false);
 useEffect(()=>{
  setReturned(new URLSearchParams(window.location.search).get('checkout')==='returned');
  fetch('/api/shop/physical-checkout',{cache:'no-store'}).then(x=>x.json()).then((data:Status)=>{
   setStatus(data);if(data.items.length)setItemId(data.items[0].id);
  }).catch(()=>setStatus({checkoutEnabled:false,mode:'test',items:[]}));
 },[]);
 const available=status?.items.filter(i=>i.available>0)||[];
 const selected=available.find(i=>i.id===itemId)||available[0];
 async function checkout(){
  if(!selected||!confirm||!email.trim())return;
  setPending(true);setError('');
  const key=requestKey||crypto.randomUUID();setRequestKey(key);
  try{
   const response=await fetch('/api/shop/physical-checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
    itemId:selected.id,quantity,email,requestKey:key
   })});
   const data=await response.json();
   if(!response.ok)throw Error(data.error||'Unable to begin checkout');
   if(typeof data.url!=='string'||!data.url.startsWith('https://checkout.stripe.com/'))throw Error('Unrecognized payment URL');
   window.location.assign(data.url);
  }catch(e){setError(e instanceof Error?e.message:'Checkout unavailable');setPending(false)}
 }
 if(returned)return <section className='ns-request' style={{display:'block'}}><h2>Payment confirmation pending</h2><p>We verify orders using Stripe's signed payment notification, not a browser redirect. Contact support if you need assistance.</p></section>;
 if(!status?.checkoutEnabled||!available.length)return null;
 return <section className='ns-request' aria-label='Secure physical Pokémon checkout'>
  <div><span className='ns-request-kicker'>STRIPE SECURE CHECKOUT</span><h2>Verified, in-stock collectibles</h2><p>Card information is entered on Stripe, never NestRune. Shipping and tax appear before payment.</p>
  {status.mode==='test'&&<p>TEST MODE — no real charges</p>}</div>
  <div style={{display:'grid',gap:12}}>
   <label>Product <select value={selected?.id||''} onChange={e=>{setItemId(e.target.value);setRequestKey('')}}>{available.map(i=><option value={i.id} key={i.id}>{i.name+' - $'+(i.unitPriceCents/100).toFixed(2)+' - '+i.available+' left'}</option>)}</select></label>
   {selected?.photoUrl&&<img src={selected.photoUrl} alt={'Real stock photo: '+selected.name} width={220} height={180} style={{objectFit:'contain'}}/>}
   <label>Quantity <input type='number' min={1} max={Math.min(4,selected?.available||1)} value={quantity} onChange={e=>{setQuantity(Number(e.target.value));setRequestKey('')}}/></label>
   <label>Email for payment receipt <input type='email' required autoComplete='email' value={email} onChange={e=>{setEmail(e.target.value);setRequestKey('')}}/></label>
   <label><input type='checkbox' checked={confirm} onChange={e=>setConfirm(e.target.checked)}/> I reviewed the actual stock photo, and understand that Stripe will show shipping and tax before payment.</label>
   <button disabled={!confirm||pending||!selected||quantity<1||quantity>Math.min(4,selected.available)||!email.includes('@')} type='button' onClick={()=>void checkout()}>{pending?'Opening Stripe...':status.mode==='test'?'TEST SECURE CHECKOUT':'CHECK OUT WITH STRIPE'}</button>
   {error&&<p role='alert'>{error}</p>}
  </div>
 </section>;
}
