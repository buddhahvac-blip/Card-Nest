/** Connector-safe equivalent of seedSeason, for networks without direct PG access. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {seasonManifest} from '../lib/season-manifest';
const migration=readFileSync('drizzle/0001_fresh_valeria_richards.sql','utf8');
const journal=JSON.parse(readFileSync('drizzle/meta/_journal.json','utf8'));
const seed=`WITH incoming AS (SELECT value AS d FROM jsonb_array_elements($manifest$${JSON.stringify(seasonManifest)}$manifest$::jsonb))
INSERT INTO cardnest_v1.cards(id,season_id,number,name,family,rarity,lore,art,status,definition,art_status,release_status,is_collectible,is_pack_eligible)
SELECT d->>'id','season-1',(d->>'cardNumber')::int,d->>'name',d->>'clan',d->>'rarity',d->>'lore',d->>'artworkUrl',CASE WHEN (d->>'cardNumber')::int<=7 THEN 'preview' ELSE 'reserved' END,d,d->>'artStatus',d->>'releaseStatus',(d->>'isCollectible')::boolean,false FROM incoming
ON CONFLICT(id) DO UPDATE SET name=excluded.name,family=excluded.family,rarity=excluded.rarity,lore=excluded.lore,definition=excluded.definition,
art=coalesce(cards.art,excluded.art),art_status=CASE WHEN cards.art_status='reserved' THEN excluded.art_status ELSE cards.art_status END,
release_status=CASE WHEN cards.number<=7 AND cards.release_status='unreleased' THEN 'preview' ELSE cards.release_status END,is_collectible=cards.is_collectible OR (cards.number<=7)
WHERE cards.season_id=excluded.season_id AND cards.number=excluded.number`;
const hash=createHash('sha256').update(migration).digest('hex');
writeFileSync('/tmp/cardnest-season-migration.json',JSON.stringify([...migration.split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean),seed,`INSERT INTO drizzle.__drizzle_migrations(hash,created_at) VALUES('${hash}',${journal.entries[1].when})`]));
console.log('Prepared additive migration and 369-card upsert; no secrets.');
