import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const combat=readFileSync(new URL('../app/nest-battles.tsx',import.meta.url),'utf8');
const audio=readFileSync(new URL('../lib/battle-audio.ts',import.meta.url),'utf8');
const effects=readFileSync(new URL('../app/battle-fx.module.css',import.meta.url),'utf8');

test('cinematic enhancements remain opt-in and cannot enable themselves by default',()=>{
 assert.match(combat,/NEXT_PUBLIC_NESTRUNE_CINEMATIC_FX\s*===\s*["']true["']/);
 assert.match(combat,/data-cinematic=/);
 assert.match(effects,/\.arena\[data-cinematic=true\].*cinematicStrike/);
 assert.match(effects,/\.arena\[data-cinematic=true\].*cinematicSpecial/);
});

test('phase 1B sound accent is tied to existing hit settlement and guarded by flag',()=>{
 assert.match(combat,/start\+settle\);/);
 assert.match(combat,/NEXT_PUBLIC_NESTRUNE_CINEMATIC_FX\s*===\s*'true'\s*&&\s*frame\.effect\.kind==='attack'/);
 assert.match(audio,/export function playCinematicImpact\(/);
});

test('phase 1C shows boss cues only for boss-floor actions and wins',()=>{
 assert.match(combat,/data-sovereign=\{!!\(dungeon\?\.boss\|\|dungeon\?\.worldBoss\)\}/);
 assert.match(combat,/data-boss-warning=\{!!\(dungeon\?\.boss\|\|dungeon\?\.worldBoss\) && fx\?\.side==='rival' && fx\?\.kind==='attack'\}/);
 assert.match(combat,/data-boss-defeated=\{!!\(dungeon\?\.boss\|\|dungeon\?\.worldBoss\) && phase==='finished' && isTeamDown\(rival\)\}/);
 assert.match(effects,/\.arena\[data-cinematic=true\]\[data-boss-warning=true\]/);
 assert.match(effects,/\.arena\[data-cinematic=true\]\[data-boss-defeated=true\]/);
});

test('reduced-motion override is available for cinematic creature and boss presentation',()=>{
 assert.match(effects,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(effects,/\.arena\[data-cinematic=true\]\[data-boss-warning=true\]::before\s*,/);
 assert.match(effects,/\.arena\[data-cinematic=true\] \.fighter,/);
});
