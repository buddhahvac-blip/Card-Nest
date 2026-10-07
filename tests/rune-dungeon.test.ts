import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RUNE_DUNGEON_FLOORS,RUNE_DUNGEON_TOTAL_ENERGY,RUNE_DUNGEON_WORLDS,RUNE_PACK_COSTS,runeEnergyForFloor,runePackCost} from '../lib/rune-dungeon';

test('Rune Dungeon has ten ordered floors across three world boss encounters',()=>{
 assert.equal(RUNE_DUNGEON_FLOORS.length,10);
 assert.deepEqual(RUNE_DUNGEON_FLOORS.map(f=>f.floor),[1,2,3,4,5,6,7,8,9,10]);
 assert.deepEqual(RUNE_DUNGEON_FLOORS.filter(f=>f.boss).map(f=>f.floor),[3,7,10]);
 assert.equal(RUNE_DUNGEON_FLOORS[9].name,'Runeheart Sanctum');

 for(const world of RUNE_DUNGEON_WORLDS){
  const floors=RUNE_DUNGEON_FLOORS.filter(floor=>floor.world===world.id);
  const expected=Array.from(
   {length:world.floorRange[1]-world.floorRange[0]+1},
   (_,index)=>world.floorRange[0]+index
  );
  assert.deepEqual(floors.map(floor=>floor.floor),expected);
  assert.equal(floors.at(-1)?.boss,true);
 }
});

test('Dungeon difficulty and first-clear Energy rise within each world',()=>{
 for(const world of RUNE_DUNGEON_WORLDS){
  const floors=RUNE_DUNGEON_FLOORS.filter(floor=>floor.world===world.id);
  for(let i=1;i<floors.length;i++){
   assert.ok(floors[i].hpMultiplier>=floors[i-1].hpMultiplier);
   assert.ok(floors[i].damageMultiplier>=floors[i-1].damageMultiplier);
   assert.ok(floors[i].energy>=floors[i-1].energy);
  }
 }
 assert.equal(runeEnergyForFloor(10),60);
 assert.equal(RUNE_DUNGEON_TOTAL_ENERGY,240);
});

test('Rune Energy reward pack prices are server-defined and nonzero',()=>{
 assert.deepEqual(RUNE_PACK_COSTS,{hatchling:20,nest:50,guardian:90,royal:140});
 for(const [pack,cost] of Object.entries(RUNE_PACK_COSTS))assert.equal(runePackCost(pack),cost);
 assert.equal(runePackCost('unknown'),0);
});
