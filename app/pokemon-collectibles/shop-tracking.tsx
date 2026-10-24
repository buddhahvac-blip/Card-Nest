'use client';
import {useEffect} from 'react';

const key='nestrune_collector_session';
function getSession(){
  try{
    let session=sessionStorage.getItem(key);
    if(!session){session=crypto.randomUUID();sessionStorage.setItem(key,session)}
    return session;
  }catch{return null}
}
function track(event:'visit'|'contact'|'inquiry',product?:string){
  if(navigator.doNotTrack==='1'||navigator.webdriver)return;
  const session=getSession();if(!session)return;
  const payload={event,session,...(product?{product}:{} )};
  try{
    fetch('/api/shop/metrics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),keepalive:true}).catch(()=>{});
  }catch{}
}

export default function ShopTracking(){
  useEffect(()=>{
    // Count one shop entry per browser session, not every rerender.
    try{if(sessionStorage.getItem('nestrune_collector_visit_logged')!=='1'){sessionStorage.setItem('nestrune_collector_visit_logged','1');track('visit')}}catch{track('visit')}
    function onClick(event:MouseEvent){
      const target=event.target;
      if(!(target instanceof Element))return;
      const anchor=target.closest<HTMLAnchorElement>('a[data-shop-inquiry]');
      if(!anchor)return;
      const product=anchor.dataset.shopInquiry;
      if(product)track('contact',product);
    }
    function onRequest(e:Event){const product=(e as CustomEvent<{product:string}>).detail?.product;if(product)track('inquiry',product)}
    window.addEventListener('nestrune:collector-order-request',onRequest);
    document.addEventListener('click',onClick);
    return ()=>{document.removeEventListener('click',onClick);window.removeEventListener('nestrune:collector-order-request',onRequest)};
  },[]);
  return null;
}
