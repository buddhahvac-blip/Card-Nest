import test from 'node:test';
import assert from 'node:assert/strict';
import commonMasterArt from '../data/common-master-art.json';
import {seasonManifest} from '../lib/season-manifest';
import {battleRosterIds,isBattleCatalogReady,practiceRivalIds} from '../lib/battle-roster';

test('every currently illustrated Season One card is battle selectable',()=>{
 const illustrated=Object.keys(commonMasterArt);
 const roster=battleRosterIds([],illustrated);
 for(const id of illustrated){
  assert.ok(roster.includes(id),id+' should be in the battle roster');
  const card=seasonManifest.find(entry=>entry.id===id);
  assert.ok(card,id+' must exist in Season One');
  assert.ok(card!.health>0&&card!.attack>0&&card!.defense>0&&card!.speed>0,id+' needs valid battle stats');
  assert.ok(card!.abilityPrimary?.name&&card!.abilitySecondary?.name,id+' needs both battle abilities');
 }
});

test('a successful future Card Studio upload automatically enters Nest Battles and Rune Dungeon loadouts',()=>{
 const uploaded={id:'reserved-041',release_status:'preview',is_collectible:true,is_pack_eligible:true,art_status:'live'};
 assert.equal(isBattleCatalogReady(uploaded),true);
 const roster=battleRosterIds([uploaded],[]);
 assert.ok(roster.includes('reserved-041'));
});

test('unfinished or non-pack-eligible concepts do not enter through the live upload gate',()=>{
 assert.equal(isBattleCatalogReady({id:'reserved-041',release_status:'unreleased',is_collectible:false,is_pack_eligible:false,art_status:'character_concept'}),false);
 assert.equal(isBattleCatalogReady({id:'reserved-041',release_status:'preview',is_collectible:true,is_pack_eligible:false,art_status:'live'}),false);
});

test('practice battles always choose three rival Guardians outside the selected team',()=>{
 const roster=battleRosterIds([],Object.keys(commonMasterArt));
 const selected=['sproutling-001','tidefin-003','shadowclaw-007'];
 const rivals=practiceRivalIds(roster,selected);
 assert.equal(rivals.length,3);
 assert.equal(rivals.some(id=>selected.includes(id)),false);
 assert.equal(new Set(rivals).size,3);
});
