'use client';
import {useEffect,useState} from 'react';
import {Bookmark,Heart,Share2} from 'lucide-react';
import {COLLECTOR_EVENT,readCollectorState,toggleCollectorFlag,type CollectorState} from '@/lib/collector-state';
import {seasonCard} from '@/lib/season-manifest';
import {cardPath} from '@/lib/card-paths';
import {trackBeta} from '@/lib/client-analytics';

export default function CollectorActions({cardId,cardName,trackView=false}:{cardId:string;cardName:string;trackView?:boolean}){
  const [state,setState]=useState<CollectorState>({favorites:[],wishlist:[]});
  const [shared,setShared]=useState(false);
  useEffect(()=>{
    const sync=()=>setState(readCollectorState());
    sync();
    window.addEventListener(COLLECTOR_EVENT,sync);
    if(trackView)trackBeta('card-view',cardId);
    return()=>window.removeEventListener(COLLECTOR_EVENT,sync);
  },[cardId,trackView]);
  const favorite=state.favorites.includes(cardId),wish=state.wishlist.includes(cardId);
  function toggle(kind:'favorites'|'wishlist'){
    const next=toggleCollectorFlag(kind,cardId);setState(next);
    if(kind==='favorites'&&!favorite)trackBeta('favorite',cardId);
    if(kind==='wishlist'&&!wish)trackBeta('wishlist-add',cardId);
  }
  async function share(){
    const card=seasonCard(cardId);
    const url=new URL(card?cardPath(card):location.pathname,location.origin).toString();
    try{
      if(navigator.share)await navigator.share({title:`${cardName} · CardNest`,text:`Explore ${cardName} from CardNest Season One.`,url});
      else await navigator.clipboard.writeText(url);
      setShared(true);trackBeta('share-card',cardId);
      setTimeout(()=>setShared(false),1800);
    }catch{}
  }
  return <div className="actions">
    <button className={favorite?'gold':'outline'} onClick={()=>toggle('favorites')} aria-pressed={favorite}><Heart size={16}/>{favorite?'Favorited':'Favorite'}</button>
    <button className={wish?'gold':'outline'} onClick={()=>toggle('wishlist')} aria-pressed={wish}><Bookmark size={16}/>{wish?'On wishlist':'Add to wishlist'}</button>
    <button className="outline" onClick={share}><Share2 size={16}/>{shared?'Link ready':'Share guardian'}</button>
  </div>;
}
