export type CollectorState={favorites:string[];wishlist:string[]};
const KEY='cardnest_collector_state_v1';
export const COLLECTOR_EVENT='cardnest-collector-state';

const empty=():CollectorState=>({favorites:[],wishlist:[]});

export function readCollectorState():CollectorState{
  if(typeof window==='undefined')return empty();
  try{
    const raw=localStorage.getItem(KEY);
    if(!raw)return empty();
    const parsed=JSON.parse(raw);
    return {
      favorites:Array.isArray(parsed?.favorites)?parsed.favorites.filter((x:unknown)=>typeof x==='string'):[],
      wishlist:Array.isArray(parsed?.wishlist)?parsed.wishlist.filter((x:unknown)=>typeof x==='string'):[]
    };
  }catch{return empty()}
}

function write(state:CollectorState){
  localStorage.setItem(KEY,JSON.stringify(state));
  window.dispatchEvent(new Event(COLLECTOR_EVENT));
  return state;
}

export function toggleCollectorFlag(kind:'favorites'|'wishlist',cardId:string){
  const state=readCollectorState();
  const set=new Set(state[kind]);
  set.has(cardId)?set.delete(cardId):set.add(cardId);
  return write({...state,[kind]:Array.from(set)});
}
