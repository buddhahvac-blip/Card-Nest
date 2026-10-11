import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {RUNE_PACK_COSTS,runePackCost,runeUnlockedFloors,isRuneFloorUnlocked} from '../lib/rune-dungeon';

test('safe Dungeon Beta retains all three world entry points and sequential practice unlocks',()=>{
 assert.deepEqual(runeUnlockedFloors(new Set()),[1,11,21]);
 for(const first of [1,11,21]){
  const clears=new Set<number>();
  assert.equal(isRuneFloorUnlocked(first+1,clears),false);
  clears.add(first);
  assert.equal(isRuneFloorUnlocked(first+1,clears),true);
  assert.equal(isRuneFloorUnlocked(first+2,clears),false);
 }
});
test('existing earned Rune Energy claims stay cost-checked, transactional and Royal excluded',()=>{
 assert.deepEqual(RUNE_PACK_COSTS,{hatchling:100,nest:220,guardian:400});
 assert.equal(runePackCost('royal'),0);
 const route=readFileSync('app/api/dungeon/route.ts','utf8');
 const claim=route.split('const cost=runePackCost(body.pack);')[1]||'';
 assert.match(claim,/if\(!cost\)throw new RequestError/);
 assert.match(claim,/SELECT rune_energy,highest_cleared FROM rune_dungeon_progress WHERE user_id=\$1 FOR UPDATE/);
 assert.match(claim,/if\(Number\(progress.rune_energy\)<cost\)/);
 assert.match(claim,/await grantDungeonReward\(/);
 assert.match(claim,/UPDATE rune_dungeon_progress SET rune_energy=rune_energy-\$2/);
 assert.match(claim,/INSERT INTO rune_dungeon_claims/);
});
test('practice session cannot submit new wins or losses for reward settlement',()=>{
 const client=readFileSync('app/rune-dungeon-client.tsx','utf8');
 assert.match(client,/if\(rewardBetaPaused\|\|!progress\?\.signedIn\)/);
 assert.match(client,/if\(rewardBetaPaused\|\|!progress\?\.signedIn\|\|!attemptId\)/);
 assert.match(client,/rewardsEnabled:!!progress\?\.signedIn&&!rewardBetaPaused/);
});
