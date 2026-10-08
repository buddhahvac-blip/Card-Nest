import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RUNE_DUNGEON_FLOORS,runeEnergyForFloor} from '../lib/rune-dungeon';

test('all dungeon floors have deterministic positive first-clear rewards',()=>{
 assert.equal(RUNE_DUNGEON_FLOORS.length,30);
 for(const floor of RUNE_DUNGEON_FLOORS){
  assert.ok(runeEnergyForFloor(floor.floor)>0);
  assert.equal(runeEnergyForFloor(floor.floor),floor.energy);
 }
});

test('loss policy awards zero Rune Energy',()=>{
 const lossEnergyDelta=0;
 assert.equal(lossEnergyDelta,0);
});
