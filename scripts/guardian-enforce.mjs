import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root=process.cwd();
const manifest=JSON.parse(fs.readFileSync(path.join(root,'data','season-one.json'),'utf8'));
const policy=JSON.parse(fs.readFileSync(path.join(root,'data','guardian-enforcer-policy.json'),'utf8'));
const taxonomy=JSON.parse(fs.readFileSync(path.join(root,'data','cardnest-taxonomy.json'),'utf8'));
const failures=[];

const allowedClans=new Set(policy.protectedInvariants.allowedClans);
const allowedThemes=new Set(policy.protectedInvariants.allowedThemes);
const allowedRarities=new Set(policy.protectedInvariants.allowedRarities);
const allowedClasses=new Set(policy.protectedInvariants.allowedBattleClasses);

if(manifest.length!==policy.protectedInvariants.seasonOneCardCount) failures.push('Season One canonical count changed.');

const ids=new Set(), nums=new Set();
for(const c of manifest){
  if(ids.has(c.id)) failures.push(`Duplicate card id: ${c.id}`);
  if(nums.has(c.cardNumber)) failures.push(`Duplicate card number: ${c.cardNumber}`);
  ids.add(c.id); nums.add(c.cardNumber);
  if(!allowedClans.has(c.clan)) failures.push(`Unexpected legacy clan on CN1-${String(c.cardNumber).padStart(3,'0')}: ${c.clan}`);
  if(!allowedThemes.has(c.theme)) failures.push(`Unexpected theme on CN1-${String(c.cardNumber).padStart(3,'0')}: ${c.theme}`);
  if(policy.protectedInvariants.legacyClanMustEqualTheme && c.clan!==c.theme) failures.push(`Legacy clan/theme mismatch on CN1-${String(c.cardNumber).padStart(3,'0')}: ${c.clan} vs ${c.theme}`);
  const expectedIcon=taxonomy.battleClasses[c.battleClass]?.iconKey;
  if(c.battleClassIconKey!==expectedIcon) failures.push(`Class icon mismatch on CN1-${String(c.cardNumber).padStart(3,'0')}: ${c.battleClassIconKey} vs ${expectedIcon}`);
  if(/\bclan\b/i.test(c.description||'')) failures.push(`Public description uses deprecated clan terminology on CN1-${String(c.cardNumber).padStart(3,'0')}`);
  if(!allowedRarities.has(c.rarity)) failures.push(`Unexpected rarity on CN1-${String(c.cardNumber).padStart(3,'0')}: ${c.rarity}`);
  if(!allowedClasses.has(c.battleClass)) failures.push(`Unexpected battle class on CN1-${String(c.cardNumber).padStart(3,'0')}: ${c.battleClass}`);
  if(c.releaseStatus!==policy.protectedInvariants.defaultReleaseStatus) failures.push(`Release-state change requires approval: CN1-${String(c.cardNumber).padStart(3,'0')} is ${c.releaseStatus}`);
  if(c.isPackEligible!==policy.protectedInvariants.defaultPackEligibility) failures.push(`Pack-eligibility change requires approval: CN1-${String(c.cardNumber).padStart(3,'0')}`);
}
for(let n=1;n<=369;n++) if(!nums.has(n)) failures.push(`Missing canonical card number: ${n}`);

const secretPatterns=[
  /sk_live_[A-Za-z0-9]+/g,
  /rk_live_[A-Za-z0-9]+/g,
  /whsec_[A-Za-z0-9]+/g,
  /OPENAI_API_KEY\s*=\s*['"]?sk-[A-Za-z0-9_-]+/g
];
const scanRoots=['app','lib','scripts','data','docs'];
const scan=(p)=>{
  if(!fs.existsSync(p)) return;
  for(const e of fs.readdirSync(p,{withFileTypes:true})){
    const f=path.join(p,e.name);
    if(e.isDirectory()) scan(f);
    else if(/\.(ts|tsx|js|mjs|json|md|txt)$/.test(e.name)){
      const s=fs.readFileSync(f,'utf8');
      for(const pattern of secretPatterns){
        pattern.lastIndex=0;
        if(pattern.test(s)) failures.push(`Possible live secret committed in ${path.relative(root,f)}`);
      }
    }
  }
};
for(const d of scanRoots) scan(path.join(root,d));

const art=spawnSync(process.execPath,[path.join(root,'scripts','art-overseer.mjs')],{stdio:'inherit'});
if(art.status!==0) failures.push('Nest Mind Art Overseer failed.');

console.log(JSON.stringify({agent:policy.name,failures},null,2));
if(failures.length) process.exitCode=1;
