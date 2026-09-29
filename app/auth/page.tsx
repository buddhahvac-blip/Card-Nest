'use client';
import {useState} from 'react';
import Link from 'next/link';
import {createAuthClient} from '@neondatabase/auth/next';
const client=createAuthClient();

export default function Auth(){
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 const [busy,setBusy]=useState(false);

 async function sendSetupLink(){
  if(!email){setError('Enter your email first.');return}
  setBusy(true);setError('');setMessage('');
  try{
   const r=await client.requestPasswordReset({
    email,
    redirectTo:window.location.origin+'/auth/reset'
   });
   if(r.error)setError(r.error.message||'Could not send the password setup email.');
   else setMessage('Check your email for the secure CardNest password setup link.')
  }catch{
   setError('Could not send the password setup email. Please retry.')
  }finally{setBusy(false)}
 }

 return <main className="shell" style={{maxWidth:520,paddingTop:80}}>
  <Link className="brand" href="/">✧ CardNest</Link>
  <h1 className="page-title">Welcome to your nest.</h1>
  <p>Sign in to save your guardians and manage your CardNest account. Public signup remains closed during launch review.</p>
  <form className="panel" onSubmit={async e=>{
   e.preventDefault();setBusy(true);setError('');setMessage('');
   try{
    const r=await client.signIn.email({email,password});
    if(r.error)setError(r.error.message||'Could not sign in');
    else window.location.assign('/#My%20Nest')
   }catch{setError('Could not sign in. Please retry.')}
   finally{setBusy(false)}
  }}>
   <label>Email<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
   <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>
   {error&&<p role="alert">{error}</p>}
   {message&&<p role="status">{message}</p>}
   <button className="gold" disabled={busy}>{busy?'Signing in…':'Sign in'}</button>
   <button type="button" className="outline" disabled={busy} onClick={sendSetupLink}>Set or reset password by email</button>
  </form>
  <p><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></p>
 </main>
}
