import {seasonManifest} from './season-manifest';

export const catalog=seasonManifest.slice(0,11).map(c=>({id:c.id,name:c.name,theme:c.theme,family:c.theme,color:'#edc781',lore:c.lore,tile:-1}));

/**
 * Cards that have passed the current founder art savepoint and may be awarded
 * in the free beta. They remain ineligible for paid packs.
 *
 * CN1-001, CN1-007 and CN1-008 stay out until their saved corrections land.
 */
export const previewCollectibleIds=[
  'emberwing-002',
  'tidefin-003',
  'bloomtail-004',
  'voltbeak-005',
  'mindfeather-006',
  'reserved-009',
  'reserved-010',
  'reserved-011'
] as const;

export const isPreviewCollectible=(id:string)=>(previewCollectibleIds as readonly string[]).includes(id);

export const packDefinitions=[
{id:'hatchling',tone:'emerald green',tag:'YOUR FIRST CHAPTER',description:'A little guardian. A grand beginning.',artCrop:{x:205,y:238,width:263,height:330},name:'Hatchling',file:'Hatchling Pack.webp',count:1,priceCents:199},
{id:'nest',tone:'purple',tag:'BUILD YOUR COLLECTION',description:'New friends from a world of wonder.',artCrop:{x:525,y:238,width:255,height:330},name:'Nest',file:'Nest Pack.webp',count:3,priceCents:499},
{id:'guardian',tone:'luminous blue',tag:'MEET THE PROTECTORS',description:'Discover the guardians of the Garden.',artCrop:{x:824,y:238,width:246,height:330},name:'Guardian',file:'Guardian Pack.webp',count:5,priceCents:799},
{id:'royal',tone:'premium gold',tag:'DISCOVER THE CROWN',description:'A grand opening for your growing nest.',artCrop:{x:1126,y:238,width:258,height:330},name:'Royal Nest',file:'Royal Nest Pack.webp',count:7,priceCents:999}
];

export function previewPackDrops(pack:string){
  const p=packDefinitions.find(x=>x.id===pack);
  if(!p)throw Error('Unknown pack');
  const ids=pack==='hatchling'?previewCollectibleIds.slice(0,1):previewCollectibleIds;
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
