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
  if(!r.ok)throw Error(d.error||'Upload failed');
  setState(current=>current.map(c=>c.id===cardId?{...c,artStatus:'live',releaseStatus:'preview',packEligible:true}:c));
  return d;
 }

 async function submit(){
  if(!card||!file)return;
  setBusy(true);
  try{
   const d=await upload(card.id,file);
   setMessage(d.message);
   chooseFile(null);
  }catch(e){setMessage((e as Error).message)}
  finally{setBusy(false)}
 }

 async function bulk(files:FileList|null){
  if(!files?.length)return;
  setBusy(true);
  let ok=0,failed=0;
  for(const image of Array.from(files)){
   const match=image.name.match(/^(\d{3})/);
   const number=match?Number(match[1]):0;
   const target=state.find(c=>c.number===number);
   if(!target){failed++;continue}
   try{await upload(target.id,image);ok++}catch{failed++}
  }
  setMessage('Bulk upload finished: '+ok+' added to pack pool'+(failed?', '+failed+' skipped/failed':'' )+'.');
  setBusy(false);
 }

 return <div style={{display:'grid',gap:24}}>
  <section style={{display:'grid',gap:14,padding:20,border:'1px solid #ffffff22',borderRadius:18,background:'#0b282e'}}>
   <div><span className="eyebrow">SEASON ONE CARD STUDIO</span><h2 style={{margin:'6px 0'}}>Upload one card</h2><p style={{color:'#b9cec7'}}>Successful uploads become collectible and pack eligible immediately for free beta and Rune Dungeon rewards. Paid sales stay off until a separate release decision.</p></div>
   <label>Season One slot<select value={selected} onChange={e=>setSelected(e.target.value)} style={{display:'block',width:'100%',marginTop:6,padding:12}}>{state.map(c=><option key={c.id} value={c.id}>#{String(c.number).padStart(3,'0')} · {c.name} · {c.theme} · {c.rarity}</option>)}</select></label>
   {card&&<div style={{display:'flex',gap:12,flexWrap:'wrap',fontSize:12}}><strong>#{String(card.number).padStart(3,'0')} {card.name}</strong><span>{card.theme}</span><span>{card.rarity}</span><span>{card.packEligible?'PACK ELIGIBLE':'NOT YET UPLOADED'}</span></div>}
   <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>chooseFile(e.target.files?.[0]||null)}/>
   {preview&&<img src={preview} alt="Upload preview" style={{width:'min(320px,100%)',aspectRatio:'3/4',objectFit:'cover',borderRadius:14}}/>}
   <button className="gold" disabled={busy||!file||!card} onClick={submit}>{busy?'Uploading…':'Upload + add to pack pool'}</button>
  </section>
  <section style={{display:'grid',gap:12,padding:20,border:'1px solid #ffffff18',borderRadius:18,background:'#082127'}}>
   <h3 style={{margin:0}}>Bulk upload</h3>
   <p style={{color:'#b9cec7'}}>Name files with the card number first, for example <strong>031.webp</strong>, <strong>032.png</strong>, <strong>033.jpg</strong>. NestRune matches the number automatically.</p>
   <input type="file" multiple accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={e=>void bulk(e.target.files)}/>
  </section>
  {message&&<p className="notice">{message}</p>}
 </div>;
}
