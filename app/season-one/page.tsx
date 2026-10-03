import type {Metadata} from 'next';
import Link from 'next/link';
import {seasonManifest,artProgress} from '@/lib/season-manifest';
import {showcaseCards} from '@/lib/showcase';
import ShowcaseCard from '@/app/showcase-card';
import {cardPath,themePath} from '@/lib/card-paths';

export const metadata:Metadata={
 title:'Season One: The First Flight',
 description:'Explore all 369 CardNest Season One guardian concepts across Ember, Tide, Bloom, Volt, Mystic, and Shadow.',
 alternates:{canonical:'/season-one'}
};

export default function SeasonOnePage(){
 const progress=artProgress();
 const themes=['Ember','Tide','Bloom','Volt','Mystic','Shadow'];
 return <main className="shell">
  <Link className="brand" href="/">✧ Card<span>Nest</span></Link>
  <div className="eyebrow">SEASON ONE · THE FIRST FLIGHT</div>
  <h1 className="page-title">369 guardians. Six Themes. One world taking flight.</h1>
  <p className="intro">Explore illustrated guardians and the full Season One roster. The six featured artworks are founder-approved; cards remain unreleased and battle profiles are still being developed.</p>
  <section className="stats">
   <div className="stat"><span className="muted">Season One</span><strong>{progress.total}</strong><span className="status">planned guardians</span></div>
   <div className="stat"><span className="muted">Illustrated cards</span><strong>{progress.illustrated}</strong><span className="muted">including approved showcase art</span></div>
   <div className="stat"><span className="muted">Paid eligible</span><strong>{progress.released}</strong><span className="muted">commerce remains closed</span></div>
  </section>
  <section aria-labelledby="approved-season-art">
   <h2 id="approved-season-art">Newly illustrated Season One guardians</h2>
   <p>Six founder-approved artworks. Choose a card for its close-up, lore and battle profile. Not yet available in packs.</p>
   <div className="showcase-grid">{showcaseCards.filter(({art})=>art.reviewStatus==='founder-approved').map(({card})=><article className="showcase-entry" key={card.id}><Link href={cardPath(card)} aria-label={`Inspect ${card.name}`}><ShowcaseCard card={card}/></Link><Link className="index-inspect" href={cardPath(card)}>View {card.name} ↗</Link></article>)}</div>
  </section>
  <section className="panel">
   <h2>Explore by Theme</h2>
   <div className="actions">{themes.map(theme=><Link className="outline" href={themePath(theme)} key={theme}>{theme} Theme</Link>)}</div>
  </section>
  <section className="panel">
   <h2>Complete collector index</h2>
   <p>Every stable Season One card number has a permanent public URL for sharing, linking, and future collection history.</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
    {seasonManifest.map(card=><Link key={card.id} className="outline" href={cardPath(card)}>CN1-{String(card.cardNumber).padStart(3,'0')} · {card.name}</Link>)}
   </div>
  </section>
 </main>;
}
