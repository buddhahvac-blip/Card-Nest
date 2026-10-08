'use client';
import {useMemo,useState} from 'react';

type Card={id:string;number:number;name:string;theme:string;rarity:string;artStatus:string;releaseStatus:string;packEligible:boolean};

export default function SeasonOneUploader({cards}:{cards:Card[]}){
 const [selected,setSelected]=useState(cards.find(c=>!c.packEligible)?.id||cards[0]?.id||'');
 const [file,setFile]=useState<File|null>(null);
 const [preview,setPreview]=useState('');
 const [message,setMessage]=useState('');
 const [busy,setBusy]=useState(false);
 const [state,setState]=useState(cards);
 const card=useMemo(()=>state.find(c=>c.id===selected),[state,selected]);

 function chooseFile(next:File|null){
  setFile(next);
  setMessage('');
  if(preview)URL.revokeObjectURL(preview);
  setPreview(next?URL.createObjectURL(next):'');
 }

 async function upload(cardId:string,image:File){
  const body=new FormData();
  body.set('cardId',cardId);
  body.set('file',image);
  const r=await fetch('/api/admin/season-one/upload',{method:'POST',body});
  const d=await r.json();
  if(!r.ok){const reasons=Array.isArray(d.qc?.reasons)?d.qc.reasons.join(' '):'';throw Error((d.error||'Upload failed')+(reasons?' '+reasons:''))}
  setState(current=>current.map(c=>c.id===cardId?{...c,artStatus:'live',releaseStatus:'preview',packEligible:true}:c));
  return d;
 }

 async function submit(){
  if(!card||!file)return;
  setBusy(true);
  try{
   const d=await upload(card.id,file);
   const details=d.qc?` ${d.qc.width}×${d.qc.height} · ${d.qc.megabytes} MB.`:'';
   const warning=Array.isArray(d.qc?.warnings)&&d.qc.warnings.length?' '+d.qc.warnings.join(' '):'';
   setMessage(d.message+details+warning);
   chooseFile(null);
  }catch(e){setMessage((e as Error).message)}
  finally{setBusy(false)}
 }

 async function bulk(files:FileList|null){
  if(!files?.length)return;
  setBusy(true);
  let ok=0,failed=0;const failures:string[]=[];
  for(const image of Array.from(files)){
   const match=image.name.match(/^(\d{3})/);
   const number=match?Number(match[1]):0;
   const target=state.find(c=>c.number===number);
   if(!target){failed++;failures.push(image.name+': no matching Season One number');continue}
   try{await upload(target.id,image);ok++}catch(error){failed++;failures.push(image.name+': '+(error instanceof Error?error.message:'failed'))}
  }
  setMessage('Bulk upload finished: '+ok+' integrated'+(failed?', '+failed+' failed. '+failures.slice(0,5).join(' | '):'.'));
  setBusy(false);
 }

 return <div style={{display:'grid',gap:24}}>
  <section style={{display:'grid',gap:14,padding:20,border:'1px solid #ffffff22',borderRadius:18,background:'#0b282e'}}>
   <div><span className="eyebrow">SEASON ONE CARD INTEGRATION AGENT</span><h2 style={{margin:'6px 0'}}>Upload → fast check → integrate</h2><p style={{color:'#b9cec7'}}>Every upload gets an immediate PASS or FAIL with a reason. PASS cards are automatically added to free pack pulls, Nest Battles, and the Rune Dungeon eligible roster. Paid sales stay off until a separate release decision.</p></div>
   <label>Season One slot<select value={selected} onChange={e=>setSelected(e.target.value)} style={{display:'block',width:'100%',marginTop:6,padding:12}}>{state.map(c=><option key={c.id} value={c.id}>#{String(c.number).padStart(3,'0')} · {c.name} · {c.theme} · {c.rarity}</option>)}</select></label>
   {card&&<div style={{display:'flex',gap:12,flexWrap:'wrap',fontSize:12}}><strong>#{String(card.number).padStart(3,'0')} {card.name}</strong><span>{card.theme}</span><span>{card.rarity}</span><span>{card.packEligible?'PACK ELIGIBLE':'NOT YET UPLOADED'}</span></div>}
   <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>chooseFile(e.target.files?.[0]||null)}/>
   {preview&&<img src={preview} alt="Upload preview" style={{width:'min(320px,100%)',aspectRatio:'3/4',objectFit:'cover',borderRadius:14}}/>}
   <button className="gold" disabled={busy||!file||!card} onClick={submit}>{busy?'Checking + integrating…':'Check image + integrate card'}</button>
  </section>
  <section style={{display:'grid',gap:12,padding:20,border:'1px solid #ffffff18',borderRadius:18,background:'#082127'}}>
   <h3 style={{margin:0}}>Bulk upload</h3>
   <p style={{color:'#b9cec7'}}>Name files with the card number first, for example <strong>031.webp</strong>, <strong>032.png</strong>, <strong>033.jpg</strong>. Each file is checked separately; failed images are skipped and are not partially integrated.</p>
   <input type="file" multiple accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={e=>void bulk(e.target.files)}/>
  </section>
  {message&&<p className="notice">{message}</p>}
 </div>;
}
