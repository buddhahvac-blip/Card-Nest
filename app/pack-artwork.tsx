import Image from 'next/image';
import {packDefinitions} from '@/lib/catalog';
import {packHero} from '@/lib/pack-store';

export default function PackArtwork({packId,hero=false}:{packId?:string;hero?:boolean}){
 if(hero)return <div className="pack-store-hero pack-store-hero-nestrune">
  <Image
   src={packHero.src}
   alt="NestRune in the Garden of Lands: green Hatchling Pack, purple Nest Pack, blue Guardian Pack, and gold Royal Nest Pack"
   width={packHero.width}
   height={packHero.height}
   quality={95}
   preload
   sizes="(max-width: 760px) calc(100vw - 32px), (max-width: 1346px) calc(100vw - 80px), 1266px"
  />
 </div>;

 const pack=packDefinitions.find(p=>p.id===packId);
 if(!pack)return null;
 return <div className={`pack-product-art pack-product-${pack.id}`}>
  <Image
   src={`/art/${pack.file}`}
   alt={`NestRune ${pack.name} Pack — ${pack.tone} illustrated wrapper`}
   width={pack.artCrop.width}
   height={pack.artCrop.height}
   unoptimized
   sizes="156px"
  />
 </div>;
}
