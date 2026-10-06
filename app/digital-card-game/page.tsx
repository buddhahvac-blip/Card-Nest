import type {Metadata} from 'next';
import Link from 'next/link';
import {PackageOpen,Sparkles,Swords,ShieldCheck} from 'lucide-react';
import {siteUrl} from '@/lib/site';

export const metadata:Metadata={
 title:'Free Browser Digital Card Game Beta',
 description:'Play the NestRune beta in your browser: collect original fantasy Guardians, open free beta packs, build a team, battle, and explore a 10-floor Rune Dungeon.',
 alternates:{canonical:'/digital-card-game'},
 openGraph:{
  title:'NestRune — Free Browser Digital Card Game Beta',
  description:'Collect original Guardians, open free beta packs, battle, and explore the Rune Dungeon in NestRune.',
  url:'/digital-card-game',
  type:'website',
  images:[{url:'/art/nestrune-pack-hero.webp',alt:'NestRune fantasy digital card game packs'}]
 }
};

export default function DigitalCardGamePage(){
 const structured={
  '@context':'https://schema.org',
  '@type':'VideoGame',
  name:'NestRune',
  url:new URL('/digital-card-game',siteUrl).toString(),
  description:'An original fantasy digital card game beta playable in a web browser, featuring collectible Guardians, pack opening, strategic battles and a Rune Dungeon.',
  genre:['Digital card game','Collectible card game','Fantasy'],
  gamePlatform:'Web browser',
  operatingSystem:'Web',
  applicationCategory:'Game',
  isAccessibleForFree:true,
  inLanguage:'en'
 };
 return <main className="shell" style={{maxWidth:1000,paddingTop:70,paddingBottom:70}}>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured)}}/>
  <section className="panel" style={{padding:30}}>
   <span className="eyebrow">ORIGINAL FANTASY DIGITAL CARD GAME</span>
   <h1 className="page-title">A browser card game built around collecting, battling, and exploring.</h1>
   <p className="intro">NestRune is an original digital collectible-card universe in public beta. Discover Guardians from the Garden of Lands, open free beta packs, build your Nest, test strategic teams in Nest Battles, and earn Rune Energy through a ten-floor PvE Dungeon.</p>
   <div className="battle-pill-row" style={{marginTop:18}}>
    <span><PackageOpen size={14}/> Collect Guardians</span>
    <span><Swords size={14}/> Strategic battles</span>
    <span><Sparkles size={14}/> Rune Dungeon</span>
    <span><ShieldCheck size={14}/> Free beta</span>
   </div>
   <div className="actions" style={{marginTop:24}}>
    <Link className="gold" href="/join">Join the free beta</Link>
    <Link className="outline" href="/play">Play Nest Battles</Link>
    <Link className="outline" href="/season-one">Explore Season One</Link>
   </div>
  </section>

  <section className="panel" style={{marginTop:24}}>
   <h2>What makes NestRune different?</h2>
   <p>Instead of adapting an existing franchise, NestRune is built around original creatures, original fantasy regions, and a collection-first loop. The goal is simple to understand for new players while leaving room for team roles, affinity choices, ability timing, and deeper strategy.</p>
   <h3>Collect original fantasy Guardians</h3>
   <p>Season One: The First Flight contains a 369-slot canon. The illustrated Founding Flight is the starting beta pool, with additional Guardians revealed as art and gameplay are reviewed.</p>
   <h3>Open packs and keep your collection</h3>
   <p>Beta accounts can collect Guardians into My Nest. The collection is server-backed so future web and mobile clients can share the same account and progression rather than creating separate inventories.</p>
   <h3>Battle in your browser</h3>
   <p>Nest Battles turns collected Guardians into small strategic teams with attack, guard, support, affinity, and special-ability decisions. The current version is an evolving public beta rather than a finished competitive ruleset.</p>
   <h3>Explore a PvE Rune Dungeon</h3>
   <p>The Rune Dungeon contains ten mission floors and a final boss. First clears award account-bound Rune Energy that can be exchanged for free beta reward packs.</p>
  </section>

  <section className="panel" style={{marginTop:24}}>
   <h2>Is NestRune free to play?</h2>
   <p>The current public beta is free to join and real-money pack purchases remain disabled while the collecting, battle, and Dungeon loops are tested with early players.</p>
   <h2>Can I play without downloading an app?</h2>
   <p>Yes. The current beta runs directly in a modern web browser. Native iOS and Android clients are also being developed to connect to the same NestRune account and backend.</p>
   <h2>Is NestRune related to Pokémon, Magic, or another existing TCG?</h2>
   <p>No. NestRune is an original project with its own Guardians, world, art direction, and gameplay systems.</p>
  </section>
 </main>
}
