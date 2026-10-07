import {test} from 'node:test';
import assert from 'node:assert/strict';
import {battleAbilityProfile,rarityAttackTuning} from '../lib/battle-ability-profile';

test('Uncommon guardians use the two-ability battle kit',()=>{
 assert.equal(battleAbilityProfile('uncommon'),'uncommon');
});

test('Rare, Epic and Legendary guardians use the four-ability high-rarity kit',()=>{
 for(const rarity of ['rare','epic','legendary'])assert.equal(battleAbilityProfile(rarity),'high');
});

test('Other rarities keep the standard battle kit',()=>{
 for(const rarity of ['common','ultra'])assert.equal(battleAbilityProfile(rarity),'standard');
});

test('Higher rarity attack tuning scales upward',()=>{
 assert.ok(rarityAttackTuning('epic').power>rarityAttackTuning('rare').power);
 assert.ok(rarityAttackTuning('legendary').special>rarityAttackTuning('epic').special);
});
