import {seasonManifest} from './season-manifest';
export const catalog=seasonManifest.slice(0,11).map(c=>({id:c.id,name:c.name,family:c.clan,color:'#edc781',lore:c.lore,tile:-1}));
export const packDefinitions=[
{id:'hatchling',name:'Hatchling',file:'Hatchling Pack.webp',count:1,priceCents:199},
{id:'nest',name:'Nest',file:'Nest Pack.webp',count:3,priceCents:499},
{id:'guardian',name:'Guardian',file:'Guardian Pack.webp',count:5,priceCents:799},
{id:'royal',name:'Royal Nest',file:'Royal Nest Pack.webp',count:7,priceCents:999}
];
export function chooseCards(pack:string){const p=packDefinitions.find(x=>x.id===pack);if(!p)throw Error('Unknown pack');if(pack==='hatchling')return ['sproutling-001'];const ids=catalog.map(c=>c.id);for(let i=ids.length-1;i>0;i--){const max=4294967296-(4294967296%(i+1));let n:number;do{n=crypto.getRandomValues(new Uint32Array(1))[0]}while(n>=max);const j=n%(i+1);[ids[i],ids[j]]=[ids[j],ids[i]]}return ids.slice(0,p.count)}
