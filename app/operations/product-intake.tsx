'use client';
import {useRouter} from 'next/navigation';
import {useState} from 'react';

type Category='pokemon'|'one_piece'|'other';
type ProductType='sealed'|'booster'|'slab'|'single'|'other';
type Language='en'|'jp'|'other';
function cents(value:string){
  if(value.trim()==='')return null;
  if(!/^\d+(?:\.\d{1,2})?$/.test(value.trim()))throw new Error('Enter prices as dollars with at most two decimals.');
  const cents=Math.round(Number(value.trim())*100);
  if(!Number.isSafeInteger(cents)||cents>100000000)throw new Error('Price is outside the supported range.');
  return cents;
}
export default function ProductIntake(){
  const router=useRouter();
  const [sku,setSku]=useState('');const [title,setTitle]=useState('');
  const [category,setCategory]=useState<Category>('pokemon');
  const [productType,setProductType]=useState<ProductType>('sealed');
  const [language,setLanguage]=useState<Language>('en');
  const [conditionNote,setConditionNote]=useState('');
  const [price,setPrice]=useState('');const [cost,setCost]=useState('');
  const [initialUnits,setInitialUnits]=useState(0);
  const [lowStockThreshold,setLowStockThreshold]=useState(2);
  const [countVerified,setCountVerified]=useState(false);
  const [busy,setBusy]=useState(false);const [notice,setNotice]=useState('');const [error,setError]=useState(false);
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();if(busy)return;setBusy(true);setError(false);setNotice('');
    try{
      if(initialUnits>0&&!countVerified)throw new Error('Physically count the items and check the confirmation box.');
      const response=await fetch('/api/operations/products',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        sku:sku.trim().toUpperCase(),title:title.trim(),category,productType,language,conditionNote,
        priceCents:cents(price),costCents:cents(cost),initialUnits,lowStockThreshold,countVerified
      })});
      const body=await response.json() as {error?:string;sku?:string};
      if(!response.ok)throw new Error(body.error||'Could not register the product.');
      setNotice(`Draft SKU ${body.sku} created with ${initialUnits} counted units. It is not buyable on the public site.`);
      setSku('');setTitle('');setPrice('');setCost('');setConditionNote('');setInitialUnits(0);setCountVerified(false);
      router.refresh();
    }catch(err){setError(true);setNotice(err instanceof Error?err.message:'Product could not be created.')}finally{setBusy(false)}
  }
  const control={background:'#071d26',color:'#f6eddd',border:'1px solid #5a827e',borderRadius:8,padding:'10px',width:'100%',minHeight:42,fontSize:14} as const;
  const label={fontSize:13,color:'#eed096',display:'grid',gap:6,fontWeight:700,minWidth:0} as const;
  return <details style={{marginTop:18,border:'1px solid #587e7b',borderRadius:16,background:'#0c3138',padding:'18px 20px'}}>
    <summary style={{cursor:'pointer',color:'#f3d89e',fontSize:21,fontWeight:700}}>Add verified physical SKU (draft only)</summary>
    <p style={{fontSize:13,color:'#c0d8d3',lineHeight:1.6}}>Use the label on the actual product to identify the exact language, variant and SKU. New entries stay unpublished and cannot accept checkout payments. Prices and costs are optional until confirmed.</p>
    <form onSubmit={submit} style={{display:'grid',gap:13}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:13}}>
        <label style={label}>SKU<input style={control} required minLength={3} maxLength={80} value={sku} onChange={e=>setSku(e.target.value)} placeholder="OP-ST34-EN"/></label>
        <label style={label}>Exact product title<input style={control} required minLength={3} maxLength={250} value={title} onChange={e=>setTitle(e.target.value)}/></label>
        <label style={label}>Category<select style={control} value={category} onChange={e=>setCategory(e.target.value as Category)}><option value="pokemon">Pokémon</option><option value="one_piece">One Piece</option><option value="other">Other</option></select></label>
        <label style={label}>Type<select style={control} value={productType} onChange={e=>setProductType(e.target.value as ProductType)}><option value="sealed">Sealed / boxes</option><option value="booster">Booster</option><option value="slab">Graded slab</option><option value="single">Raw single</option><option value="other">Other</option></select></label>
        <label style={label}>Language<select style={control} value={language} onChange={e=>setLanguage(e.target.value as Language)}><option value="en">English</option><option value="jp">Japanese</option><option value="other">Other / unknown</option></select></label>
        <label style={label}>Retail price (USD)<input style={control} type="text" inputMode="decimal" placeholder="Leave blank if unknown" value={price} onChange={e=>setPrice(e.target.value)}/></label>
        <label style={label}>Product cost (USD)<input style={control} type="text" inputMode="decimal" placeholder="Leave blank if unknown" value={cost} onChange={e=>setCost(e.target.value)}/></label>
        <label style={label}>Units physically counted<input style={control} type="number" min={0} max={1000} step={1} required value={initialUnits} onChange={e=>{setInitialUnits(Number(e.target.value));setCountVerified(false)}}/></label>
        <label style={label}>Low-stock alert threshold<input style={control} type="number" min={0} max={1000} step={1} required value={lowStockThreshold} onChange={e=>setLowStockThreshold(Number(e.target.value))}/></label>
      </div>
      <label style={label}>Condition or variant notes<textarea style={{...control,minHeight:72}} maxLength={1000} rows={2} value={conditionNote} onChange={e=>setConditionNote(e.target.value)} placeholder="Exact set, edition, condition, sealed status"/></label>
      {initialUnits>0&&<label style={{display:'flex',alignItems:'center',gap:10,color:'#eac985',fontSize:14}}>
        <input type="checkbox" required checked={countVerified} onChange={e=>setCountVerified(e.target.checked)}/>I physically counted {initialUnits} unit{initialUnits===1?'':'s'} of this exact SKU.</label>}
      <button type="submit" disabled={busy} style={{...control,cursor:busy?'wait':'pointer',background:'#d8b46f',color:'#08262d',fontWeight:900,maxWidth:320}}>{busy?'Saving draft…':'Add SKU to private inventory'}</button>
      {notice&&<p role="status" style={{color:error?'#ffc9c9':'#b9f5c7',margin:0}}>{notice}</p>}
    </form>
  </details>;
}
