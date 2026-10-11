import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assertVerifiedDungeonVictory,type VerifiedDungeonAttempt} from '../lib/dungeon-verified-settlement';

const now=new Date('2026-10-11T10:00:00.000Z');
const valid:VerifiedDungeonAttempt={
 userId:'player',floor:10,outcome:'won',
 completedAt:new Date('2026-10-11T09:59:00.000Z'),
 expiresAt:new Date('2026-10-11T10:10:00.000Z'),
 engineVersion:'server-v1',combatState:{result:'win'},
 combatVerifiedAt:new Date('2026-10-11T09:59:00.000Z'),turnIndex:3
};
test('only a server-verified winning dungeon attempt passes settlement preconditions',()=>{
 assert.doesNotThrow(()=>assertVerifiedDungeonVictory(valid,'player',10,now));
 for(const row of [
  {...valid,userId:'other'}, {...valid,floor:11},
  {...valid,outcome:'active' as const}, {...valid,outcome:'lost' as const},
  {...valid,engineVersion:null}, {...valid,combatState:null},
  {...valid,combatVerifiedAt:null}, {...valid,turnIndex:0},
  {...valid,completedAt:null},
  {...valid,combatVerifiedAt:new Date('2026-10-11T10:11:00Z')},
  {...valid,completedAt:new Date('2026-10-11T10:11:00Z')}
 ])assert.throws(()=>assertVerifiedDungeonVictory(row,'player',10,now));
});
