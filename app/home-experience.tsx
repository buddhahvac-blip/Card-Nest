'use client';

import Image from 'next/image';
import {useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,Compass,PackageOpen,Sparkles,Swords,Volume2,VolumeX} from 'lucide-react';
import {GuardianCard} from './cards';
import {seasonCard} from '@/lib/season-manifest';

type Props={go:(page:string)=>void};

function scrollTo(id:string){
  document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});
}

export default function HomeExperience({go}:Props){
  const heroVideoRef=useRef<HTMLVideoElement|null>(null);
  const [heroMuted,setHeroMuted]=useState(true);
  const [videoFailed,setVideoFailed]=useState(false);
  const toggleHeroSound=()=>{const v=heroVideoRef.current;if(!v)return;const next=!v.muted;v.muted=next;setHeroMuted(next);if(v.paused)v.play().catch(()=>{})};
  const nestling=seasonCard('sproutling-001');
  const leafpaw=seasonCard('emberwing-002');

  return <>
    <section className="cn-world-hero cn-video-hero" aria-labelledby="nestrune-home-title">
      <Image className="cn-world-hero-image cn-world-hero-poster" src="/art/great-nest-world.webp" alt="" fill quality={95} preload sizes="100vw" aria-hidden="true"/>
      {!videoFailed&&<video ref={heroVideoRef} className="cn-world-hero-video" autoPlay muted loop playsInline preload="metadata" poster="/art/great-nest-world.webp" onError={()=>setVideoFailed(true)} aria-hidden="true"><source src="https://cdn.openart.ai/openart-uploads/production/attachment-transfers/96fcf5eb06b053081fd6542aaa0416b026035e80615bb55f0babc7a1d5bb2994.mp4" type="video/mp4"/></video>}
      <div className="cn-world-hero-shade" aria-hidden="true"/>
      <div className="cn-world-hero-glow" aria-hidden="true"/>
      <button className="cn-hero-sound" type="button" onClick={toggleHeroSound} aria-label={heroMuted?'Turn NestRune intro sound on':'Mute NestRune intro sound'}>{heroMuted?<VolumeX size={18}/>:<Volume2 size={18}/>}<span>{heroMuted?'Sound on':'Mute'}</span></button>
      <div className="cn-world-copy">
        <span className="cn-season-pill"><Sparkles size={14}/> SEASON ONE · THE FIRST FLIGHT · V3 VISION</span>
        <h1 id="nestrune-home-title">Collect the Guardians.<br/><span>Build your Nest.</span><br/>Enter the Battle.</h1>
        <p>Step into the Garden of Lands, discover original Guardians, grow a collection that feels personal, and bring your favorites into fast strategic Nest Battles.</p>
        <div className="cn-hero-actions">
          <button className="cn-primary-cta" onClick={()=>scrollTo('nestrune-paths')}>ENTER THE WORLD <ArrowRight size={17}/></button>
          <button className="cn-secondary-cta" onClick={()=>scrollTo('packs')}>OPEN A PACK</button>
          <Link className="cn-text-cta" href="/play">TRY NEST BATTLES ↗</Link>
        </div>
        <div className="cn-hero-proof" aria-label="NestRune Season One overview">
          <span><strong>369</strong> Season One Guardians</span>
          <span><strong>21</strong> Founding Guardians live</span>
          <span><strong>1</strong> connected world</span>
        </div>
      </div>
      <div className="cn-hero-card-stage" aria-label="Featured Season One Guardian">
        <div className="cn-hero-card-halo" aria-hidden="true"/>
        <div className="cn-hero-card"><GuardianCard id="sproutling-001" eager/></div>
        <div className="cn-hero-card-caption">
          <span>FIRST FLIGHT · #001</span>
          <strong>Nestling</strong>
          <small>Discover → Collect → Build → Battle</small>
        </div>
      </div>
      <div className="cn-world-caption">
        <span>✧</span>
        <div><strong>THE GARDEN OF LANDS</strong><small>A living world built around your collection.</small></div>
      </div>
    </section>

    <section className="cn-founder-strip" aria-label="Founding Flight crowdfunding">
      <div>
        <span className="eyebrow">FOUNDING FLIGHT · 21 GUARDIANS LIVE</span>
        <h2>Help NestRune grow from its first collection into a living world.</h2>
        <p>The first 21 illustrated Guardians are now the Founding Flight beta pool. Free beta pulls are live, while crowdfunding is being prepared to fund higher-resolution art, more Guardians, stronger Nest Battles, and the next Garden regions.</p>
      </div>
      <div className="cn-founder-actions">
        <Link className="cn-primary-cta" href="/founders">SEE THE FOUNDING FLIGHT <ArrowRight size={17}/></Link>
        <button className="cn-secondary-cta" onClick={()=>scrollTo('packs')}>TRY THE 21-CARD POOL</button>
      </div>
    </section>

    <section className="cn-path-section" id="nestrune-paths" aria-labelledby="choose-journey-title">
      <div className="cn-section-intro">
        <span className="eyebrow">CHOOSE YOUR JOURNEY</span>
        <h2 id="choose-journey-title">How will you enter NestRune?</h2>
        <p>Start with the part that excites you. Every path connects back to the same world, collection, and future battle system.</p>
      </div>
      <div className="cn-path-grid">
        <button className="cn-path-card" onClick={()=>scrollTo('garden-themes')}>
          <span className="cn-path-number">01</span><Compass size={30}/><span className="cn-path-kicker">DISCOVER</span>
          <strong>Explore the Garden</strong><p>Meet Guardians, discover themes and find the corner of the world that feels like yours.</p><span className="cn-path-link">ENTER THE LANDS <ArrowRight size={15}/></span>
        </button>
        <button className="cn-path-card featured" onClick={()=>scrollTo('packs')}>
          <span className="cn-path-number">02</span><PackageOpen size={30}/><span className="cn-path-kicker">COLLECT</span>
          <strong>Build Your Nest</strong><p>Open Season One packs, discover rarities and give every new Guardian a place in your collection.</p><span className="cn-path-link">CHOOSE A PACK <ArrowRight size={15}/></span>
        </button>
        <button className="cn-path-card" onClick={()=>go('Nest Battles')}>
          <span className="cn-path-number">03</span><Swords size={30}/><span className="cn-path-kicker">BATTLE</span>
          <strong>Protect the Great Nest</strong><p>Turn the Guardians you love into a team built around timing, roles, counters and synergy.</p><span className="cn-path-link">PLAY THE V3 CONCEPT <ArrowRight size={15}/></span>
        </button>
      </div>
    </section>

    <section className="cn-v3-feature" aria-labelledby="v3-home-title">
      <div className="cn-v3-copy">
        <span className="cn-season-pill"><Swords size={14}/> V3 · NEST BATTLES</span>
        <h2 id="v3-home-title">Your cards are more than a collection.</h2>
        <p>The long-term NestRune loop is simple to understand: discover a Guardian, collect it, learn what makes it special, build a team, then find new combinations in battle.</p>
        <div className="cn-battle-chips" aria-label="Nest Battle strategy roles"><span>ATTACK</span><span>GUARD</span><span>SUPPORT</span><span>SYNERGY</span></div>
        <blockquote>Every rarity should have a reason to matter. A clever Common can still become the Guardian that wins the battle.</blockquote>
        <div className="cn-hero-actions">
          <Link className="cn-primary-cta" href="/play">PLAY PRACTICE BATTLE <ArrowRight size={17}/></Link>
          <button className="cn-secondary-cta" onClick={()=>go('My Nest')}>BUILD YOUR NEST</button>
        </div>
        <small>V3 gameplay is an evolving prototype. Current battle values are balance targets, not final competitive rules.</small>
      </div>
      <div className="cn-battle-stage" aria-label="Two Season One Guardians facing off in the V3 concept">
        <article className="cn-battle-guardian left">
          <div className="cn-battle-card"><GuardianCard id="sproutling-001"/></div>
          <strong>{nestling?.name||'Nestling'}</strong>
          <span>{nestling?.theme||'Mystic'} · {nestling?.battleClass||'Scout'}</span>
          <div className="cn-mini-stats"><span>ATK {nestling?.attack??'—'}</span><span>DEF {nestling?.defense??'—'}</span><span>SPD {nestling?.speed??'—'}</span></div>
        </article>
        <div className="cn-versus"><span>V3</span><strong>VS</strong><small>NEST BATTLE</small></div>
        <article className="cn-battle-guardian right">
          <div className="cn-battle-card"><GuardianCard id="emberwing-002"/></div>
          <strong>{leafpaw?.name||'Leafpaw'}</strong>
          <span>{leafpaw?.theme||'Bloom'} · {leafpaw?.battleClass||'Scout'}</span>
          <div className="cn-mini-stats"><span>ATK {leafpaw?.attack??'—'}</span><span>DEF {leafpaw?.defense??'—'}</span><span>SPD {leafpaw?.speed??'—'}</span></div>
        </article>
      </div>
    </section>

    <section className="cn-pack-bridge">
      <span className="eyebrow">SEASON ONE · THE FIRST FLIGHT</span>
      <h2>Who will join your Nest?</h2>
      <p>The world becomes personal one Guardian at a time. Meet your next teammate through the Season One pack experience below.</p>
      <button className="cn-primary-cta" onClick={()=>scrollTo('packs')}>CHOOSE YOUR PACK <ArrowRight size={17}/></button>
    </section>
  </>;
}
