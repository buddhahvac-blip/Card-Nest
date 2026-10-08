import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RUNE_DUNGEON_FLOORS,RUNE_DUNGEON_TOTAL_ENERGY,RUNE_DUNGEON_WORLDS,RUNE_PACK_COSTS,runeEnergyForFloor,runePackCost,isRuneFloorUnlocked,runeUnlockedFloors,dungeonEnemyRotations} from '../lib/rune-dungeon';

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

test('all three worlds start open, but only level one in each is playable',()=>{
 assert.deepEqual(runeUnlockedFloors(new Set()),[1,11,21]);
});

test('clears unlock only the next level within their own world',()=>{
 const clears=new Set<number>();
 for(const world of [...RUNE_DUNGEON_WORLDS].reverse()){
  const [first,last]=world.floorRange;
  for(let floor=first;floor<=last;floor++){
   assert.equal(isRuneFloorUnlocked(floor,clears),true);
   if(floor<last)assert.equal(isRuneFloorUnlocked(floor+1,clears),false);
   clears.add(floor);
  }
 }
 assert.equal(runeUnlockedFloors(clears).length,30);
});

test('switching worlds, replaying and resuming old progress cannot skip levels',()=>{
 const mixed=new Set([1,11,21]);
 assert.deepEqual(runeUnlockedFloors(mixed),[1,2,11,12,21,22]);
 assert.equal(isRuneFloorUnlocked(10,mixed),false);
 assert.equal(isRuneFloorUnlocked(20,mixed),false);
 assert.equal(isRuneFloorUnlocked(30,mixed),false);
 const legacy=new Set(Array.from({length:15},(_,i)=>i+1));
 assert.equal(isRuneFloorUnlocked(16,legacy),true);
 assert.equal(isRuneFloorUnlocked(21,legacy),true);
 assert.equal(isRuneFloorUnlocked(22,legacy),false);
 // A sparse historical clear is replayable, but cannot bypass earlier missing levels.
 assert.equal(isRuneFloorUnlocked(25,new Set([25])),true);
 assert.equal(isRuneFloorUnlocked(26,new Set([25])),false);
 for(const floor of [0,31,1.5,NaN])assert.equal(isRuneFloorUnlocked(floor,legacy),false);
});


test('Dungeon rotation only uses integrated candidates and prefers elite cards for bosses',()=>{
 const cards=[
  {id:'b1',theme:'Bloom',rarity:'common'},{id:'b2',theme:'Bloom',rarity:'uncommon'},{id:'t1',theme:'Tide',rarity:'rare'},
  {id:'m1',theme:'Mystic',rarity:'epic'},{id:'m2',theme:'Mystic',rarity:'legendary'},{id:'e1',theme:'Ember',rarity:'common'},
  {id:'e2',theme:'Ember',rarity:'rare'},{id:'e3',theme:'Ember',rarity:'epic'},{id:'v1',theme:'Volt',rarity:'legendary'},
  {id:'s1',theme:'Shadow',rarity:'rare'},{id:'s2',theme:'Shadow',rarity:'epic'},{id:'s3',theme:'Shadow',rarity:'legendary'}
 ];
 const rotations=dungeonEnemyRotations(cards,'2026-10-08');
 for(const ids of Object.values(rotations)){
  assert.equal(ids.length,3);
  assert.equal(new Set(ids).size,3);
  for(const id of ids)assert.ok(cards.some(card=>card.id===id));
 }
 for(const floor of [10,20,30]){
  const ids=rotations[String(floor)];
  assert.ok(ids.every(id=>['rare','epic','ultra','legendary'].includes(cards.find(card=>card.id===id)!.rarity)));
 }
});
