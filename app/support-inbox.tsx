'use client';
import {useEffect,useState} from 'react';

type Ticket={id:string;code:string;name:string;email:string;category:string;subject:string;message:string;status:string;created:string;updated:string};
const labels:Record<string,string>={open:'Open','in-progress':'In progress',waiting:'Waiting',closed:'Closed'};

export default function SupportInbox(){
 const [tickets,setTickets]=useState<Ticket[]>([]);
 const [counts,setCounts]=useState<any[]>([]);
 const [error,setError]=useState('');
 const [busy,setBusy]=useState<string|null>(null);
 async function load(){
  try{const r=await fetch('/api/support');const d=await r.json();if(!r.ok)throw Error(d.error);setTickets(d.tickets||[]);setCounts(d.counts||[])}catch(e:any){setError(e.message)}
 }
 useEffect(()=>{void load()},[]);
 async function status(id:string,value:string){
  setBusy(id);setError('');
  try{const r=await fetch('/api/support',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status:value})});const d=await r.json();if(!r.ok)throw Error(d.error);await load()}catch(e:any){setError(e.message)}finally{setBusy(null)}
 }
 const count=(s:string)=>counts.find(x=>x.status===s)?.count||0;
 return <section>
  <div className="eyebrow">FOUNDER WORKSPACE · CUSTOMER CARE</div>
  <h1 className="page-title">Support Inbox</h1>
  <p className="intro">Customer tickets stay inside CardNest. Reply from cardnestsupport@gmail.com, then update the ticket status here. No automatic customer email is sent yet.</p>
  {error&&<div className="notice error">{error}</div>}
  <div className="stats"><div className="stat"><span>Open</span><strong>{count('open')}</strong></div><div className="stat"><span>In progress</span><strong>{count('in-progress')}</strong></div><div className="stat"><span>Waiting</span><strong>{count('waiting')}</strong></div></div>
  <div className="studio-list">{tickets.map(t=><article className="studio-job" key={t.id}>
   <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><span className="studio-status">{t.code}</span><span className="tag">{labels[t.status]||t.status}</span></div>
   <h3>{t.subject}</h3>
   <p><strong>{t.name}</strong> · <a href={'mailto:'+t.email}>{t.email}</a></p>
   <p className="disclaimer">{t.category} · {new Date(t.created).toLocaleString()}</p>
   <div className="draft">{t.message}</div>
   <div className="actions"><a className="gold" href={'mailto:'+t.email+'?subject='+encodeURIComponent('Re: ['+t.code+'] '+t.subject)}>Reply by email</a>{(['open','in-progress','waiting','closed'] as const).filter(x=>x!==t.status).map(x=><button key={x} className="outline" disabled={busy===t.id} onClick={()=>status(t.id,x)}>{labels[x]}</button>)}</div>
  </article>)}</div>
  {!tickets.length&&!error&&<div className="panel"><h2>No support tickets yet.</h2><p>New requests submitted through the public Support page will appear here.</p></div>}
 </section>
}
