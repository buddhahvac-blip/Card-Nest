'use client';
import {useEffect,useState,type CSSProperties} from 'react';
import Image from 'next/image';
import {Sparkles,Pause,Play,ArrowRight} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {seasonCard} from '@/lib/season-manifest';
import {showcaseFor} from '@/lib/showcase';
import {trackBeta} from '@/lib/client-analytics';
import ShowcaseCard from './showcase-card';

const moments=['A weather-worn sanctuary needs a safe path home.','The broad shield collar carries the marks of past journeys.','Above Starfall Fields, the aurora turns the horizon into a promise.'];
export default function LivingWorld(){
 const card=seasonCard('reserved-307')!;const art=showcaseFor(card.id)!;
 const [open,setOpen]=useState(false),[motion,setMotion]=useState(false),[reduced,setReduced]=useState(true),[tilt,setTilt]=useState({x:0,y:0}),[moment,setMoment]=useState(0);
 useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>{setReduced(q.matches);setMotion(!q.matches);setTilt({x:0,y:0})};sync();q.addEventListener('change',sync);return()=>q.removeEventListener('change',sync)},[]);
 function enter(){setOpen(true);setMoment(0);trackBeta('living-view',card.id)}
 return <section className="living-feature" aria-labelledby="living-title">
  <div className="living-stage" onPointerMove={e=>{if(!motion||reduced||e.pointerType==='touch')return;const b=e.currentTarget.getBoundingClientRect();setTilt({x:(e.clientY-b.top)/b.height*6-3,y:(e.clientX-b.left)/b.width*8-4})}} onPointerLeave={()=>setTilt({x:0,y:0})}>
   <div className={motion&&!reduced?'living-surface moving':'living-surface'} style={{'--tilt-x':tilt.x+'deg','--tilt-y':tilt.y+'deg'} as CSSProperties}><ShowcaseCard card={card} large/><div className="living-sky" aria-hidden="true"/></div>
  </div>
  <article><div className="eyebrow">LEGENDARY STUDY · CN1-307</div><h2 id="living-title">A card. A doorway.</h2><p className="intro">Meet Aurora Herald. An aurora stag that carries the light of safe journeys across Starfall Fields.</p><p>Stay with the illustration, or step into a larger view of its habitat. Quiet sky motion and pointer tilt explore how a future Living World Card could feel.</p><div className="actions"><button className="gold" onClick={enter}>Enter the habitat <ArrowRight size={16}/></button><button className="outline" disabled={reduced} aria-pressed={motion&&!reduced} onClick={()=>{setMotion(!motion);setTilt({x:0,y:0})}}>{motion&&!reduced?<Pause size={16}/>:<Play size={16}/>} {reduced?'Static view':motion?'Pause motion':'Enable motion'}</button></div><p className="disclaimer">Review-only prototype. Animation adds atmosphere, never battle power. Reduced-motion preferences get a static view. No sound, device-sensor access or video download.</p></article>
  <Dialog open={open} onOpenChange={setOpen}><DialogContent className="habitat-dialog"><DialogTitle>Aurora Herald · Starfall Fields</DialogTitle><DialogDescription>Expanded source illustration and a three-part story study. Return to the collectible view at any time.</DialogDescription><div className="habitat-layout"><div className={motion&&!reduced?'habitat-art moving':'habitat-art'}><Image src={art.artworkUrl} quality={95} width={1024} height={1536} sizes="(max-width: 700px) 90vw, 600px" alt="Aurora Herald's full Starfall Fields habitat, with a glowing sanctuary path and an aurora sky"/><div className="living-sky" aria-hidden="true"/></div><article><Sparkles size={25}/><span className="eyebrow">STORY STUDY · {moment+1} / 3</span><h2>{moments[moment]}</h2><p>{card.lore}</p><p className="muted">This is an art-direction story study. The card’s canonical identity, ability and stats stay unchanged.</p><div className="actions"><button className="outline" onClick={()=>setMoment((moment+1)%moments.length)}>Next story moment</button><button className="gold" onClick={()=>setOpen(false)}>Return to card</button></div></article></div></DialogContent></Dialog>
 </section>;
}
