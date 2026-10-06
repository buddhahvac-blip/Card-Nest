'use client';
import {useEffect,useState} from 'react';
import {trackBeta} from '@/lib/client-analytics';

const categories=[
 ['account','Account or sign-in'],
 ['collection','My Nest or collection'],
 ['affiliate','Affiliate shopping'],
 ['bug','Bug or technical issue'],
 ['privacy','Privacy or data request'],
 ['general','General question']
] as const;

export default function SupportForm(){
 useEffect(()=>{trackBeta('support-view')},[]);
 const [form,setForm]=useState({name:'',email:'',category:'general',subject:'',message:'',website:''});
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [ticket,setTicket]=useState('');
 function field(key:string,value:string){setForm({...form,[key]:value});setError('')}
 async function submit(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError('');
  try{
   const r=await fetch('/api/support',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
   const d=await r.json();
   if(!r.ok)throw Error(d.error||'Support request could not be submitted.');
   setTicket(d.code);
   setForm({name:'',email:'',category:'general',subject:'',message:'',website:''});
  }catch(e:any){setError(e.message)}finally{setBusy(false)}
 }
 if(ticket)return <section className="panel support-success" aria-live="polite"><span className="tag">REQUEST RECEIVED</span><h2>{ticket}</h2><p>Your NestRune support request is saved. Keep this ticket number for reference. During public beta, our response target is within two business days, though complex issues may take longer.</p><button className="outline" onClick={()=>setTicket('')}>Submit another request</button></section>;
 return <form className="panel studio-form support-form" onSubmit={submit}>
  <div className="wide"><h2>Contact NestRune Support</h2><p>Tell us what happened and we’ll create a ticket. Please do not send passwords, full payment-card numbers, tax IDs, recovery codes, or banking information.</p></div>
  <label>Your name<input required minLength={2} maxLength={80} value={form.name} onChange={e=>field('name',e.target.value)} autoComplete="name"/></label>
  <label>Email<input required type="email" maxLength={254} value={form.email} onChange={e=>field('email',e.target.value)} autoComplete="email"/></label>
  <label>What can we help with?<select value={form.category} onChange={e=>field('category',e.target.value)}>{categories.map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></label>
  <label>Subject<input required minLength={3} maxLength={120} value={form.subject} onChange={e=>field('subject',e.target.value)}/></label>
  <label className="wide">Message<textarea required minLength={20} maxLength={4000} value={form.message} onChange={e=>field('message',e.target.value)} placeholder="Include the page or feature, what you expected, and what happened."/></label>
  <label className="support-honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={e=>field('website',e.target.value)}/></label>
  <div className="wide actions"><button className="gold" disabled={busy}>{busy?'Creating ticket…':'Create support ticket'}</button></div>
  {error&&<div className="wide notice error" role="alert">{error}</div>}
  <p className="wide disclaimer">Submitting this form stores your name, email, category, subject, message, ticket status, and timestamps so NestRune can respond and manage the request.</p>
 </form>
}
