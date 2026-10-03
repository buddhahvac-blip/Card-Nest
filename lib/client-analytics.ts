'use client';

export type BetaEvent='visit'|'season-view'|'card-view'|'pack-preview'|'theme-select'|'discover-view'|'battle-view'|'my-nest-view'|'support-view';

function session(){
 try{
  let id=sessionStorage.getItem('cardnest_beta_session');
  if(!id){id=crypto.randomUUID();sessionStorage.setItem('cardnest_beta_session',id)}
  return id
 }catch{return null}
}

export function trackBeta(event:BetaEvent,dimension?:string){
 if(typeof window==='undefined'||navigator.doNotTrack==='1')return;
 const id=session();if(!id)return;
 const body:Record<string,string>={event,session:id};
 if(dimension)body.dimension=dimension;
 fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),keepalive:true}).catch(()=>{});
}
