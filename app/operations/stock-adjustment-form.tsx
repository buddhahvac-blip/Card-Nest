'use client';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
type Product={sku:string;title:string;available:number};
type Reason='receipt'|'return'|'live_sale'|'damage';
type Source='manual'|'supplier'|'whatnot'|'ebay';
export default function StockAdjustmentForm({products}:{products:Product[]}){
  const router=useRouter();
  const [sku,setSku]=useState(products[0]?.sku??'');
  const [reason,setReason]=useState<Reason>('live_sale');
  const [source,setSource]=useState<Source>('whatnot');
  const [quantity,setQuantity]=useState(1);
  const [reference,setReference]=useState('');
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState('');
  const [error,setError]=useState(false);
  const selected=products.find(p=>p.sku===sku);
  function chooseReason(next:Reason){
    setReason(next);setSource(next==='live_sale'?'whatnot':next==='receipt'?'supplier':'manual');
  }
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(busy)return;
    setNotice('');setError(false);
    if(!products.find(p=>p.sku===sku)){setError(true);setNotice('Select a valid stocked SKU.');return}
    if(!Number.isSafeInteger(quantity)||quantity<1||quantity>1000){setError(true);setNotice('Enter a valid quantity from 1 to 1,000.');return}
    const negative=reason==='live_sale'||reason==='damage';
    if(negative&&quantity>(selected?.available??0)){setError(true);setNotice('This quantity is greater than the currently shown unreserved stock. Refresh the dashboard.');return}
    if(!window.confirm(`Record ${reason.replace('_',' ')} for ${quantity} × ${selected?.title}? This will ${negative?'reduce':'increase'} physical stock and create an audit entry.`))return;
    setBusy(true);
    try{
      const response=await fetch('/api/operations/stock',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sku,reason,source,reference:reference.trim(),quantity})});
      const data=await response.json() as {error?:string;duplicate?:boolean;available?:number};
      if(!response.ok)throw new Error(data.error||'Could not record stock adjustment.');
      setNotice(data.duplicate?`Already recorded — no stock was changed. Available: ${data.available}.`:`Recorded. Available: ${data.available}. Refreshing dashboard.`);
      setQuantity(1);setReference('');router.refresh();
    }catch(e){setError(true);setNotice(e instanceof Error?e.message:'Could not record the change.')}finally{setBusy(false)}
  }
  const field={display:'grid',gap:6,minWidth:0,fontSize:13,color:'#e8c987',fontWeight:700} as const;
  const control={width:'100%',minHeight:42,borderRadius:8,border:'1px solid #537f7e',background:'#071d26',color:'#fff6e6',padding:'10px',fontSize:15} as const;
  return <section aria-labelledby="stock-adjust-title" style={{border:'1px solid #5a8580',borderRadius:16,padding:20,marginTop:18,background:'#0c3138'}}>
    <h2 id="stock-adjust-title" style={{margin:'0 0 8px',fontSize:23}}>Record inventory movement</h2>
    <p style={{color:'#b6d2ce',fontSize:13,lineHeight:1.6}}>Owner-only manual log. Use the exact Whatnot or eBay order ID or supplier receipt as a unique reference; repeating it will not double-deduct stock. Marketplace stock is not automatically synchronized.</p>
    <form onSubmit={submit} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:13,alignItems:'end'}}>
      <label style={field}>Product / SKU
        <select style={control} value={sku} onChange={e=>setSku(e.target.value)} required disabled={!products.length||busy}>
          {products.length===0?<option value="">Import products first</option>:products.map(p=><option key={p.sku} value={p.sku}>{p.title} — {p.sku} ({p.available} free)</option>)}
        </select>
      </label>
      <label style={field}>Movement
        <select style={control} value={reason} onChange={e=>chooseReason(e.target.value as Reason)} disabled={!products.length||busy}>
          <option value="live_sale">Livestream / manual sale (−)</option>
          <option value="receipt">New stock received (+)</option>
          <option value="return">Returned to stock (+)</option>
          <option value="damage">Damaged / written off (−)</option>
        </select>
      </label>
      <label style={field}>Source
        <select style={control} value={source} onChange={e=>setSource(e.target.value as Source)} disabled={!products.length||busy}>
          <option value="whatnot">Whatnot</option><option value="ebay">eBay</option><option value="supplier">Supplier</option><option value="manual">Manual / other</option>
        </select>
      </label>
      <label style={field}>Units
        <input style={control} type="number" min={1} max={1000} step={1} value={quantity} onChange={e=>setQuantity(Number(e.target.value))} required disabled={!products.length||busy}/>
      </label>
      <label style={field}>Unique order or receipt reference
        <input style={control} type="text" required minLength={4} maxLength={120} value={reference} onChange={e=>setReference(e.target.value)} disabled={!products.length||busy} placeholder="e.g. Whatnot-123456"/>
      </label>
      <button type="submit" disabled={!products.length||busy} style={{...control,background:!products.length?'#526569':'#d5ad63',color:'#09262d',fontWeight:800,cursor:!products.length?'not-allowed':'pointer'}}> {busy?'Recording…':'Review & record'}</button>
    </form>
    {notice&&<p role="status" style={{color:error?'#ffc7c7':'#c5f3d1',marginBottom:0}}>{notice}</p>}
  </section>;
}
