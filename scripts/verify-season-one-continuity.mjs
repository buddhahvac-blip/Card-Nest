import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const cards=JSON.parse(fs.readFileSync(path.join(root,'data/season-one.json'),'utf8'));
const showcase=JSON.parse(fs.readFileSync(path.join(root,'data/season-one-showcase.json'),'utf8'));
const master=JSON.parse(fs.readFileSync(path.join(root,'data/common-master-art.json'),'utf8'));
const issues=[];
const warn=(type,detail)=>issues.push({severity:'REVIEW',type,detail});
const fail=(type,detail)=>issues.push({severity:'BLOCK',type,detail});
const byNumber=new Map(), byId=new Map();
if(cards.length!==369)fail('CANON_LENGTH',`Expected 369, got ${cards.length}`);
for(const c of cards){
 if(byNumber.has(c.cardNumber))fail('DUPLICATE_NUMBER',String(c.cardNumber));
 if(byId.has(c.id))fail('DUPLICATE_ID',c.id);
 byNumber.set(c.cardNumber,c); byId.set(c.id,c);
 if(c.clan!==c.theme||c.nestAffinity!==c.theme)fail('THEME_MISMATCH',String(c.cardNumber));
 if(!c.frameStyle?.includes(c.rarity))warn('FRAME_RARITY',`${c.cardNumber} ${c.frameStyle} / ${c.rarity}`);
 if(c.isPackEligible && c.releaseStatus==='unreleased')fail('UNRELEASED_PACK_ELIGIBLE',String(c.cardNumber));
}
for(let i=1;i<=369;i++)if(!byNumber.has(i))fail('MISSING_NUMBER',String(i));
for(const s of showcase){
 const c=byId.get(s.cardId);
 if(!c||c.cardNumber!==s.cardNumber)fail('SHOWCASE_ID_MISMATCH',String(s.cardNumber));
 if(s.isPackEligible && s.releaseStatus==='unreleased')fail('SHOWCASE_RELEASE',String(s.cardNumber));
}
for(const id of Object.keys(master))if(!byId.has(id))warn('ORPHAN_MASTER_ART',id);
const tide=[4,70,71,72,73];
for(const n of tide){
 const c=byNumber.get(n);
 if(!c||c.theme!=='Tide')fail('TIDE_IDENTITY',String(n));
 if(n!==4&&!c?.fullCardUrl)warn('TIDE_ART_NOT_IN_MANIFEST',String(n));
}
if(byNumber.get(74)?.name!=='Bubble Pufferfish')fail('RESERVED_074_PROTECTION','Card #074 must not be reassigned to Manta');
for(const c of cards.filter(c=>['rare','epic','ultra','legendary'].includes(c.rarity))){
 if(!c.abilityTertiary||!c.abilityDefense)warn('ABILITY_SCHEMA_REVIEW',String(c.cardNumber));
}
// Require actual assets before declaring a Tide card ready for production.
const fsExists=p=>fs.existsSync(path.join(root,'public',p.replace(/^\\//,'')));
for(const n of [70,71,72,73]){
 const c=byNumber.get(n);
 const full=`/cards/season-01/${String(n).padStart(3,'0')}/full-card.webp`;
 const avatar=`/cards/season-01/${String(n).padStart(3,'0')}/avatar.webp`;
 if(!fsExists(full)||!fsExists(avatar))warn('TIDE_ASSETS_NOT_COMMITTED',`${n}: ${full} / ${avatar}`);
 if(c?.rarity!=='common')warn('TIDE_CANON_RARITY_CHANGED',String(n));
}
const totals={cards:cards.length,artworkDirect:cards.filter(c=>!!c.artworkUrl).length,showcase:showcase.length,masterArtMappings:Object.keys(master).length,tideCards:cards.filter(c=>c.theme==='Tide').length};
const blockers=issues.filter(i=>i.severity==='BLOCK');
console.log(JSON.stringify({totals,blockers,reviewCounts:issues.filter(i=>i.severity==='REVIEW').reduce((a,i)=>(a[i.type]=(a[i.type]||0)+1,a),{}),sample:issues.slice(0,22)},null,2));
if(blockers.length)process.exitCode=1;
