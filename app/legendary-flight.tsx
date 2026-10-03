'use client';
import {useState,type CSSProperties} from 'react';
import {Crown} from 'lucide-react';
import {showcaseCards} from '@/lib/showcase';
import {themeColors} from '@/lib/season-manifest';
import {legendaryVariants} from '@/lib/legendary-variants';
import ArtInspect from './art-inspect';

export default function LegendaryFlight(){
 const [variantId,setVariantId]=useState('base');const [motion,setMotion]=useState(true);
 const variant=legendaryVariants.find(v=>v.id===variantId)!;
 return <section className={`legendary-flight ${motion?'with-motion':''}`} aria-labelledby="legendary-flight-title"><div className="flight-heading"><span className="eyebrow">THE FIRST FLIGHT · LEGENDARY SPOTLIGHT</span><h2 id="legendary-flight-title">Legends leave a light behind.</h2><p>Enter the world of a guardian whose story reaches beyond the frame.</p><button className="outline" aria-pressed={motion} onClick={()=>setMotion(!motion)}>{motion?'Pause shimmer':'Enable shimmer'}</button></div>{showcaseCards.filter(({card,art})=>card.rarity==='legendary'&&art.reviewStatus==='founder-approved').map(({card,art})=><article className={`flight-stage finish-${variant.finish}`} key={card.id} style={{'--legendary-theme':themeColors[card.theme]} as CSSProperties}><div className="flight-art"><div className="flight-particles" aria-hidden="true">{[0,1,2,3,4,5].map(i=><i key={i} style={{left:`${8+i*17}%`,animationDelay:`${i*-1.6}s`}}/>)}</div><ArtInspect cardId={card.id} large/></div><div className="flight-copy"><span className="legendary-crest"><Crown size={22}/> LEGENDARY FLIGHT</span><h3>{card.name}</h3><p className="flight-myth">{art.headline}. Where the sanctuary path fades, a guardian carries the dawn.</p><p>{card.theme} · {card.habitat}</p><p>{card.creatureType} · {card.battleClass}</p><p className="showcase-status">Founder-approved art · Unreleased</p><label className="variant-label">Explore a frame study<select value={variantId} onChange={e=>setVariantId(e.target.value)}>{legendaryVariants.map(v=><option value={v.id} key={v.id}>{v.name}</option>)}</select></label><p aria-live="polite">{variant.description}</p><small>Display concepts only. No editions, ownership, pack drops or purchases are available.</small></div></article>)}</section>;
}
