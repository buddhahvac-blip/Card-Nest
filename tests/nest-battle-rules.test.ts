import test from 'node:test';
import assert from 'node:assert/strict';
import {affinityMultiplier,guardDamage,strikeDamage} from '../lib/nest-battle-rules';

test('affinity rewards weakness without overwhelming neutral play',()=>{
 assert.equal(affinityMultiplier('Tide',{weakness:'Tide',resistance:'Shadow'}),1.25);
 assert.equal(affinityMultiplier('Shadow',{weakness:'Tide',resistance:'Shadow'}),0.8);
 assert.equal(affinityMultiplier('Bloom',{weakness:'Tide',resistance:'Shadow'}),1);
});

test('Guard absorbs damage before HP',()=>{
 assert.deepEqual(guardDamage(15,10),{damage:5,guard:0,absorbed:10});
 assert.deepEqual(guardDamage(8,20),{damage:0,guard:12,absorbed:8});
});

test('base strikes stay positive against defensive guardians',()=>{
 const damage=strikeDamage(
  {attack:28,theme:'Mystic'},
  {defense:54,weakness:'Tide',resistance:'Shadow'}
 );
 assert.ok(damage>=4);
});
