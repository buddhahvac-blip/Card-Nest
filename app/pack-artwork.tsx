import Image from 'next/image';
import {packDefinitions} from '@/lib/catalog';

export default function PackArtwork({packId,hero=false}:{packId?:string;hero?:boolean}){
 const pack=packDefinitions.find(p=>p.id===packId);

 if(hero)return <div className="pack-store-hero pack-store-hero-composite" aria-label="CardNest Season One pack lineup in the Garden of Lands">
  <Image
   className="pack-hero-world"
   src="/art/great-nest-world.webp"
   alt=""
   fill
   quality={95}
   preload
   sizes="(max-width: 760px) 100vw, 1266px"
  />
  <div className="pack-hero-shade" aria-hidden="true"/>
  <div className="pack-hero-title">
   <span>THE GARDEN OF LANDS</span>
   <strong>Choose your path.</strong>
   <small>Four packs. One world.</small>
  </div>
  <div className="pack-hero-packs">
   {packDefinitions.map((item,index)=><div
    key={item.id}
    className={`pack-hero-item pack-hero-${item.id}`}
    style={{'--pack-index':index} as React.CSSProperties}
   >
    <Image
     src={`/art/${item.file}`}
     alt={`${item.name} Pack — ${item.tone} Season One pack`}
     fill
     quality={100}
     unoptimized
     sizes="(max-width: 760px) 45vw, 260px"
    />
   </div>)}
  </div>
 </div>;

 if(!pack)return null;
 return <div className={`pack-product-art pack-product-${pack.id}`}>
  <Image
   src={`/art/${pack.file}`}
   alt={`${pack.name} Pack — ${pack.tone} illuminated wrapper`}
   fill
   quality={100}
   unoptimized
   sizes="(max-width: 480px) 220px, (max-width: 760px) 180px, 260px"
  />
 </div>;
}
