'use client';
import {useState} from 'react';
import Link from 'next/link';
import {createAuthClient} from '@neondatabase/auth/next';
const client=createAuthClient();

export default function Auth(){
 const [mode,setMode]=useState<'signin'|'signup'>('signin');
 const [name,setName]=useState('');
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 const [busy,setBusy]=useState(false);

 function switchMode(next:'signin'|'signup'){
  setMode(next);setError('');setMessage('');
 }

 async function sendSetupLink(){
  if(!email){setError('Enter your email first.');return}
  setBusy(true);setError('');setMessage('');
  try{
   const r=await client.requestPasswordReset({
    email,
    redirectTo:window.location.origin+'/auth/reset'
   });
   if(r.error)setError(r.error.message||'Could not send the password setup email.');
   else setMessage('Check your email for the secure NestRune password setup link.')
  }catch{
   setError('Could not send the password setup email. Please retry.')
  }finally{setBusy(false)}
 }

 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError('');setMessage('');
  try{
   if(mode==='signup'){
    const r=await client.signUp.email({name:name.trim()||'Collector',email,password});
    if(r.error){setError(r.error.message||'Could not create your beta account.');return}
    window.location.assign('/#My%20Nest');
    return
   }
   const r=await client.signIn.email({email,password});
   if(r.error)setError(r.error.message||'Could not sign in');
   else window.location.assign('/#My%20Nest')
  }catch{
   setError(mode==='signup'?'Could not create your beta account. Please retry.':'Could not sign in. Please retry.')
  }finally{setBusy(false)}
 }

 return <main className="shell" style={{maxWidth:520,paddingTop:80}}>
  <Link className="brand" href="/">✧ NestRune</Link>
  <h1 className="page-title">{mode==='signup'?'Join the First Flight.':'Welcome to your nest.'}</h1>
  <p>{mode==='signup'?'Create a free beta account to save Guardians, open beta packs, and keep Rune Dungeon progress across devices.':'Sign in to continue building your NestRune collection and progression.'}</p>

  <div className="panel" style={{display:'flex',gap:8,flexDirection:'row',padding:8,marginBottom:16}}>
   <button type="button" className={mode==='signin'?'gold':'outline'} style={{flex:1}} onClick={()=>switchMode('signin')} disabled={busy}>Sign in</button>
   <button type="button" className={mode==='signup'?'gold':'outline'} style={{flex:1}} onClick={()=>switchMode('signup')} disabled={busy}>Create beta account</button>
  </div>

  <form className="panel" onSubmit={submit}>
   {mode==='signup'&&<label>Display name<input type="text" autoComplete="name" maxLength={80} value={name} onChange={e=>setName(e.target.value)}/></label>}
   <label>Email<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
   <label>Password<input type="password" minLength={8} autoComplete={mode==='signup'?'new-password':'current-password'} required value={password} onChange={e=>setPassword(e.target.value)}/></label>
   {mode==='signup'&&<small>Use at least 8 characters. Beta accounts are free; paid packs remain disabled during launch testing.</small>}
   {error&&<p role="alert">{error}</p>}
   {message&&<p role="status">{message}</p>}
   <button className="gold" disabled={busy}>{busy?(mode==='signup'?'Creating account…':'Signing in…'):(mode==='signup'?'Create free beta account':'Sign in')}</button>
   {mode==='signin'&&<button type="button" className="outline" disabled={busy} onClick={sendSetupLink}>Set or reset password by email</button>}
  </form>
  <p><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></p>
 </main>
}
