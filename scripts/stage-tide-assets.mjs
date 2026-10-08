#!/usr/bin/env node
// Run locally AFTER unpacking the Tide ZIP in this repository root.
// This script never changes the season manifest, DB, battle logic or release flags.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd();
const catalog=JSON.parse(fs.readFileSync(path.join(root,'data/season-one.json'),'utf8'));
const expected=new Map([[70,'Dew Axolotl'],[71,'Pearl Seahorse'],[72,'Shell Crab'],[73,'Brook Otter']]);
const signatures=[];
for(const [n,name] of expected){
 const c=catalog.find(c=>c.cardNumber===n);
 assert(c&&c.name===name&&c.theme==='Tide'&&c.rarity==='common',`Canon mismatch #${n}`);
 const dir=path.join(root,'public/cards/season-01',String(n).padStart(3,'0'));
 for(const type of ['full-card.webp','avatar.webp']){
  const file=path.join(dir,type);
  assert(fs.existsSync(file),`Missing ${file}`);
  const buf=fs.readFileSync(file);
  assert(buf.byteLength>30000&&buf.toString('ascii',0,4)==='RIFF'&&buf.toString('ascii',8,12)==='WEBP',`Invalid webp ${file}`);
  signatures.push({card:n,type,bytes:buf.byteLength});
 }
}
const protectedCard=catalog.find(c=>c.cardNumber===74);
assert.equal(protectedCard?.name,'Bubble Pufferfish');
assert.equal(catalog.length,369);
assert.equal(new Set(catalog.map(c=>c.cardNumber)).size,369);
console.log(JSON.stringify({status:'ASSETS_STAGED_VALID',files:signatures,notes:['Do not publish Manta as #074','Correct #071 and #073 printed Rare before public release','Release/pack flags unchanged','Battle and dungeon runtime testing required']},null,2));
