'use client';
import {useEffect,useState,type ReactNode} from 'react';
import Link from 'next/link';
import {Bookmark,Heart} from 'lucide-react';
import {seasonManifest,type SeasonCard} from '@/lib/season-manifest';
import {cardPath} from '@/lib/card-paths';
import {COLLECTOR_EVENT,readCollectorState,type CollectorState} from '@/lib/collector-state';
import {GuardianCard} from './cards';

function cardsFor(ids:string[]):SeasonCard[]{
 return ids.map(id=>seasonManifest.find(card=>card.id===id)).filter((card):card is SeasonCard=>Boolean(card)).slice(0,8);
}

function Shelf({title,icon,cards,empty,onInspect}:{title:string;icon:ReactNode;cards:SeasonCard[];empty:string;onInspect:(id:string)=>void}){return <section className="panel">
  <div className="eyebrow">{title.toUpperCase()}</div><h2>{icon} {title}</h2>
  {cards.length?<div className="collection-grid">{cards.map(card=><article className="collection-item" key={card.id}>
   <button onClick={()=>onInspect(card.id)} aria-label={'Inspect '+card.name}><GuardianCard id={card.id}/></button>
   <h3>{card.name}</h3><p>{card.theme} Theme · {card.rarity}</p><Link className="index-inspect" href={cardPath(card)}>Open shareable page ↗</Link>
  </article>)}</div>:<p>{empty}</p>}
 </section>;
}

export default function CollectorShelves({onInspect}:{onInspect:(id:string)=>void}){
 const [state,setState]=useState<CollectorState>({favorites:[],wishlist:[]});
 useEffect(()=>{
  const sync=()=>setState(readCollectorState());
  sync();window.addEventListener(COLLECTOR_EVENT,sync);
  return()=>window.removeEventListener(COLLECTOR_EVENT,sync);
 },[]);
 const favoriteCards=cardsFor(state.favorites);
 const wishCards=cardsFor(state.wishlist);
 return <div className="lower-grid" style={{marginTop:24}}>
  <Shelf onInspect={onInspect} title="Favorites" icon={<Heart size={18}/>} cards={favoriteCards} empty="Favorite a guardian to start building a personal shortlist."/>
  <Shelf onInspect={onInspect} title="Wishlist" icon={<Bookmark size={18}/>} cards={wishCards} empty="Add guardians you want to remember or chase later."/>
 </div>;
}
