'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {createAuthClient} from '@neondatabase/auth/next';
const client=createAuthClient();

export default function ResetPassword(){
 const [token,setToken]=useState('');
 const [password,setPassword]=useState('');
 const [confirm,setConfirm]=useState('');
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);

 useEffect(()=>{
  queueMicrotask(()=>setToken(new URLSearchParams(window.location.search).get('token')||''))
 },[]);

 return <main className="shell" style={{maxWidth:520,paddingTop:80}}>
  <Link className="brand" href="/">✧ CardNest</Link>
  <h1 className="page-title">Set your CardNest password.</h1>
  <p>Create a strong password for your account. This password is sent directly to Neon Auth and is never stored in CardNest application code.</p>
  <form className="panel" onSubmit={async e=>{
   e.preventDefault();setError('');
   if(!token){setError('This setup link is missing or invalid. Request a new one from the sign-in page.');return}
   if(password.length<12){setError('Use at least 12 characters.');return}
   if(password!==confirm){setError('Passwords do not match.');return}
   setBusy(true);
   try{
    const r=await client.resetPassword({newPassword:password,token});
    if(r.error)setError(r.error.message||'Could not set the password.');
    else window.location.assign('/auth')
   }catch{setError('Could not set the password. Request a new setup link and try again.')}
   finally{setBusy(false)}
  }}>
   <label>New password<input type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e=>setPassword(e.target.value)}/></label>
   <label>Confirm password<input type="password" autoComplete="new-password" minLength={12} required value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>
   {error&&<p role="alert">{error}</p>}
   <button className="gold" disabled={busy}>{busy?'Saving…':'Set password'}</button>
  </form>
 </main>
}
