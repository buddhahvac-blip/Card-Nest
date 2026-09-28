import type {PoolClient} from 'pg';
import {seasonManifest} from './season-manifest';
/** Existing IDs, ownership and release decisions are preserved on every replay. */
export async function seedSeason(c:Pick<PoolClient,'query'>){
 await c.query("INSERT INTO seasons(id,name,planned_total,status) VALUES('season-1','The First Flight',369,'preview') ON CONFLICT DO NOTHING");
 for(const card of seasonManifest){
  await c.query(`INSERT INTO cards(id,season_id,number,name,family,rarity,lore,art,status,definition,art_status,release_status,is_collectible,is_pack_eligible)
  VALUES($1,'season-1',$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,false)
  ON CONFLICT(id) DO UPDATE SET name=excluded.name,family=excluded.family,rarity=excluded.rarity,lore=excluded.lore,definition=excluded.definition,
  art=coalesce(cards.art,excluded.art),art_status=CASE WHEN cards.art_status='reserved' THEN excluded.art_status ELSE cards.art_status END,
  release_status=CASE WHEN cards.number<=7 AND cards.release_status='unreleased' THEN 'preview' ELSE cards.release_status END,
  is_collectible=cards.is_collectible OR (cards.number<=7)
  WHERE cards.season_id=excluded.season_id AND cards.number=excluded.number`,[card.id,card.cardNumber,card.name,card.clan,card.rarity,card.lore,card.artworkUrl,card.cardNumber<=7?'preview':'reserved',JSON.stringify(card),card.artStatus,card.releaseStatus,card.isCollectible]);
 }
}
