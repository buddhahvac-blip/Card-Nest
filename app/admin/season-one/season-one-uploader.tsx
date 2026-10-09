'use client';
import {useMemo,useState} from 'react';

type Card={id:string;number:number;name:string;theme:string;rarity:string;artStatus:string;releaseStatus:string;packEligible:boolean};
type BulkResult={file:string;number:number|null;cardName:string|null;status:'PASS'|'FAIL'|'WAITING';reason:string};

export default function SeasonOneUploader({cards}:{cards:Card[]}){
 const [selected,setSelected]=useState(cards.find(c=>!c.packEligible)?.id||cards[0]?.id||'');
 const [file,setFile]=useState<File|null>(null);
 const [preview,setPreview]=useState('');
 const [message,setMessage]=useState('');
 const [busy,setBusy]=useState(false);
 const [state,setState]=useState(cards);
 const [bulkResults,setBulkResults]=useState<BulkResult[]>([]);
 const [bulkProgress,setBulkProgress]=useState({done:0,total:0});
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
  const images=Array.from(files);
  const seen=new Set<number>();
  const prepared=images.map(image=>{
   const match=image.name.match(/^(\d{3})(?:\D|$)/);
   const number=match?Number(match[1]):null;
   const target=number?state.find(c=>c.number===number):undefined;
   let reason='';
   if(!number)reason='Filename must start with a 3-digit card number, for example 031.webp.';
   else if(number<1||number>369)reason='Card number must be between 001 and 369.';
   else if(seen.has(number))reason='Duplicate card number in this upload batch.';
   else if(!target)reason='No matching Season One card slot was found.';
   if(number)seen.add(number);
   return {image,number,target,reason};
  });
  setBulkResults(prepared.map(item=>({
   file:item.image.name,
   number:item.number,
   cardName:item.target?.name||null,
   status:item.reason?'FAIL':'WAITING',
   reason:item.reason
  })));
  setBulkProgress({done:0,total:prepared.length});
  setBusy(true);
  let passed=0,failed=prepared.filter(item=>item.reason).length;
  try{
   for(let i=0;i<prepared.length;i++){
    const item=prepared[i];
    if(item.reason||!item.target){
     setBulkProgress({done:i+1,total:prepared.length});
     continue;
    }
    try{
     const d=await upload(item.target.id,item.image);
     passed++;
     const detail=d.qc?d.qc.width+'×'+d.qc.height+' · '+d.qc.megabytes+' MB':'Image accepted';
     const warning=Array.isArray(d.qc?.warnings)&&d.qc.warnings.length?' · '+d.qc.warnings.join(' '):'';
     setBulkResults(current=>current.map((row,index)=>index===i?{...row,status:'PASS',reason:detail+warning}:row));
    }catch(error){
     failed++;
     setBulkResults(current=>current.map((row,index)=>index===i?{...row,status:'FAIL',reason:error instanceof Error?error.message:'Upload failed'}:row));
    }
    setBulkProgress({done:i+1,total:prepared.length});
   }
   setMessage('Founder bulk check complete: '+passed+' PASS · '+failed+' FAIL. PASS cards were founder-approved and integrated automatically.');
  }finally{
   setBusy(false);
  }
 }

 return <div style={{display:'grid',gap:24}}>
  <section style={{display:'grid',gap:14,padding:20,border:'1px solid #ffffff22',borderRadius:18,background:'#0b282e'}}>
   <div><span className="eyebrow">FOUNDER UPLOAD PATHWAY</span><h2 style={{margin:'6px 0'}}>Founder upload → fast check → live gameplay</h2><p style={{color:'#b9cec7'}}>Anything uploaded here is recorded as a Founder Upload. PASS cards are founder-approved automatically and added to Season One, free pack pulls, Nest Battles, and the Rune Dungeon eligible roster. FAIL cards are blocked with a reason. Paid sales stay off.</p></div>
   <label>Season One slot<select value={selected} onChange={e=>setSelected(e.target.value)} style={{display:'block',width:'100%',marginTop:6,padding:12}}>{state.map(c=><option key={c.id} value={c.id}>#{String(c.number).padStart(3,'0')} · {c.name} · {c.theme} · {c.rarity}</option>)}</select></label>
   {card&&<div style={{display:'flex',gap:12,flexWrap:'wrap',fontSize:12}}><strong>#{String(card.number).padStart(3,'0')} {card.name}</strong><span>{card.theme}</span><span>{card.rarity}</span><span>{card.packEligible?'PACK ELIGIBLE':'NOT YET UPLOADED'}</span></div>}
   <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>chooseFile(e.target.files?.[0]||null)}/>
   {preview&&<img src={preview} alt="Upload preview" style={{width:'min(320px,100%)',aspectRatio:'3/4',objectFit:'cover',borderRadius:14}}/>}
   <button className="gold" disabled={busy||!file||!card} onClick={submit}>{busy?'Checking Founder Upload…':'Check + publish Founder Upload'}</button>
  </section>
  <section style={{display:'grid',gap:12,padding:20,border:'1px solid #ffffff18',borderRadius:18,background:'#082127'}}>
   <div><span className="eyebrow">FOUNDER BULK MODE</span><h3 style={{margin:'6px 0'}}>Drop many cards → Founder PASS or FAIL</h3><p style={{color:'#b9cec7',margin:0}}>Name each file with its 3-digit Season One number first, such as <strong>031.webp</strong>. Every file uses the exact same Founder Upload pathway. PASS cards are founder-approved and integrated automatically; FAIL cards are skipped with a reason.</p></div>
   <input type="file" multiple accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={e=>void bulk(e.target.files)}/>
   {bulkProgress.total>0&&<div style={{display:'grid',gap:6}}><strong>{busy?'Checking cards…':'Bulk check complete'} · {bulkProgress.done}/{bulkProgress.total}</strong><div style={{height:8,borderRadius:99,background:'#ffffff18',overflow:'hidden'}}><div style={{height:'100%',width:Math.round((bulkProgress.done/bulkProgress.total)*100)+'%',background:'#d8b96d'}}/></div></div>}
   {bulkResults.length>0&&<div style={{display:'grid',gap:8,maxHeight:420,overflow:'auto'}}>{bulkResults.map((result,index)=><div key={result.file+'-'+index} style={{display:'grid',gridTemplateColumns:'72px 1fr',gap:10,padding:'10px 12px',borderRadius:12,background:result.status==='PASS'?'#12382f':result.status==='FAIL'?'#3a1f25':'#132b31',border:'1px solid #ffffff14'}}>
    <strong style={{color:result.status==='PASS'?'#9ee6bd':result.status==='FAIL'?'#ffaaaa':'#d9e6e1'}}>{result.status}</strong>
    <div><div><strong>{result.number?('#'+String(result.number).padStart(3,'0')+' '):''}{result.cardName||result.file}</strong></div><small style={{color:'#b9cec7'}}>{result.file}{result.reason?' · '+result.reason:''}</small></div>
   </div>)}</div>}
  </section>
  {message&&<p className="notice">{message}</p>}
 </div>;
}
