'use client';
import {useMemo,useState} from 'react';

export type InventoryItem={
  sku:string;title:string;category:string;product_type:string;status:string;
  on_hand:number;reserved:number;available:number;isLow:boolean;isSoldOut:boolean;
  unit_price_cents:number|null;unit_cost_cents:number|null;listing_verified:boolean;
};
function safeCsvCell(value:unknown){
  let raw=String(value??'');
  // Protect spreadsheet programs from formula injection in imported names and SKUs.
  if(/^[\s\u0000-\u001f]*[=+@-]/.test(raw))raw="'"+raw;
  return '"'+raw.replaceAll('"','""')+'"';
}
function money(cents:number|null){
  return cents===null?'Not set':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
}
export default function InventoryTable({items}:{items:InventoryItem[]}){
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('all');
  const [onlyLow,setOnlyLow]=useState(false);
  const matching=useMemo(()=>items.filter(p=>
    (category==='all'||p.category===category)&&
    (!onlyLow||p.isLow)&&
    [p.title,p.sku,p.status,p.product_type].some(s=>s.toLowerCase().includes(query.toLowerCase().trim()))
  ),[items,category,onlyLow,query]);

  function exportCsv(){
    const header=['SKU','Product','Category','Type','Visibility','Photo verified','On hand','Reserved','Available','Stock alert','Sell price USD','Unit cost USD'];
    const rows=matching.map(p=>[
      p.sku,p.title,p.category,p.product_type,p.status,p.listing_verified?'yes':'no',
      p.on_hand,p.reserved,p.available,p.isSoldOut?'sold out':p.isLow?'low':'ok',
      p.unit_price_cents===null?'':(p.unit_price_cents/100).toFixed(2),
      p.unit_cost_cents===null?'':(p.unit_cost_cents/100).toFixed(2)
    ]);
    const csv=[header,...rows].map(row=>row.map(safeCsvCell).join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    const anchor=document.createElement('a');
    anchor.href=url;anchor.download='nestrune-physical-stock.csv';document.body.append(anchor);anchor.click();anchor.remove();URL.revokeObjectURL(url);
  }
  const control={background:'#051c25',border:'1px solid #567e7e',borderRadius:8,color:'#f4ecd9',minHeight:42,padding:'10px 11px',fontSize:14} as const;
  return <section aria-labelledby="inventory-table-title" style={{border:'1px solid #477774',borderRadius:16,padding:20,marginTop:22,background:'#092c33'}}>
    <h2 id="inventory-table-title" style={{fontSize:24,marginTop:0}}>Physical catalog and availability</h2>
    <p style={{color:'#bdd4cf',lineHeight:1.5}}>Amounts are database records only, not storefront hard-coded quantities. A blank price means a product cannot be cleared for paid checkout.</p>
    <div style={{display:'flex',flexWrap:'wrap',gap:12,alignItems:'center',margin:'16px 0'}}>
      <label style={{display:'grid',gap:5,fontSize:12,color:'#e6cc94',flex:'1 1 190px'}}>Find SKU or product
        <input style={control} aria-label="Filter inventory" type="search" placeholder="Search inventory" value={query} onChange={e=>setQuery(e.target.value)}/>
      </label>
      <label style={{display:'grid',gap:5,fontSize:12,color:'#e6cc94'}}>Category
        <select style={control} value={category} onChange={e=>setCategory(e.target.value)}>
          <option value="all">All categories</option>
          <option value="pokemon">Pokémon</option>
          <option value="one_piece">One Piece</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label style={{fontSize:13,color:'#e6cc94',display:'flex',alignItems:'center',gap:8,marginTop:15}}>
        <input type="checkbox" checked={onlyLow} onChange={e=>setOnlyLow(e.target.checked)}/>Low-stock only
      </label>
      <button type="button" onClick={exportCsv} disabled={!matching.length} style={{...control,cursor:matching.length?'pointer':'not-allowed',marginTop:15}}>Export filtered CSV</button>
    </div>
    <p style={{color:'#c2d9d3',fontSize:12}}>{matching.length} of {items.length} SKU records</p>
    {matching.length===0?<p style={{padding:'16px 0',color:'#ead399'}}>No matching SKU records. Unverified products must be imported before sale.</p>:
      <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',textAlign:'left',fontSize:13}}>
        <thead><tr>{['Product / SKU','Category','Visibility','Price','Unit cost','On hand','Reserved','Available','Alert'].map(h=>
          <th key={h} scope="col" style={{padding:'12px 9px',borderBottom:'1px solid #6b8a83',whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
        <tbody>{matching.map(p=><tr key={p.sku}>
          <td style={{padding:'12px 9px',borderBottom:'1px solid #2a5352',minWidth:150}}>
            <strong>{p.title}</strong><div style={{color:'#a6c4c2',fontSize:11}}>{p.sku}</div>
          </td>
          <td style={{padding:'12px 9px',borderBottom:'1px solid #2a5352'}}>{p.category==='one_piece'?'One Piece':p.category==='pokemon'?'Pokémon':'Other'}</td>
          <td style={{padding:'12px 9px',borderBottom:'1px solid #2a5352'}}>{p.status}{!p.listing_verified&&<div style={{color:'#f0c886',fontSize:10}}>Not verified</div>}</td>
          <td style={{padding:'12px 9px',borderBottom:'1px solid #2a5352'}}>{money(p.unit_price_cents)}</td>
          <td style={{padding:'12px 9px',borderBottom:'1px solid #2a5352'}}>{money(p.unit_cost_cents)}</td>
          <td style={{padding:'12px 9px',borderBottom:'1px solid #2a5352'}}>{p.on_hand}</td>
          <td style={{padding:'12px 9px',borderBottom:'1px solid #2a5352'}}>{p.reserved}</td>
          <td style={{padding:'12px 9px',borderBottom:'1px solid #2a5352',fontWeight:700}}>{p.available}</td>
          <td style={{padding:'12px 9px',borderBottom:'1px solid #2a5352',color:p.isLow?'#f2c477':'#b8e2c0'}}>{p.isSoldOut?'Sold out':p.isLow?'Low':'OK'}</td>
        </tr>)}</tbody>
      </table></div>}
  </section>;
}
