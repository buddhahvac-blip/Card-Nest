'use client';
import {FormEvent,useState} from 'react';
import {MessageCircle,Sparkles} from 'lucide-react';
import {getBetaSession,trackBeta} from '@/lib/client-analytics';

type FormState={favoriteGuardian:string;wouldCollect:string;packFun:string;returnReason:string;nextPriority:string};
const initial:FormState={favoriteGuardian:'',wouldCollect:'maybe',packFun:'4',returnReason:'',nextPriority:'collecting'};

export default function FeedbackCard(){
 const [form,setForm]=useState(initial),[busy,setBusy]=useState(false),[sent,setSent]=useState(false),[error,setError]=useState('');
 async function submit(e:FormEvent){e.preventDefault();const session=getBetaSession();if(!session){setError('Feedback is unavailable in this browser session.');return}
  setBusy(true);setError('');
  try{
   const r=await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,packFun:Number(form.packFun),session})});
   const d:any=await r.json();if(!r.ok)throw Error(d.error||'Please try again.');
   setSent(true);trackBeta('feedback-submit');
  }catch(e:any){setError(e.message)}finally{setBusy(false)}
 }
 if(sent)return <section className="panel"><Sparkles size={22}/><h2>Thank you for shaping CardNest.</h2><p>Your anonymous beta feedback is now part of the evidence Nest Mind can summarize for founder review.</p></section>;
 return <section className="panel" id="feedback"><div className="eyebrow">HELP SHAPE CARDNEST</div><h2><MessageCircle size={21}/> Five quick questions</h2><p>Tell us what actually made you care. No email address is required and this form does not ask for your name.</p>
  <form onSubmit={submit} className="support-form">
   <label>Which guardian or card do you remember most?<input value={form.favoriteGuardian} onChange={e=>setForm({...form,favoriteGuardian:e.target.value})} maxLength={80} placeholder="Guardian name or card number"/></label>
   <label>Would you collect CardNest cards?<select value={form.wouldCollect} onChange={e=>setForm({...form,wouldCollect:e.target.value})}><option value="yes">Yes</option><option value="maybe">Maybe</option><option value="no">Not yet</option></select></label>
   <label>How fun was the pack-opening preview?<select value={form.packFun} onChange={e=>setForm({...form,packFun:e.target.value})}>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} / 5</option>)}</select></label>
   <label>What would make you come back?<textarea required minLength={10} maxLength={300} value={form.returnReason} onChange={e=>setForm({...form,returnReason:e.target.value})} placeholder="A reason to return tomorrow…"/></label>
   <label>What should CardNest focus on next?<select value={form.nextPriority} onChange={e=>setForm({...form,nextPriority:e.target.value})}><option value="collecting">Collecting & progress</option><option value="battles">Nest Battles</option><option value="stories">Stories & worldbuilding</option><option value="trading">Trading tools later</option><option value="customization">Customization</option></select></label>
   <button className="gold" disabled={busy}>{busy?'Saving feedback…':'Send anonymous feedback'}</button>{error&&<p role="alert" className="notice error">{error}</p>}
  </form>
 </section>;
}
