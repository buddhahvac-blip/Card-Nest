import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('beta dungeon blocks unverified victory rewards on the server',()=>{
 const route=readFileSync('app/api/dungeon/route.ts','utf8');
 const clear=route.split("if(body.action==='clear'){")[1]?.split("if(body.action==='loss'){")[0]||'';
 assert.match(clear,/throw new RequestError\(/);
 assert.doesNotMatch(clear,/rune_energy\s*=\s*rune_energy\s*\+/);
 assert.doesNotMatch(clear,/INSERT INTO rune_dungeon_clears/);
});
test('beta practice progression does not submit reward-clearing requests',()=>{
 const client=readFileSync('app/rune-dungeon-client.tsx','utf8');
 assert.match(client,/const rewardBetaPaused=true/);
 assert.match(client,/if\(rewardBetaPaused\|\|!progress\?\.signedIn\)/);
 assert.match(client,/setPracticeClears\(/);
 assert.match(client,/New Rune Energy rewards and saved clears are paused/);
});

test('beta vault never promises currently disabled first-clear rewards',()=>{
 const client=readFileSync('app/rune-dungeon-client.tsx','utf8');
 assert.match(client,/Practice clears do not earn Rune Energy during this beta/);
 assert.doesNotMatch(client,/Each Rune World awards 240 first-clear Energy/);
 assert.match(client,/Redeem previously earned Rune Energy/);
});

test('battle UI does not promise new rewards for practice wins',()=>{
 const battle=readFileSync('app/nest-battles.tsx','utf8');
 assert.match(battle,/dungeon\.rewardsEnabled\?'Rune Energy is a free beta gameplay reward/);
 assert.match(battle,/Practice clear — no new Rune Energy awarded during beta/);
 assert.match(battle,/Practice mode: no new Rune Energy is earned or saved during this beta/);
 assert.match(battle,/Dungeon Beta practice: victories do not grant Rune Energy or saved clears/);
});
