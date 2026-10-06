'use client';

import {useEffect} from 'react';
import Link from 'next/link';
import {ArrowRight,Sparkles,Swords,PackageOpen,ShieldCheck} from 'lucide-react';
import {trackBeta} from '@/lib/client-analytics';

function source(){
 try{
  const raw=new URLSearchParams(window.location.search).get('ref')||'direct';
  return raw.toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,64)||'direct';
 }catch{return 'direct'}
}

export default function JoinBeta(){
 useEffect(()=>{trackBeta('visit',source())},[]);
 return <main className="shell" style={{maxWidth:900,paddingTop:72,paddingBottom:72}}>
  <section className="panel" style={{padding:28}}>
   <span className="eyebrow">FOUNDING FLIGHT BETA · FIRST WAVE</span>
   <h1 className="page-title">Help shape NestRune before the world opens.</h1>
   <p>Join the free NestRune beta, collect Founding Flight Guardians, try Nest Battles, descend into the Rune Dungeon, and tell us what should improve next.</p>
   <div className="battle-pill-row" style={{marginTop:18}}>
    <span><PackageOpen size={14}/> Free beta packs</span>
    <span><Swords size={14}/> Nest Battles</span>
    <span><Sparkles size={14}/> Rune Dungeon</span>
    <span><ShieldCheck size={14}/> No paid advantage</span>
   </div>
   <div className="cn-hero-actions" style={{marginTop:24}}>
    <Link className="cn-primary-cta" href="/auth">CREATE FREE BETA ACCOUNT <ArrowRight size={17}/></Link>
    <Link className="cn-secondary-cta" href="/play">TRY A PRACTICE BATTLE</Link>
   </div>
   <p className="disclaimer" style={{marginTop:22}}>Beta rewards have no cash value. Real-money purchases remain disabled during this test phase. Search indexing is intentionally off while the first collector wave tests the experience.</p>
  </section>

  <section className="cn-path-section" style={{paddingTop:42}}>
   <div className="cn-section-intro">
    <span className="eyebrow">WHAT TO TEST</span>
    <h2>Three things we want early collectors to try.</h2>
   </div>
   <div className="cn-path-grid">
    <article className="cn-path-card"><span className="cn-path-number">01</span><PackageOpen size={30}/><span className="cn-path-kicker">COLLECT</span><strong>Open a free beta pack</strong><p>See whether the reveal, card art, and My Nest collection flow feel rewarding and clear.</p></article>
    <article className="cn-path-card featured"><span className="cn-path-number">02</span><Swords size={30}/><span className="cn-path-kicker">BATTLE</span><strong>Try Nest Battles</strong><p>Build a trio and test whether attacks, abilities, specials, audio, and strategy are easy to understand.</p></article>
    <article className="cn-path-card"><span className="cn-path-number">03</span><Sparkles size={30}/><span className="cn-path-kicker">EXPLORE</span><strong>Enter Rune Dungeon</strong><p>Clear a floor, earn Rune Energy, and tell us whether the mission loop makes you want to keep playing.</p></article>
   </div>
  </section>
 </main>
}
