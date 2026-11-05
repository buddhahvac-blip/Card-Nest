import assert from 'node:assert/strict';
import test from 'node:test';
import {
 RUNE_DUNGEON_FLOORS,
 RUNE_DUNGEON_WORLDS,
 isRuneFloorUnlocked,
 runeUnlockedFloors,
 runeEnergyForFloor,
 dungeonRotationKey
} from '../lib/rune-dungeon';

test('dungeon has three distinct ten-floor campaigns with bosses',()=>{
 assert.equal(RUNE_DUNGEON_WORLDS.length,3);
 assert.equal(RUNE_DUNGEON_FLOORS.length,30);
 assert.deepEqual(RUNE_DUNGEON_FLOORS.map(f=>f.floor),Array.from({length:30},(_,i)=>i+1));
 for(const world of RUNE_DUNGEON_WORLDS){
  const floors=RUNE_DUNGEON_FLOORS.filter(f=>f.world===world.id);
  assert.equal(floors.length,10);
  assert.ok(floors.at(-1)?.worldBoss||floors.at(-1)?.boss);
 }
});

test('world progression is independent and sequential',()=>{
 const cleared=new Set<number>();
 assert.deepEqual(runeUnlockedFloors(cleared),[1,11,21]);
 assert.equal(isRuneFloorUnlocked(2,cleared),false);
 cleared.add(21);
 assert.equal(isRuneFloorUnlocked(22,cleared),true);
 assert.equal(isRuneFloorUnlocked(2,cleared),false);
 assert.equal(isRuneFloorUnlocked(12,cleared),false);
 cleared.add(1);
 assert.equal(isRuneFloorUnlocked(2,cleared),true);
 assert.equal(isRuneFloorUnlocked(3,cleared),false);
 assert.equal(isRuneFloorUnlocked(21,cleared),true);
});

test('every floor has a positive energy reward',()=>{
 for(const floor of RUNE_DUNGEON_FLOORS)assert.ok(runeEnergyForFloor(floor.floor)>0);
 assert.equal(runeEnergyForFloor(31),0);
});

test('daily rotation switches at 3 AM Eastern, including daylight saving time',()=>{
 const priorDay=dungeonRotationKey(new Date('2026-11-02T17:00:00Z'));
 const newDay=dungeonRotationKey(new Date('2026-11-03T17:00:00Z'));
 assert.equal(dungeonRotationKey(new Date('2026-11-03T07:59:00Z')),priorDay);
 assert.equal(dungeonRotationKey(new Date('2026-11-03T08:00:00Z')),newDay);
 assert.notEqual(priorDay,newDay);
});
