'use client';

import {useMemo,useState} from 'react';
import Link from 'next/link';
import {ChevronLeft,ChevronRight,Sparkles} from 'lucide-react';
import {seasonManifest,hasSeasonArtwork} from '@/lib/season-manifest';
import {cardPath} from '@/lib/card-paths';
import ThemeEmblem from './theme-emblem';
import {GuardianCard} from './cards';

const themes=['Ember','Tide','Bloom','Volt','Mystic','Shadow'] as const;
const pageSize=12;

export default function SeasonThemeBrowser(){
 const [theme,setTheme]=useState<(typeof themes)[number]>('Ember');
 const [page,setPage]=useState(0);
 const cards=useMemo(()=>seasonManifest.filter(card=>card.theme===theme).sort((a,b)=>a.cardNumber-b.cardNumber),[theme]);
 const pages=Math.max(1,Math.ceil(cards.length/pageSize));
 const current=Math.min(page,pages-1);
 const shown=cards.slice(current*pageSize,(current+1)*pageSize);
 const illustrated=cards.filter(hasSeasonArtwork).length;
 const choose=(next:(typeof themes)[number])=>{setTheme(next);setPage(0)};
 return <section className="season-browser" aria-labelledby="season-browser-title">
  <div className="season-browser-head">
   <div><span className="eyebrow">EXPLORE THE FIRST FLIGHT</span><h2 id="season-browser-title">Choose a Theme. Meet twelve Guardians at a time.</h2><p>Every Theme stays in numerical order. Browse without scrolling through all 369 cards at once.</p></div>
   <div className="season-browser-count"><strong>{cards.length}</strong><span>{theme} Guardians</span><small>{illustrated} illustrated</small></div>
  </div>
  <div className="season-theme-tabs" role="tablist" aria-label="Season One themes">
   {themes.map(item=><button key={item} role="tab" aria-selected={theme===item} className={theme===item?'selected':''} onClick={()=>choose(item)}><ThemeEmblem theme={item} size={24} label={false}/><span>{item}</span><small>{seasonManifest.filter(c=>c.theme===item).length}</small></button>)}
  </div>
  <div className="season-browser-summary">
   <div><ThemeEmblem theme={theme} size={34} label={false}/><div><strong>{theme} Theme</strong><span>CN1 cards in ascending numerical order</span></div></div>
   <Link href={'/themes/'+theme.toLowerCase()} className="outline">Open full {theme} index</Link>
  </div>
  <div className="season-browser-grid">
   {shown.map((card,i)=><Link className={'season-browser-card '+(hasSeasonArtwork(card)?'has-art':'')} href={cardPath(card)} key={card.id}>
    <GuardianCard id={card.id} eager={i<4}/>
    <div className="season-browser-card-copy">
     <span>CN1-{String(card.cardNumber).padStart(3,'0')}</span>
     <strong>{card.name}</strong>
     <small>{card.battleClass} · {card.rarity}</small>
    </div>
   </Link>)}
  </div>
  <div className="season-browser-pagination">
   <button className="outline" disabled={current===0} onClick={()=>setPage(Math.max(0,current-1))}><ChevronLeft size={16}/>Previous 12</button>
   <span>Page {current+1} of {pages}</span>
   <button className="outline" disabled={current+1>=pages} onClick={()=>setPage(Math.min(pages-1,current+1))}>Next 12<ChevronRight size={16}/></button>
  </div>
  <p className="season-browser-note"><Sparkles size={14}/>Unillustrated Guardians use the official NestRune card back until their art is ready.</p>
 </section>
}
