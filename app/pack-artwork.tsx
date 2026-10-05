import Image from 'next/image';
import type {CSSProperties} from 'react';
import {packDefinitions} from '@/lib/catalog';
import {packHero} from '@/lib/pack-store';

export default function PackArtwork({packId,hero=false}:{packId?:string;hero?:boolean}){
 const pack=packDefinitions.find(p=>p.id===packId);
 if(hero)return <div className="pack-store-hero" style={{aspectRatio:'1446 / 330',overflow:'hidden'}}>
  <Image
   src="/art/cardnest-pack-hero-v3.webp"
   width={1446}
   height={330}
   quality={100}
   unoptimized
   preload
   sizes="(max-width: 700px) 100vw, (max-width: 1300px) 92vw, 1446px"
   style={{display:'block',width:'100%',height:'100%',objectFit:'cover'}}
   alt={`CardNest Season One pack lineup in the Garden of Lands: ${packDefinitions.map(p=>p.name+' Pack').join(', ')}`}
  />
 </div>;
 const crop=pack?.artCrop;
 if(!crop)return null;
 const style={'--art-width':`${packHero.width/crop.width*100}%`,'--art-left':`${-crop.x/crop.width*100}%`,'--art-top':`${-crop.y/crop.height*100}%`,aspectRatio:`${crop.width}/${crop.height}`} as CSSProperties;
 return <div className="pack-art-crop pack-product-art" style={style}><Image className="pack-source-image" src={packHero.src} width={packHero.width} height={packHero.height} quality={95} unoptimized sizes="(max-width: 580px) 100vw, 340px" alt={`${pack!.name} Pack — ${pack!.tone} illuminated wrapper`}/></div>;
}
