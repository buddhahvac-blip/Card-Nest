import {packDefinitions,previewPackDrops} from './catalog';
import {seasonManifest} from './season-manifest';
import {packCardAvailable} from './release';

export type StoreCard={id:string;rarity:string;status:string;release_status:string;is_collectible:boolean;is_pack_eligible:boolean;art:string|null;art_status:string};
export type StorePack={id:string;name:string;count:number;price_cents:number;currency:string;sale_enabled:boolean;drop_version:string;drops:{card:string;weight:number}[]};
export type PackCatalog={paymentsEnabled:boolean;paymentMode:string;packs:StorePack[];cards:StoreCard[];commonSupply?:{capActive:boolean;remaining:number;commonPullCap:number}};
export const packHero={src:'/art/nestrune-pack-hero.webp',width:1672,height:941};
const rarityOrder=['common','uncommon','rare','epic','ultra','legendary'];
export function storefrontPacks(store:PackCatalog|null){
 return packDefinitions.map(def=>{
  const row=store?.packs.find(p=>p.id===def.id);
  const positiveDrops=row?.drops.filter(d=>d.weight>0)??[];
  const pool=positiveDrops.map(d=>store?.cards.find(c=>c.id===d.card));
  const complete=pool.length>0&&pool.every(Boolean);
  const paidPool=complete&&pool.every(c=>c&&packCardAvailable(c,true));
  const priceValid=!!row&&Number.isSafeInteger(row.price_cents)&&row.price_cents>=50&&/^[a-z]{3}$/i.test(row.currency);
  const countValid=!!row&&Number.isSafeInteger(row.count)&&row.count>0;
  const canCheckout=!!(store?.paymentsEnabled&&row?.sale_enabled&&paidPool&&priceValid&&countValid&&['live','test'].includes(store.paymentMode));
  const freeAvailable=!!(row&&!row.sale_enabled&&row.drop_version.startsWith('preview-')&&countValid&&complete&&pool.every(c=>c&&packCardAvailable(c,false))&&(!store?.commonSupply?.capActive||store.commonSupply.remaining>=row.count));
  const previewRarities=previewPackDrops(def.id).map(d=>seasonManifest.find(c=>c.id===d.card)?.rarity).filter(Boolean);
  const availableRarities=(canCheckout||freeAvailable)?pool.map(c=>c!.rarity):previewRarities;
  const rarities=rarityOrder.filter(r=>availableRarities.includes(r)).map(r=>r[0].toUpperCase()+r.slice(1));
  const rawName=row?.name||def.name;const name=/pack$/i.test(rawName)?rawName:rawName+' Pack';
  return {...def,name,count:row?.count??def.count,previewCount:def.count,canCheckout,freeAvailable,mode:store?.paymentMode??'off',price:canCheckout?new Intl.NumberFormat('en-US',{style:'currency',currency:row!.currency}).format(row!.price_cents/100):null,rarities:rarities.join(' · ')||'Not yet released',rarityLabel:canCheckout?'Available rarities':freeAvailable?'Free beta rarities':'Animation preview rarities'};
 });
}

export function checkoutRequest(packId:string,requestKey:string){
 if(!packDefinitions.some(p=>p.id===packId))throw Error('Unknown pack');
 return {pack:packId,requestKey};
}
