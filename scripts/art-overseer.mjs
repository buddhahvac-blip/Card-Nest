import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=process.cwd();
const manifest=JSON.parse(fs.readFileSync(path.join(root,'data','season-one.json'),'utf8'));
const policy=JSON.parse(fs.readFileSync(path.join(root,'data','nest-mind-art-overseer.json'),'utf8'));
const taxonomy=JSON.parse(fs.readFileSync(path.join(root,'data','cardnest-taxonomy.json'),'utf8'));

const failures=[];
const warnings=[];
const pad=n=>String(n).padStart(3,'0');
const fail=m=>failures.push(m);
const warn=m=>warnings.push(m);

if(manifest.length!==369) fail(`Season One must contain 369 cards; found ${manifest.length}.`);

const ids=new Map(), nums=new Map();
for(const card of manifest){
  if(ids.has(card.id)) fail(`Duplicate permanent id: ${card.id} (#${pad(ids.get(card.id))} and #${pad(card.cardNumber)}).`);
  ids.set(card.id,card.cardNumber);
  if(nums.has(card.cardNumber)) fail(`Duplicate card number: ${card.cardNumber}.`);
  nums.set(card.cardNumber,card.id);
  for(const field of ['name','theme','rarity','battleClass','battleClassIconKey','creatureType','habitat','silhouette','artDirection']){
    if(!card[field]) fail(`CN1-${pad(card.cardNumber)} missing ${field}.`);
  }
  if(!taxonomy.themes[card.theme]) fail(`CN1-${pad(card.cardNumber)} has invalid theme: ${card.theme}.`);
  if(card.clan!==card.theme) fail(`CN1-${pad(card.cardNumber)} legacy clan/theme mismatch: ${card.clan} vs ${card.theme}.`);
  const expectedIcon=taxonomy.battleClasses[card.battleClass]?.iconKey;
  if(!expectedIcon) fail(`CN1-${pad(card.cardNumber)} has invalid battle class: ${card.battleClass}.`);
  else if(card.battleClassIconKey!==expectedIcon) fail(`CN1-${pad(card.cardNumber)} class icon mismatch: ${card.battleClassIconKey} should be ${expectedIcon} for ${card.battleClass}.`);
  if(String(card.creatureType).trim().toLowerCase()===String(card.theme).trim().toLowerCase()) fail(`CN1-${pad(card.cardNumber)} uses theme ${card.theme} as creature type.`);
  if(/\bclan\b/i.test(card.description||'')) fail(`CN1-${pad(card.cardNumber)} public description still uses clan terminology.`);
}
for(let n=1;n<=369;n++) if(!nums.has(n)) fail(`Missing canonical card number CN1-${pad(n)}.`);

for(const n of policy.styleAnchors.cardNumbers){
  const card=manifest.find(c=>c.cardNumber===n);
  if(!card?.fullCardUrl) fail(`Style anchor CN1-${pad(n)} must retain a production full-card URL.`);
}

const signatureGroups=new Map();
for(const c of manifest){
  const key=[c.theme,c.creatureType,c.silhouette,c.habitat].map(x=>String(x).toLowerCase().trim()).join('|');
  const list=signatureGroups.get(key)||[];
  list.push(c.cardNumber);
  signatureGroups.set(key,list);
}
for(const [key,list] of signatureGroups){
  if(list.length>1) warn(`Creative metadata collision for ${list.map(n=>'CN1-'+pad(n)).join(', ')}: ${key}`);
}

const fullCardHashes=new Map();
const cardsRoot=path.join(root,'public','cards','season-01');
if(fs.existsSync(cardsRoot)){
  for(const c of manifest){
    const dir=path.join(cardsRoot,pad(c.cardNumber));
    if(!fs.existsSync(dir)) continue;
    const candidate=['full-card.jpg','full-card.jpeg','full-card.png','full-card.webp'].map(f=>path.join(dir,f)).find(fs.existsSync);
    if(!candidate) continue;
    const hash=crypto.createHash('sha256').update(fs.readFileSync(candidate)).digest('hex');
    const prior=fullCardHashes.get(hash);
    if(prior && prior!==c.cardNumber) fail(`Exact duplicate production full-card asset: CN1-${pad(prior)} and CN1-${pad(c.cardNumber)}.`);
    fullCardHashes.set(hash,c.cardNumber);
  }
}

console.log(JSON.stringify({
  agent:policy.name,
  pillars:Object.keys(policy.pillars),
  cards:manifest.length,
  productionFullCardHashes:fullCardHashes.size,
  knownAnchorDefects:policy.styleAnchors.knownDefects||[],
  warnings,
  failures
},null,2));

if(failures.length) process.exitCode=1;
