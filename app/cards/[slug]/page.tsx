import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {seasonManifest} from '@/lib/season-manifest';
import {cardPath,themePath} from '@/lib/card-paths';
import {siteUrl} from '@/lib/site';
import {GuardianCard} from '@/app/cards';
import {BattleProfile} from '@/app/battle-profile';
import CollectorActions from '@/app/collector-actions';
import ShowcaseCard from '@/app/showcase-card';
import {showcaseFor} from '@/lib/showcase';

export function generateStaticParams(){
 return seasonManifest.map(card=>({slug:cardPath(card).split('/').pop()!}));
}

function findCard(slug:string){
 return seasonManifest.find(card=>cardPath(card).endsWith('/'+slug));
}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;const card=findCard(slug);if(!card)return {};
 const title=`${card.name} · CN1-${String(card.cardNumber).padStart(3,'0')}`;
 const description=card.description||card.lore;
 const image=showcaseFor(card.id)?.artworkUrl||card.fullCardUrl||card.artworkUrl||'/art/great-nest-world.webp';
 return {
  title,description,
  alternates:{canonical:cardPath(card)},
  openGraph:{title,description,url:new URL(cardPath(card),siteUrl),type:'article',images:[{url:image,alt:`${card.name} NestRune guardian`}]},
  twitter:{card:'summary_large_image',title,description,images:[image]}
 };
}

export default async function CardPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const card=findCard(slug);if(!card)notFound();
 const related=seasonManifest.filter(x=>x.theme===card.theme&&x.id!==card.id).slice(0,5);
 const canonical=new URL(cardPath(card),siteUrl).toString();
 const structured={
  '@context':'https://schema.org','@type':'CreativeWork',name:card.name,
  description:card.description||card.lore,url:canonical,
  isPartOf:{'@type':'CreativeWorkSeries',name:'NestRune Season One: The First Flight'},
  identifier:`CN1-${String(card.cardNumber).padStart(3,'0')}`
 };
 return <main className="shell">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured)}}/>
  <Link className="brand" href="/">✧ Card<span>Nest</span></Link>
  <div className="viewer-grid">
   <div className="view-stage"><div className="view-card">{showcaseFor(card.id)?<ShowcaseCard card={card} large/>:<GuardianCard id={card.id}/>}</div></div>
   <article>
    <div className="eyebrow">SEASON ONE · CN1-{String(card.cardNumber).padStart(3,'0')}</div>
    <h1 className="page-title">{card.name}</h1>
    <p className="intro">{card.theme} Theme · {card.rarity} · {card.battleClass}</p>
    <p>{card.lore}</p>
    <BattleProfile card={card}/>
    <CollectorActions cardId={card.id} cardName={card.name} trackView/>
    <div className="notice">Review-only Season One concept. Artwork, balance, release status, and future pack eligibility may change before commercial launch.</div>
    {showcaseFor(card.id)&&<p><a className="outline" href={showcaseFor(card.id)!.artworkUrl} target="_blank" rel="noopener noreferrer">Open full source artwork ↗</a> <Link className="outline" href="/showcase">Art showcase & Living World</Link></p>}<div className="actions"><Link className="outline" href={themePath(card.theme)}>More {card.theme} guardians</Link><Link className="outline" href="/season-one">Season One index</Link></div>
   </article>
  </div>
  <section className="panel">
   <h2>Related guardians</h2>
   <div className="actions">{related.map(x=><Link className="outline" href={cardPath(x)} key={x.id}>{x.name}</Link>)}</div>
  </section>
 </main>;
}
