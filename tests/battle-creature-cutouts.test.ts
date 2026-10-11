import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {battleCreatureCutoutFor} from '../lib/battle-creature-cutouts';

const battle=readFileSync(new URL('../app/nest-battles.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../app/battle-fx.module.css',import.meta.url),'utf8');

test('Phase 2B missing cutout safely returns null rather than guessing a missing URL',()=>{
 assert.equal(battleCreatureCutoutFor('nonexistent-card-2b'),null);
});

test('Phase 2B original portraits remain in both fighter buttons',()=>{
 assert.match(battle,/src=\{avatarFor\(activeCard\.id\)\}/);
 assert.match(battle,/src=\{avatarFor\(enemyCard\.id\)\}/);
 assert.match(battle,/battleCreatureCutoutFor\(activeCard\.id\)/);
 assert.match(battle,/battleCreatureCutoutFor\(enemyCard\.id\)/);
});

test('Phase 2B cutout is only visible behind preview cinematic flag and hides on failed load',()=>{
 assert.match(battle,/NEXT_PUBLIC_NESTRUNE_CINEMATIC_FX\s*===\s*["']true["']\s*&&\s*battleCreatureCutoutFor/);
 assert.match(css,/\.creatureCutout\[data-image-error=true\]\{display:none\}/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});
