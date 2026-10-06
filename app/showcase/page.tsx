import Link from 'next/link';
import type {Metadata} from 'next';
import {showcaseCards} from '@/lib/showcase';
import {cardPath} from '@/lib/card-paths';
import ArtInspect from '@/app/art-inspect';
import CollectorActions from '@/app/collector-actions';
import LivingWorld from '@/app/living-world';
import ShowcaseVisit from '@/app/showcase-visit';

export const metadata:Metadata={title:'Six guardians. One growing world. · First Flight Showcase',description:'Explore six founder-approved Rare, Epic and Legendary NestRune artworks, including Aurora Herald’s Living World study.'};
export default function ShowcasePage(){
 return <main className="shell showcase-page"><ShowcaseVisit/><Link className="brand" href="/">✧ Card<span>Nest</span></Link><div className="showcase-heading"><div className="eyebrow">THE FIRST FLIGHT · ART SHOWCASE</div><h1>Six guardians.<br/><em>One growing world.</em></h1><p className="intro">From an ocean sanctuary to the edge of the aurora. Discover a guardian, find a favorite, and help shape what comes next.</p><div className="actions"><a className="gold" href="#guardians">Meet the six</a><Link className="outline" href="/beta">Try the beta trail</Link></div><p className="disclaimer">Founder-approved artwork · unreleased · not pack-eligible · purchases closed.</p></div><LivingWorld/><section id="guardians"><div className="section-head"><div><div className="eyebrow">A LITTLE CURIOSITY GOES A LONG WAY</div><h2>Which world calls to you?</h2><p>Rarity changes the art experience. It does not add to the base battle-stat budget.</p></div></div><div className="showcase-grid">{showcaseCards.map(({card,art})=><article className="showcase-entry" key={card.id}><ArtInspect cardId={card.id}/><span className="eyebrow">{art.headline}</span><h2>{card.name}</h2><p>{art.purpose}</p><p className="muted">{art.rarityTreatment}</p><CollectorActions cardId={card.id} cardName={card.name}/><Link className="index-inspect" href={cardPath(card)}>Lore, stats & close-up ↗</Link></article>)}</div></section><section className="panel showcase-end"><div className="eyebrow">FANS FIRST</div><h2>A favorite is a beginning.</h2><p>Save a guardian, explore its Theme, preview an opening, then tell us which part of the world you want to return to.</p><div className="actions"><Link className="gold" href="/feedback">Help shape NestRune</Link><Link className="outline" href="/#My%20Nest">Visit My Nest</Link><Link className="outline" href="/season-one">All 369 planned guardians</Link></div></section></main>;
}
