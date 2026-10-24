'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
type Item={id:string;name:string;unit_price_cents:number|null;on_hand:number;reserved:number;sellable:boolean;verified_photos:boolean;photo_url:string|null};
type Order={id:string;item_id:string;quantity:number;email:string;unit_price_cents:number;status:string;created:string;paid_total_cents:number|null};
export default function CollectorInventoryAdmin(){
 const [items,setItems]=useState<Item[]>([]),[orders,setOrders]=useState<Order[]>([]);
 const [error,setError]=useState(''),[saving,setSaving]=useState('');
 async function load(){
  const r=await fetch('/api/admin/collector-inventory',{cache:'no-store'});const data=await r.json();
  if(!r.ok)throw Error(data.error||'Founder authorization required');
  setItems(data.items);setOrders(data.orders);
 }
 useEffect(()=>{void load().catch(e=>setError(e.message))},[]);
 function edit(id:string,patch:Partial<Item>){setItems(x=>x.map(i=>i.id===id?{...i,...patch}:i))}
 async function save(item:Item){
  if(!window.confirm('Confirm you personally counted the physical sealed boxes and checked the real photo is uploaded at the stated path?'))return;
  try{
   setError('');setSaving(item.id);
   const response=await fetch('/api/admin/collector-inventory',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({
    id:item.id,onHand:item.on_hand,unitPriceCents:item.unit_price_cents,
    photoUrl:item.photo_url,verifiedPhotos:true,sellable:item.sellable,confirmedPhysicalCount:true
   })});
   const result=await response.json();
   if(!response.ok)throw Error(result.error||'Cannot save');
   await load();
  }catch(e){setError(e instanceof Error?e.message:'Could not save')}finally{setSaving('')}
 }
 return <main className='shell' style={{maxWidth:980,paddingTop:60}}>
  <Link href='/admin/shop' className='brand'>✧ NestRune · Shop overview</Link>
  <h1 className='page-title'>Verified physical stock</h1>
  <p className='intro'>Only mark items sellable after counting sealed, physically held inventory and uploading a real product photo to <code>public/collector/real/</code>. This page does not activate Stripe live charging.</p>
  {error&&<p role='alert' className='notice'>{error}</p>}
  {items.map(item=><section className='panel' key={item.id} style={{margin:'15px 0',padding:18}}>
   <h2>{item.name}</h2><p>Reserved: <b>{item.reserved}</b>. Never count these units as free stock.</p>
   <label>Physical units on hand <input type='number' min='0' value={item.on_hand} onChange={e=>edit(item.id,{on_hand:Number(e.target.value)})}/></label>
   <label>Price in cents (e.g. 20000 = $200) <input type='number' min='50' value={item.unit_price_cents??''} onChange={e=>edit(item.id,{unit_price_cents:Number(e.target.value)})}/></label>
   <label>Path to actual inventory photo <input placeholder='/collector/real/your-photo.webp' value={item.photo_url??''} onChange={e=>edit(item.id,{photo_url:e.target.value})}/></label>
   <label><input type='checkbox' checked={item.sellable} onChange={e=>edit(item.id,{sellable:e.target.checked})}/> Permit checkout after all reviews</label>
   <p><button type='button' className='outline' disabled={saving===item.id||item.reserved>0} onClick={()=>void save(item)}>{saving===item.id?'Saving...':'Save verified inventory'}</button></p>
  </section>)}
  <p><button type='button' className='outline' onClick={async()=>{try{setError('');const res=await fetch('/api/admin/collector-reconcile',{method:'POST'});const data=await res.json();if(!res.ok)throw Error(data.error||'Reconciliation failed');setError('Checked '+data.checked+' older checkouts. Paid: '+data.paid+'. Expired: '+data.expired+'. Requires review: '+data.skipped+'.');await load()}catch(e){setError(e instanceof Error?e.message:'Unable to reconcile')}}}>Reconcile expired or delayed Stripe orders</button></p>
  <h2>Recent collector orders</h2><div className='panel'>{orders.length?orders.map(o=><p key={o.id}>{new Date(o.created).toLocaleDateString()} · {o.item_id} × {o.quantity} · <strong>{o.status}</strong> · {o.email} {o.paid_total_cents!=null?' · $'+(o.paid_total_cents/100).toFixed(2):''}</p>):<p>None yet.</p>}</div>
 </main>;
}
