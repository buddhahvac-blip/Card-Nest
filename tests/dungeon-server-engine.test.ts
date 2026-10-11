import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDungeonCombat,applyDungeonTurn} from '../lib/dungeon-server-engine';

const players=['sproutling-001','tidefin-003','shadowclaw-007'];
const enemies=['emberwing-002','bloomtail-004','mindfeather-006'];
test('server battle starts with exactly three legitimate characters',()=>{
 const state=createDungeonCombat(1,players,enemies,.58,.46);
 assert.equal(state.turn,0);assert.equal(state.result,'active');
 assert.equal(state.player.length,3);assert.equal(state.enemy.length,3);
 assert.throws(()=>createDungeonCombat(1,[players[0],players[0],players[1]],enemies,1,1));
 assert.throws(()=>createDungeonCombat(1,players,['made-up',...enemies.slice(1)],1,1));
});
test('turn updates server-owned HP and cannot be replayed on completed battles',()=>{
 const state=createDungeonCombat(1,players,enemies,.58,.46);
 const next=applyDungeonTurn(state,'strike');
 assert.equal(state.turn,0);
 assert.equal(next.turn,1);
 assert.ok(next.enemy.some((fighter,i)=>fighter.hp<state.enemy[i].hp));
 assert.throws(()=>applyDungeonTurn({...next,result:'won'},'strike'));
});
test('illegal swap and forged actions cannot advance battle',()=>{
 const state=createDungeonCombat(1,players,enemies,1,1);
 assert.throws(()=>applyDungeonTurn(state,'swap',0));
 assert.throws(()=>applyDungeonTurn(state,'swap',100));
 assert.throws(()=>applyDungeonTurn(state,'special'));
 assert.equal(state.turn,0);
});
