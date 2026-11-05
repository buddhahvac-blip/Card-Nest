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
 assert.equal(state.turn,0);
});

test('server wins only after all three enemies reach zero HP',()=>{
 let state=createDungeonCombat(1,players,enemies,.2,.2);
 for(let i=0;i<100&&state.result==='active';i++)state=applyDungeonTurn(state,'strike');
 assert.equal(state.result,'won');
 assert.ok(state.enemy.every(foe=>foe.hp===0));
 assert.ok(state.player.some(hero=>hero.hp>0));
 assert.throws(()=>applyDungeonTurn(state,'strike'),'terminal victory cannot be played again');
});

test('strong enemies can defeat the player without creating a victory',()=>{
 let state=createDungeonCombat(10,players,enemies,5,5);
 for(let i=0;i<100&&state.result==='active';i++)state=applyDungeonTurn(state,'strike');
 assert.equal(state.result,'lost');
 assert.ok(state.player.every(hero=>hero.hp===0));
 assert.ok(state.enemy.some(foe=>foe.hp>0));
 assert.throws(()=>applyDungeonTurn(state,'strike'),'terminal defeat cannot be replayed');
});

test('unsupported abilities do not damage enemies or mutate caller state',()=>{
 const state=createDungeonCombat(1,players,enemies,.5,.5);
 assert.throws(()=>applyDungeonTurn(state,'ability'));
 assert.equal(state.turn,0);
 assert.ok(state.enemy.every(foe=>foe.hp===foe.maxHp));
 assert.throws(()=>applyDungeonTurn(state,'power'));
 assert.equal(state.turn,0);
});


test('starter speed buffs and debuffs work without trusting browser combat values',()=>{
 const base=createDungeonCombat(1,players,enemies,3,.1);
 const buffed=applyDungeonTurn(base,'ability');
 assert.equal(buffed.player[0].speedBonus,20);
 assert.equal(buffed.player[0].speedTurns,2);
 assert.equal(base.player[0].speedBonus,0,'transitions must not mutate saved state');
 const next=applyDungeonTurn(buffed,'strike');
 assert.equal(next.player[0].speedBonus,20);
 assert.equal(next.player[0].speedTurns,1);
 const elapsed=applyDungeonTurn(next,'strike');
 assert.equal(elapsed.player[0].speedBonus,0);
 assert.equal(elapsed.player[0].speedTurns,0);

 const slowTeam=['reserved-012','tidefin-003','shadowclaw-007'];
 const debuffed=applyDungeonTurn(createDungeonCombat(1,slowTeam,enemies,3,.1),'ability');
 assert.equal(debuffed.enemy[0].speedBonus,-20);
 assert.equal(debuffed.enemy[0].speedTurns,2);
});

test('battle expires in defeat at the hard 200-turn limit, with no fake victory',()=>{
 const state=createDungeonCombat(1,players,enemies,5,.01);
 state.turn=199;
 const capped=applyDungeonTurn(state,'guard');
 assert.equal(capped.turn,200);
 assert.equal(capped.result,'lost');
 assert.ok(capped.enemy.some(fighter=>fighter.hp>0));
 assert.throws(()=>applyDungeonTurn(capped,'strike'));
});
