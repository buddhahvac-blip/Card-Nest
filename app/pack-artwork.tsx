import Image from 'next/image';
import type {CSSProperties} from 'react';
import {packDefinitions} from '@/lib/catalog';
import {packHero} from '@/lib/pack-store';

export default function PackArtwork({packId,hero=false}:{packId?:string;hero?:boolean}){
 const pack=packDefinitions.find(p=>p.id===packId);
 const crop=hero?packHero.crop:pack?.artCrop;
 if(!crop)return null;
 const style={'--art-width':`${packHero.width/crop.width*100}%`,'--art-left':`${-crop.x/crop.width*100}%`,'--art-top':`${-crop.y/crop.height*100}%`,aspectRatio:`${crop.width}/${crop.height}`} as CSSProperties;
 return <div className={hero?'pack-art-crop pack-store-hero':'pack-art-crop pack-product-art'} style={style}><Image className="pack-source-image" src={packHero.src} width={packHero.width} height={packHero.height} quality={95} unoptimized={!hero} preload={hero} sizes="(max-width: 700px) 125vw, (max-width: 1300px) 120vw, 1536px" alt={hero?`CardNest in the Garden of Lands: ${packDefinitions.map(p=>p.name+' Pack').join(', ')} — all four illuminated`:`${pack!.name} Pack — ${pack!.tone} illuminated wrapper`}/></div>;
}
