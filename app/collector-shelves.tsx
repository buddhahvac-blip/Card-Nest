'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {Bookmark,Heart} from 'lucide-react';
import {seasonManifest} from '@/lib/season-manifest';
import {cardPath} from '@/lib/card-paths';
import {COLLECTOR_EVENT,readCollectorState,CollectorState} from '@/lib/collector-state';
import {GuardianCard} from './cards';

export default function CollectorShelves({onInspect}:{onInspect:(id:string)=>void}){
 const [state,setState]=useState<CollectorState>({favorites:[],wishlist:[]});
 useEffect(()=>{const sync=()=>setState(readCollectorState());sync();window.addEventListener(COLLECTOR_EVENT,sync);return()=>window.removeEventListener(COLLECTOR_EVENT,sync)},[]);
 const favoriteCards=state.favorites.map(id=>seasonManifest.find(c=>c.id===id)).filter(Boolean).slice(0,8) as typeof seasonManifest;
 const wishCards=state.wishlist.map(id=>seasonManifest.find(c=>c.id===id)).filter(Boolean).slice(0,8) as typeof seasonManifest;
 const Shelf=({title,icon,cards,empty}:{title:string;icon:React.ReactNode;cards:typeof seasonManifest;empty:string})=><section className="panel"><div className="eyebrow">{title.toUpperCase()}</div><h2>{icon} {title}</h2>{cards.length?<div className="collection-grid">{cards.map(c=><article className="collection-item" key={c.id}><button onClick={()=>onInspect(c.id)} aria-label={'Inspect '+c.name}><GuardianCard id={c.id}/></button><h3>{c.name}</h3><p>{c.theme} Theme · {c.rarity}</p><Link className="index-inspect" href={cardPath(c)}>Open shareable page ↗</Link></article>)}</div>:<p>{empty}</p>}</section>;
 return <div className="lower-grid" style={{marginTop:24}}>
  <Shelf title="Favorites" icon={<Heart size={18}/>} cards={favoriteCards} empty="Favorite a guardian to start building a personal shortlist."/>
  <Shelf title="Wishlist" icon={<Bookmark size={18}/>} cards={wishCards} empty="Add guardians you want to remember or chase later."/>
 </div>;
}
