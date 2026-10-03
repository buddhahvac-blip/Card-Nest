'use client';
import {useEffect,useState} from 'react';
import {Bookmark,Heart,Share2} from 'lucide-react';
import {COLLECTOR_EVENT,readCollectorState,toggleCollectorFlag} from '@/lib/collector-state';
import {trackBeta} from '@/lib/client-analytics';

export default function CollectorActions({cardId,cardName}:{cardId:string;cardName:string}){
  const [state,setState]=useState(()=>({favorites:[] as string[],wishlist:[] as string[]}));
  const [shared,setShared]=useState(false);
  useEffect(()=>{
    const sync=()=>setState(readCollectorState());
    sync();
    window.addEventListener(COLLECTOR_EVENT,sync);
    return()=>window.removeEventListener(COLLECTOR_EVENT,sync);
  },[]);
  const favorite=state.favorites.includes(cardId),wish=state.wishlist.includes(cardId);
  function toggle(kind:'favorites'|'wishlist'){
    const next=toggleCollectorFlag(kind,cardId);setState(next);
    if(kind==='favorites'&&!favorite)trackBeta('favorite',cardId);
    if(kind==='wishlist'&&!wish)trackBeta('wishlist-add',cardId);
  }
  async function share(){
    const url=location.href;
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
