'use client';

import {useMemo,useState} from 'react';
import Link from 'next/link';
import {ChevronLeft,ChevronRight,Sparkles} from 'lucide-react';
import {hasSeasonArtwork} from '@/lib/season-manifest';
import {seasonOneThemes,seasonOnePageSize,seasonOneCardsForTheme,seasonOneThemeCount,type SeasonOneTheme} from '@/lib/season-one-view';
import {cardPath} from '@/lib/card-paths';
import ThemeEmblem from './theme-emblem';
import {GuardianCard} from './cards';

export default function SeasonThemeBrowser(){
 const [theme,setTheme]=useState<SeasonOneTheme>('Ember');
 const [page,setPage]=useState(0);
 const cards=useMemo(()=>seasonOneCardsForTheme(theme),[theme]);
 const pages=Math.max(1,Math.ceil(cards.length/seasonOnePageSize));
 const current=Math.min(page,pages-1);
 const shown=cards.slice(current*seasonOnePageSize,(current+1)*seasonOnePageSize);
 const illustrated=cards.filter(hasSeasonArtwork).length;
 const choose=(next:SeasonOneTheme)=>{setTheme(next);setPage(0)};
 return <section className="season-browser" aria-labelledby="season-browser-title">
  <div className="season-browser-head">
   <div><span className="eyebrow">EXPLORE THE FIRST FLIGHT</span><h2 id="season-browser-title">Choose a Theme. Meet twelve Guardians at a time.</h2><p>Every Theme stays in numerical order. Browse without scrolling through all 369 cards at once.</p></div>
   <div className="season-browser-count"><strong>{cards.length}</strong><span>{theme} Guardians</span><small>{illustrated} illustrated</small></div>
  </div>
  <div className="season-theme-tabs" role="tablist" aria-label="Season One themes">
   {seasonOneThemes.map(item=><button key={item} role="tab" aria-selected={theme===item} className={theme===item?'selected':''} onClick={()=>choose(item)}><ThemeEmblem theme={item} size={24} label={false}/><span>{item}</span><small>{seasonOneThemeCount(item)}</small></button>)}
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
