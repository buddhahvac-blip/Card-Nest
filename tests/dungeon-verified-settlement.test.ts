import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDungeonCombat,applyDungeonTurn} from '../lib/dungeon-server-engine';
import {assertVerifiedDungeonVictory,type VerifiedDungeonAttempt} from '../lib/dungeon-verified-settlement';

const now=new Date('2026-10-11T10:00:00.000Z');
const players=['sproutling-001','tidefin-003','shadowclaw-007'];
const enemies=['emberwing-002','bloomtail-004','mindfeather-006'];

// Build a real deterministic terminal state using the server battle engine,
// rather than faking a victory marker in the settlement fixture.
function completedWin(){
 let state=createDungeonCombat(10,players,enemies,.05,.05);
 while(state.result==='active'&&state.turn<50)state=applyDungeonTurn(state,'strike');
 assert.equal(state.result,'won','a valid simulated first-floor-strength battle must finish');
 assert.ok(state.turn>0);
 return state;
}
const combat=completedWin();
const valid:VerifiedDungeonAttempt={
 userId:'player',floor:10,outcome:'won',
 completedAt:new Date('2026-10-11T09:59:00.000Z'),
 expiresAt:new Date('2026-10-11T10:10:00.000Z'),
 engineVersion:combat.engineVersion,combatState:combat,
 combatVerifiedAt:new Date('2026-10-11T09:59:00.000Z'),turnIndex:combat.turn
};
test('only an actual server-engine terminal win can authorize first-clear settlement',()=>{
 assert.doesNotThrow(()=>assertVerifiedDungeonVictory(valid,'player',10,now));
});

test('cross-account, floor mismatch, loss, active, missing verification and bad timestamps all fail',()=>{
 const bad:VerifiedDungeonAttempt[]=[
  {...valid,userId:'other'}, {...valid,floor:11},
  {...valid,outcome:'active'}, {...valid,outcome:'lost'},
  {...valid,engineVersion:null}, {...valid,engineVersion:'untrusted-client-v0'},
  {...valid,combatState:null}, {...valid,combatVerifiedAt:null},
  {...valid,turnIndex:0}, {...valid,completedAt:null},
  {...valid,combatVerifiedAt:new Date('2026-10-11T10:11:00Z')},
  {...valid,completedAt:new Date('2026-10-11T10:11:00Z')},
  {...valid,combatVerifiedAt:new Date('2026-10-11T09:59:30Z')},
  {...valid,expiresAt:new Date('2026-10-11T09:58:00Z')}
 ];
 for(const row of bad)assert.throws(()=>assertVerifiedDungeonVictory(row,'player',10,now));
 assert.throws(()=>assertVerifiedDungeonVictory(valid,'other',10,now));
 assert.throws(()=>assertVerifiedDungeonVictory(valid,'player',9,now));
});

test('forged terminal markers, inconsistent turns and contradictory fighter HP fail',()=>{
 const badStates=[
  {result:'won'}, // A browser-provided victory string is not combat proof.
  {...combat,result:'active'},
  {...combat,turn:combat.turn+1},
  {...combat,floor:11},
  {...combat,engineVersion:'old-client'},
  {...combat,enemy:combat.enemy.map((fighter,i)=>i===0?{...fighter,hp:1}:fighter)},
  {...combat,player:combat.player.map(fighter=>({...fighter,hp:0}))},
  {...combat,player:[]},
  {...combat,enemy:[]}
 ];
 for(const combatState of badStates)
  assert.throws(()=>assertVerifiedDungeonVictory({...valid,combatState},'player',10,now));
 assert.throws(()=>assertVerifiedDungeonVictory({...valid,turnIndex:combat.turn+1},'player',10,now));
 assert.throws(()=>assertVerifiedDungeonVictory({...valid,turnIndex:201},'player',10,now));
});
