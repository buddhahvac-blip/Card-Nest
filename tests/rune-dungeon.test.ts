import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RUNE_DUNGEON_FLOORS,RUNE_DUNGEON_TOTAL_ENERGY,RUNE_PACK_COSTS,runeEnergyForFloor,runePackCost} from '../lib/rune-dungeon';

test('Rune Dungeon has exactly ten ordered floors with a boss on floor ten',()=>{
 assert.equal(RUNE_DUNGEON_FLOORS.length,10);
 assert.deepEqual(RUNE_DUNGEON_FLOORS.map(f=>f.floor),[1,2,3,4,5,6,7,8,9,10]);
 assert.equal(RUNE_DUNGEON_FLOORS.filter(f=>f.boss).length,1);
 assert.equal(RUNE_DUNGEON_FLOORS[9].boss,true);
 assert.equal(RUNE_DUNGEON_FLOORS[9].name,'Runeheart Sanctum');
});

test('Dungeon difficulty and first-clear Energy rise toward the boss',()=>{
 for(let i=1;i<RUNE_DUNGEON_FLOORS.length;i++){
  assert.ok(RUNE_DUNGEON_FLOORS[i].hpMultiplier>=RUNE_DUNGEON_FLOORS[i-1].hpMultiplier);
  assert.ok(RUNE_DUNGEON_FLOORS[i].damageMultiplier>=RUNE_DUNGEON_FLOORS[i-1].damageMultiplier);
 }
 assert.equal(runeEnergyForFloor(10),60);
 assert.equal(RUNE_DUNGEON_TOTAL_ENERGY,240);
});

test('Rune Energy reward pack prices are server-defined, nonzero, and Royal requires near-full dungeon saving',()=>{
 assert.deepEqual(RUNE_PACK_COSTS,{hatchling:10,nest:45,guardian:100,royal:220});
 for(const [pack,cost] of Object.entries(RUNE_PACK_COSTS))assert.equal(runePackCost(pack),cost);
 assert.ok(RUNE_PACK_COSTS.hatchling<=runeEnergyForFloor(1));
 assert.ok(RUNE_PACK_COSTS.royal>=RUNE_DUNGEON_TOTAL_ENERGY-20);
 assert.equal(runePackCost('unknown'),0);
});
