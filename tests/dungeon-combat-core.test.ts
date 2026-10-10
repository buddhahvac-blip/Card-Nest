import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCombatState,advanceBasicCombatTurn,type CombatantStats} from '../lib/dungeon-combat-core';
const stat=(id:string):CombatantStats=>({id,health:100,attack:40,defense:10,speed:20,theme:'Bloom',weakness:'Tide',resistance:'Ember'});
const p=[stat('p1'),stat('p2'),stat('p3')],r=[stat('r1'),stat('r2'),stat('r3')];
const cards=Object.fromEntries([...p,...r].map(card=>[card.id,card]));
test('combat setup enforces exactly three unique units',()=>{
 assert.throws(()=>createCombatState([p[0],p[0],p[2]],r,1),/unique/);
 assert.throws(()=>createCombatState(p,r,-1),/multiplier/);
});
test('a basic strike advances state without mutating previous snapshot',()=>{
 const before=createCombatState(p,r,1);
 const next=advanceBasicCombatTurn(before,{type:'strike'},cards,0.5);
 assert.equal(before.turn,0);assert.equal(next.turn,1);
 assert.equal(before.rival[0].hp,100);
 assert.ok(next.rival[0].hp<100);
});
test('guard spends energy and cooldown rejects impossible duplicate action',()=>{
 const before=createCombatState(p,r,1);
 const next=advanceBasicCombatTurn(before,{type:'guard'},cards,0.5);
 assert.equal(next.player[0].energy,1);
 assert.equal(next.player[0].defenseCooldown,2);
 assert.throws(()=>advanceBasicCombatTurn(next,{type:'guard'},cards,0.5),/unavailable/);
});
test('finished battles cannot be replayed for new turns',()=>{
 const before=createCombatState(p,r,1);
 assert.throws(()=>advanceBasicCombatTurn({...before,outcome:'won'},{type:'strike'},cards,1),/finished/);
});
