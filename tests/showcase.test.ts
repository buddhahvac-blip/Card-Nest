import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {showcaseCards} from '../lib/showcase';
import {collectionAlbums,albumProgress} from '../lib/collection-albums';
import {catalog} from '../lib/catalog';
import {eventSchema,recordBetaEvent} from '../lib/beta-events';

test('six showcase concepts preserve canonical taxonomy and cannot enter pack pools',()=>{
 const expected=[[108,'Tide','rare','Disruptor'],[168,'Bloom','rare','Support'],[229,'Volt','rare','Disruptor'],[299,'Mystic','epic','Disruptor'],[359,'Shadow','epic','Disruptor'],[307,'Mystic','legendary','Warden']];
 assert.equal(showcaseCards.length,6);
 showcaseCards.forEach(({card,art},i)=>{
  assert.deepEqual([card.cardNumber,card.theme,card.rarity,card.battleClass],expected[i]);
  assert.equal(card.id,art.cardId);assert.equal(art.cardId,`reserved-${art.cardNumber}`);
  assert.equal(card.health+card.attack+card.defense+card.speed,190);
  for(const record of [card,art]){assert.equal(record.isPackEligible,false);assert.equal(record.isCollectible,false);assert.equal(record.releaseStatus,'unreleased')}
  assert.equal(art.reviewStatus,'founder-review');
  assert.equal(createHash('sha256').update(readFileSync('public'+art.artworkUrl)).digest('hex'),art.sha256);
  assert.ok(readFileSync('public'+art.avatarUrl).length>1000);
  assert.ok(!catalog.some(c=>c.id===card.id));
 });
});
test('albums only count unique real ownership and preserve theme membership',()=>{
 for(const a of collectionAlbums){assert.equal(a.cards.length,a.numbers.length);assert.ok(a.cards.every(Boolean));if(a.id!=='first-horizons')assert.ok(a.cards.every(c=>c.theme===a.theme))}
 const album=collectionAlbums[0];assert.equal(albumProgress([album.cards[0].id,album.cards[0].id,'not-a-card'],album.numbers),1);
});
test('analytics reject unknown cards, albums, fields and malformed sessions',()=>{
 const session=crypto.randomUUID();assert.equal(eventSchema.safeParse({event:'living-view',dimension:'reserved-307',session}).success,true);
 for(const data of [{event:'favorite',dimension:'made-up-card',session},{event:'album-view',dimension:'unknown',session},{event:'card-view',dimension:'reserved-307',session,email:'private@example.com'},{event:'showcase-view',session:'bad'}])assert.equal(eventSchema.safeParse(data).success,false);
});
test('analytics migration preserves old events and records server-order battle exploration atomically',async()=>{
 const p=new PGlite();try{
  await p.exec('CREATE SCHEMA cardnest_v1');
  for(const file of ['0004_nest_mind_analytics','0005_collector_loop','0006_showcase_signals'])await p.exec(readFileSync('drizzle/'+file+'.sql','utf8'));
  await p.exec('SET search_path=cardnest_v1,public');
  const record=async(hash:string,event:string,dimension='')=>p.transaction(async tx=>recordBetaEvent((sql,params)=>tx.query(sql,params),hash,event,dimension));
  await record('save-first','favorite','reserved-307');await record('save-first','battle-view');
  await record('battle-first','battle-view');await record('battle-first','wishlist-add','reserved-307');
  const rows=await p.query<{session_hash:string;battle_after_save:boolean}>('SELECT session_hash,battle_after_save FROM analytics_sessions ORDER BY session_hash');
  assert.deepEqual(rows.rows,[{session_hash:'battle-first',battle_after_save:false},{session_hash:'save-first',battle_after_save:true}]);
  for(const e of ['showcase-view','living-view','album-view','visit'])await record('new-events',e,e==='album-view'?'bloom-garden':e==='living-view'?'reserved-307':'');
  await assert.rejects(p.transaction(tx=>recordBetaEvent((sql,params)=>tx.query(sql,params),'rolled-back','album-view',null as unknown as string)));
  const result=await p.query('SELECT session_hash FROM analytics_sessions WHERE session_hash=$1',['rolled-back']);assert.equal(result.rows.length,0);
 }finally{await p.close()}
});
