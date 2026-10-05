import type {PoolClient} from 'pg';
import {seasonManifest} from './season-manifest';
import {isPreviewCollectible} from './catalog';
import commonMasterArt from '../data/common-master-art.json';

/**
 * Existing IDs are permanent. The first illustrated cards use an explicit
 * free-beta release allowlist; paid pack eligibility remains false.
 */
export async function seedSeason(c:Pick<PoolClient,'query'>){
 await c.query("INSERT INTO seasons(id,name,planned_total,status) VALUES('season-1','The First Flight',369,'preview') ON CONFLICT DO NOTHING");
 for(const card of seasonManifest){
  const preview=isPreviewCollectible(card.id);
  const status=preview?'preview':'unreleased';
  const releaseStatus=preview?'preview':card.releaseStatus;
  const collectible=preview;
  const art=card.artworkUrl||(commonMasterArt as Record<string,string>)[card.id]||null;
  await c.query(`INSERT INTO cards(id,season_id,number,name,family,rarity,lore,art,status,definition,art_status,release_status,is_collectible,is_pack_eligible)
  VALUES($1,'season-1',$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,false)
  ON CONFLICT(id) DO UPDATE SET name=excluded.name,family=excluded.family,rarity=excluded.rarity,lore=excluded.lore,definition=excluded.definition,
  art=CASE WHEN cards.number<=21 THEN excluded.art ELSE cards.art END,art_status=CASE WHEN cards.number<=21 THEN excluded.art_status ELSE cards.art_status END,
  release_status=CASE WHEN cards.number<=21 THEN excluded.release_status ELSE cards.release_status END,
  status=CASE WHEN cards.number<=21 THEN excluded.status ELSE cards.status END,
  is_collectible=CASE WHEN cards.number<=21 THEN excluded.is_collectible ELSE cards.is_collectible END,
  is_pack_eligible=CASE WHEN cards.number<=21 THEN false ELSE cards.is_pack_eligible END
  WHERE cards.season_id=excluded.season_id AND cards.number=excluded.number`,[card.id,card.cardNumber,card.name,card.clan,card.rarity,card.lore,art,status,JSON.stringify(card),card.artStatus,releaseStatus,collectible]);
 }
}
