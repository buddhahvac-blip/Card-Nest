import {seasonManifest} from './season-manifest';

export const STARTER_BATTLE_IDS=['sproutling-001','tidefin-003','voltbeak-005','shadowclaw-007','reserved-008','reserved-012'] as const;

export type BattleCatalogCard={
 id:string;
 release_status?:string;
 is_collectible?:boolean;
 is_pack_eligible?:boolean;
 art_status?:string;
};

const cardOrder=new Map(seasonManifest.map(card=>[card.id,card.cardNumber]));
const knownIds=new Set(seasonManifest.map(card=>card.id));

export function isBattleCatalogReady(card:BattleCatalogCard){
 return knownIds.has(card.id)
  && card.is_collectible===true
  && card.is_pack_eligible===true
  && card.art_status==='live'
  && (card.release_status==='preview'||card.release_status==='released');
}

/**
 * Battle roster rule:
 * - preserve the six original alpha starters;
 * - any illustrated card currently shipped by NestRune can battle;
 * - any future Card Studio upload becomes playable as soon as its catalog state
 *   is preview/live + collectible + pack eligible.
 *
 * Commercial release is intentionally not required for gameplay.
 */
export function battleRosterIds(cards:BattleCatalogCard[]=[],illustratedIds:readonly string[]=[]){
 const ids=new Set<string>(STARTER_BATTLE_IDS);
 for(const id of illustratedIds)if(knownIds.has(id))ids.add(id);
 for(const card of cards)if(isBattleCatalogReady(card))ids.add(card.id);
 return [...ids].sort((a,b)=>(cardOrder.get(a)??9999)-(cardOrder.get(b)??9999));
}

export function practiceRivalIds(poolIds:readonly string[],selected:readonly string[]){
 const selectedSet=new Set(selected);
 const candidates=[
  ...STARTER_BATTLE_IDS.filter(id=>!selectedSet.has(id)),
  ...poolIds.filter(id=>!selectedSet.has(id)&&!STARTER_BATTLE_IDS.includes(id as (typeof STARTER_BATTLE_IDS)[number]))
 ];
 return [...new Set(candidates)].slice(0,3);
}
