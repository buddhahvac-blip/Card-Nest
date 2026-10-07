import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RUNE_DUNGEON_FLOORS,RUNE_DUNGEON_TOTAL_ENERGY,RUNE_DUNGEON_WORLDS,RUNE_PACK_COSTS,runeEnergyForFloor,runePackCost} from '../lib/rune-dungeon';

test('Rune Dungeon V2 has three ten-level worlds and one final Runeheart boss',()=>{
 assert.equal(RUNE_DUNGEON_WORLDS.length,3);
 assert.deepEqual(RUNE_DUNGEON_WORLDS.map(world=>world.floorRange),[[1,10],[11,20],[21,30]]);
 assert.equal(RUNE_DUNGEON_FLOORS.length,30);
 assert.deepEqual(RUNE_DUNGEON_FLOORS.map(f=>f.floor),Array.from({length:30},(_,i)=>i+1));
 assert.equal(RUNE_DUNGEON_FLOORS.filter(f=>f.worldBoss).length,2);
 assert.equal(RUNE_DUNGEON_FLOORS.filter(f=>f.boss).length,1);
 assert.equal(RUNE_DUNGEON_FLOORS[29].boss,true);
 assert.equal(RUNE_DUNGEON_FLOORS[29].name,'Runeheart Sanctum');
});

test('Dungeon difficulty rises across all three worlds and each world pays 240 first-clear Energy',()=>{
 for(let i=1;i<RUNE_DUNGEON_FLOORS.length;i++){
  assert.ok(RUNE_DUNGEON_FLOORS[i].hpMultiplier>=RUNE_DUNGEON_FLOORS[i-1].hpMultiplier);
  assert.ok(RUNE_DUNGEON_FLOORS[i].damageMultiplier>=RUNE_DUNGEON_FLOORS[i-1].damageMultiplier);
 }
 for(const world of RUNE_DUNGEON_WORLDS){
  const total=RUNE_DUNGEON_FLOORS.filter(f=>f.world===world.id).reduce((sum,f)=>sum+f.energy,0);
  assert.equal(total,240);
 }
 assert.equal(runeEnergyForFloor(30),60);
 assert.equal(RUNE_DUNGEON_TOTAL_ENERGY,720);
});

test('Rune Energy reward pack prices are server-defined and Royal is not Rune-redeemable',()=>{
 assert.deepEqual(RUNE_PACK_COSTS,{hatchling:100,nest:220,guardian:400});
 for(const [pack,cost] of Object.entries(RUNE_PACK_COSTS))assert.equal(runePackCost(pack),cost);
 assert.ok(RUNE_PACK_COSTS.hatchling<RUNE_PACK_COSTS.nest);
 assert.ok(RUNE_PACK_COSTS.nest<RUNE_PACK_COSTS.guardian);
 assert.ok(RUNE_PACK_COSTS.guardian<RUNE_DUNGEON_TOTAL_ENERGY);
 assert.equal(runePackCost('royal'),0);
 assert.equal(runePackCost('unknown'),0);
});
