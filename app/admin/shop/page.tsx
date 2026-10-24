'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';

type Stats={windowDays:number;visitorSessions:number;interestedSessions:number;inquiryClicks:number;completedPurchases:number|null;revenueCents:number|null;purchaseTrackingReady:boolean;note:string;recent:Array<{day:string;kind:string;events:number}>};
export default function CollectorMetrics(){
  const [stats,setStats]=useState<Stats|null>(null);
  const [message,setMessage]=useState('');
  async function load(){
    const response=await fetch('/api/shop/metrics',{cache:'no-store'});
    const json=await response.json();
    if(!response.ok)throw Error(json.error||'Could not read shop analytics');
    setStats(json);
  }
  useEffect(()=>{void load().catch(e=>setMessage(e.message))},[]);
  return <main className='shell' style={{maxWidth:920,paddingTop:70}}>
    <Link href='/' className='brand'>✧ NestRune</Link>
    <div className='eyebrow'>FOUNDER · POKÉMON STORE ANALYTICS</div>
    <h1 className='page-title'>Collector shop performance</h1>
    <p className='intro'>Private, privacy-conscious storefront activity over the past 30 days.</p>
    <button type='button' className='outline' onClick={()=>void load().catch(e=>setMessage(e.message))}>Refresh counts</button>
    {message&&<p className='notice' role='alert'>{message}</p>}
    {stats&&<><section className='panel' style={{marginTop:20}}>
      <h2>Store activity · {stats.windowDays} days</h2>
      <p>Visitor sessions: <strong>{stats.visitorSessions}</strong></p>
      <p>Sessions clicking an inquiry: <strong>{stats.interestedSessions}</strong></p>
      <p>Total inquiry clicks: <strong>{stats.inquiryClicks}</strong></p>
      <p>Inquiry rate by session: <strong>{stats.visitorSessions?Math.round(100*stats.interestedSessions/stats.visitorSessions):0}%</strong></p>
      <p>Completed purchases: <strong>{stats.purchaseTrackingReady?stats.completedPurchases:'Not yet trackable'}</strong></p>
      <p>Physical sales revenue: <strong>{stats.purchaseTrackingReady&&stats.revenueCents!=null?'$'+(stats.revenueCents/100).toFixed(2):'Not yet trackable'}</strong></p>
      <p className='disclaimer'>{stats.note}</p>
    </section><section className='panel' style={{marginTop:18}}>
      <h2>Recent event counts</h2>
      {stats.recent.length?stats.recent.map((r,i)=><p key={r.day+r.kind+i}>{r.day} · {r.kind==='collector-shop-visit'?'shop visits':'purchase inquiries'} · {r.events}</p>):<p>No events recorded yet.</p>}
    </section></>}
  </main>;
}
