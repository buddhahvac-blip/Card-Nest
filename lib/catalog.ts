import {seasonManifest} from './season-manifest';

export const catalog=seasonManifest.slice(0,21).map(c=>({id:c.id,name:c.name,theme:c.theme,family:c.theme,color:'#edc781',lore:c.lore,tile:-1}));

/**
 * Founding Flight beta pull pool. The first 21 illustrated Guardians remain
 * available through the beta allowlist. Successfully uploaded Season One cards
 * are added dynamically when the database marks them preview/live, collectible,
 * and pack eligible.
 */
export const previewDropVersion='preview-founding-flight-upload-v2';
export const previewCollectibleIds=seasonManifest.slice(0,21).map(card=>card.id) as readonly string[];

export const isPreviewCollectible=(id:string)=>(previewCollectibleIds as readonly string[]).includes(id);

export const packDefinitions=[
{id:'hatchling',tone:'emerald green',tag:'YOUR FIRST CHAPTER',description:'A little guardian. A grand beginning.',artCrop:{x:160,y:390,width:328,height:438},name:'Hatchling',file:'packs/nestrune-hatchling-pack.webp',count:1,priceCents:199},
{id:'nest',tone:'purple',tag:'BUILD YOUR COLLECTION',description:'New friends from a world of wonder.',artCrop:{x:504,y:390,width:318,height:438},name:'Nest',file:'packs/nestrune-nest-pack.webp',count:3,priceCents:499},
{id:'guardian',tone:'luminous blue',tag:'MEET THE PROTECTORS',description:'Discover the guardians of the Garden.',artCrop:{x:842,y:390,width:320,height:438},name:'Guardian',file:'packs/nestrune-guardian-pack.webp',count:5,priceCents:799},
{id:'royal',tone:'premium gold',tag:'DISCOVER THE CROWN',description:'A grand opening for your growing nest.',artCrop:{x:1174,y:390,width:328,height:438},name:'Royal Nest',file:'packs/nestrune-royal-nest-pack.webp',count:7,priceCents:999}
];

export function previewPackDrops(pack:string,additionalIds:readonly string[]=[]){
  const p=packDefinitions.find(x=>x.id===pack);
  if(!p)throw Error('Unknown pack');
  const ids=[...new Set([...previewCollectibleIds,...additionalIds])];
  return ids.map(card=>({card,weight:1}));
}

export function previewPackCards(pack:string){
  const p=packDefinitions.find(x=>x.id===pack);
  if(!p)throw Error('Unknown pack');
  return previewPackDrops(pack).slice(0,p.count).map(x=>x.card);
}

export function chooseCards(pack:string){
  const p=packDefinitions.find(x=>x.id===pack);
  if(!p)throw Error('Unknown pack');
  const ids=[...previewCollectibleIds];
  if(pack==='hatchling')return ids.slice(0,1);
  for(let i=ids.length-1;i>0;i--){
    const max=4294967296-(4294967296%(i+1));
    let n:number;
    do{n=crypto.getRandomValues(new Uint32Array(1))[0]}while(n>=max);
    const j=n%(i+1);
    [ids[i],ids[j]]=[ids[j],ids[i]];
  }
  return ids.slice(0,p.count);
}
