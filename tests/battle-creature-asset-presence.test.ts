import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {battleCreatureCutouts} from '../lib/battle-creature-cutouts';

test('every enabled battle cutout has a real local approved asset',()=>{
 for(const [id,url] of Object.entries(battleCreatureCutouts)){
  assert.match(id,/^[a-z0-9-]+$/,'Expected known canonical card ID');
  assert.match(url,/^\/art\/battle-creatures\/[a-z0-9-]+\.(webp|png)$/,'No external or guessed URL');
  const path=new URL('../public'+url,import.meta.url);
  assert.ok(existsSync(path),`Missing cutout asset for ${id}: ${url}`);
  const bytes=readFileSync(path);
  assert.ok(bytes.length>10_000,`Unexpectedly small cutout for ${id}`);
 }
});
