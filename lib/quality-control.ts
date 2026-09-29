import {createHash} from 'node:crypto';
import {existsSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import manifest from '../data/season-one.json';
import taxonomy from '../data/cardnest-taxonomy.json';
import ledger from '../data/season-one-art-ledger.json';
import incidents from '../data/qc-incidents.json';

export type Severity='CRITICAL'|'HIGH'|'MEDIUM'|'LOW';
export type Finding={code:string;severity:Severity;subject:string;message:string;fix:string};
export type Score='PASS'|'FAIL'|'REVIEW';
export const dimensions=['Canonical Data','Theme Accuracy','Theme Icon','Battle Class','Battle Class Icon','Stats','Rarity','Distinct Identity','CardNest Continuity','Creative Growth','Visual Quality','Typography','Mobile Display','Asset Integrity','Release Safety','Security'] as const;
export type QcReport={stage:'PREFLIGHT'|'REVIEW'|'PRODUCTION GATE';subject:string;scorecard:Record<(typeof dimensions)[number],Score>;issues:Finding[];recommendedFixes:string[];blockingIssues:Finding[];productionStatus:'REFERENCE ONLY'|'NEEDS REVISION'|'FOUNDER REVIEW'|'PRODUCTION READY'};
type Card=typeof manifest[number];
export const canonicalCards:Card[]=manifest;
const pad=(n:number)=>String(n).padStart(3,'0');
const label=(n:number)=>`CN1-${pad(n)}`;
const finding=(code:string,severity:Severity,subject:string,message:string,fix:string):Finding=>({code,severity,subject,message,fix});
const norm=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
function editDistance(a:string,b:string){let prev=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const row=[i];for(let j=1;j<=b.length;j++)row[j]=Math.min(row[j-1]+1,prev[j]+1,prev[j-1]+Number(a[i-1]!==b[j-1]));prev=row}return prev[b.length]}
export function diversity(cards:Card[]=canonicalCards){
 const count=(key:keyof Card)=>cards.reduce<Record<string,number>>((o,c)=>{const v=String(c[key]||'unspecified');o[v]=(o[v]||0)+1;return o},{});
 const tags=Object.fromEntries(['winged','quadruped','biped','aquatic','avian','reptilian','mammalian','insect','fantasy hybrid'].map(x=>[x,0]));
 for(const c of cards){const words=`${c.creatureType} ${c.silhouette}`.toLowerCase();for(const [tag,pattern] of Object.entries({winged:/wing|feather|avian|bird/,quadruped:/four.leg|quadruped/,biped:/two.leg|biped/,aquatic:/fish|marine|aquatic|otter|seal/,avian:/bird|avian|feather/,reptilian:/lizard|reptile|salamander|dragon/,mammalian:/cat|fox|ibex|marten|mammal|otter/,insect:/moth|bug|butterfly|beetle/, 'fantasy hybrid':/hybrid|chimera/}))if(pattern.test(words))tags[tag]++}
 return {total:cards.length,theme:count('theme'),rarity:count('rarity'),battleClass:count('battleClass'),creatureType:count('creatureType'),habitat:count('habitat'),silhouette:count('silhouette'),personality:count('personality'),bodyIndicators:tags,paletteByTheme:Object.fromEntries(Object.entries(taxonomy.themes).map(([k,v])=>[k,v.palette])),note:'Body indicators are conservative text matches, not verified anatomy. No equality target is imposed.'};
}
export function preflight(candidate:Partial<Card>&{name:string;theme:string;creatureType:string;silhouette:string;habitat:string},cards:Card[]=canonicalCards){
 const issues:Finding[]=[];const subject=candidate.cardNumber?label(candidate.cardNumber):candidate.name;
 if(candidate.cardNumber){const actual=cards.find(c=>c.cardNumber===candidate.cardNumber);if(!actual||actual.id!==candidate.id)issues.push(finding('INVENTED_CARD','CRITICAL',subject,'Card number and permanent ID must resolve to the manifest.','Use the exact canonical record.'));else for(const key of ['name','theme','rarity','creatureType','battleClass','health','attack','defense','speed','habitat','personality','silhouette'] as const)if(candidate[key]!==actual[key])issues.push(finding('CANONICAL_MISMATCH','CRITICAL',subject,`${key} differs from canonical manifest.`,`Lock ${key} from the manifest before generation.`))}
 const names=cards.filter(c=>c.id!==candidate.id&&editDistance(norm(c.name),norm(candidate.name))<=Math.max(2,Math.floor(norm(candidate.name).length/4))).slice(0,5);if(names.length)issues.push(finding('NAME_COLLISION','MEDIUM',subject,`Similar canonical names: ${names.map(c=>c.name).join(', ')}. Check future plans and trademarks manually.`,'Choose and review a clearly distinct name.'));
 const previous=cards.filter(c=>c.id!==candidate.id&&c.cardNumber<(candidate.cardNumber||370)).slice(-30);const same=previous.filter(c=>c.theme===candidate.theme&&[c.creatureType,c.silhouette,c.habitat].filter((v,i)=>v===[candidate.creatureType,candidate.silhouette,candidate.habitat][i]).length>=2);if(same.length)issues.push(finding('CREATIVE_REPETITION','MEDIUM',subject,`Similar theme/body/silhouette/habitat among recent cards: ${same.map(c=>label(c.cardNumber)).join(', ')}.`,'Vary silhouette, motion, setting or secondary palette without changing canon.'));
 return {subject,issues,distribution:diversity(cards)};
}
type Evidence={assetKind?:'SOURCE ART'|'FULL CARD'|'AVATAR'|'REFERENCE'|'REJECTED';assetPath?:string;observedText?:string;observedThemeIcon?:string;observedClassIcon?:string;observedTheme?:string;visualReviewed?:boolean;mobileReviewed?:boolean;rightsReviewed?:boolean;founderApproved?:boolean;assetHash?:string};
export function inspectCard(candidate:Partial<Card>,evidence:Evidence={},cards:Card[]=canonicalCards):QcReport{
 const subject=label(Number(candidate.cardNumber||0));const actual=cards.find(c=>c.cardNumber===candidate.cardNumber&&c.id===candidate.id);
 const scorecard=Object.fromEntries(dimensions.map(d=>[d,'REVIEW'])) as QcReport['scorecard'];const issues:Finding[]=[];
 const add=(code:string,severity:Severity,dimension:typeof dimensions[number],message:string,fix:string)=>{scorecard[dimension]='FAIL';issues.push(finding(code,severity,subject,message,fix))};
 if(!actual)add('INVENTED_CARD','CRITICAL','Canonical Data','Unknown or mismatched number/permanent ID.','Resolve exact manifest identity.');
 else {
  scorecard['Canonical Data']='PASS';
  for(const [key,dimension] of [['name','Canonical Data'],['theme','Theme Accuracy'],['themeIconKey','Theme Icon'],['battleClass','Battle Class'],['battleClassIconKey','Battle Class Icon'],['rarity','Rarity'],['health','Stats'],['attack','Stats'],['defense','Stats'],['speed','Stats']] as const)if(candidate[key]!==actual[key])add(`WRONG_${key.toUpperCase()}`,'CRITICAL',dimension,`${key} differs from the canonical record.`,`Use manifest ${key}; do not repair the manifest from a generated image.`);else if(scorecard[dimension]!=='FAIL')scorecard[dimension]='PASS';
  const expectedTheme=taxonomy.themes[actual.theme as keyof typeof taxonomy.themes]?.iconKey,expectedClass=taxonomy.battleClasses[actual.battleClass as keyof typeof taxonomy.battleClasses]?.iconKey;
  if(candidate.themeIconKey!==expectedTheme||evidence.observedThemeIcon&&evidence.observedThemeIcon!==expectedTheme)add('THEME_ICON','HIGH','Theme Icon',`Left badge must be ${expectedTheme}.`,'Render the canonical theme badge and verify the final pixels.');
  if(candidate.battleClassIconKey!==expectedClass||evidence.observedClassIcon&&evidence.observedClassIcon!==expectedClass)add('CLASS_ICON','HIGH','Battle Class Icon',`Right badge must be ${expectedClass}.`,'Render the canonical class badge and verify the final pixels.');
  if(evidence.observedTheme&&evidence.observedTheme!==actual.theme)add('PALETTE_DRIFT','HIGH','Theme Accuracy',`Visual review reports ${evidence.observedTheme}, canonical Theme is ${actual.theme}.`,'Correct dominant palette, lighting and environment.');
  if(candidate.isPackEligible||candidate.releaseStatus==='released'||candidate.artStatus==='live')add('PREMATURE_RELEASE','CRITICAL','Release Safety','This review build has no authorized live card or pack pool.','Keep card unreleased and ineligible pending launch approval.');else scorecard['Release Safety']='PASS';
  for(const i of incidents.filter(x=>x.cardNumber===actual.cardNumber&&actual.fullCardUrl)){
   const file=resolve('public',actual.fullCardUrl!.replace(/^\//,''));
   if(!('legacyAssetSha256' in i)||!existsSync(file)||createHash('sha256').update(readFileSync(file)).digest('hex')!==i.legacyAssetSha256)continue;
   const dimension=i.category as typeof dimensions[number];scorecard[dimension]='FAIL';issues.push(finding(i.id,i.severity as Severity,subject,i.description,i.fix));
  }
 }
 if(evidence.assetKind==='REFERENCE'||evidence.assetKind==='REJECTED')issues.push(finding('REFERENCE_ONLY','MEDIUM',subject,'Reference or rejected artwork cannot become final.','Generate and review a single canonical source image.'));
 if(evidence.observedText&&/openart|shutterstock|stock photo|watermark|pokemon|pikachu|disney/i.test(evidence.observedText))add('WATERMARK_OR_FOREIGN_MARK','CRITICAL','Asset Integrity','Detected a watermark or third-party mark in supplied text evidence.','Replace with clean, original, rights-reviewed art.');
 if(evidence.assetPath){const asset=resolve('public',evidence.assetPath.replace(/^\//,''));if(!asset.startsWith(resolve('public')+'/')||!existsSync(asset))add('MISSING_ASSET','CRITICAL','Asset Integrity','Referenced asset does not exist under public/.','Restore the expected asset and verify its path.');else if(scorecard['Asset Integrity']!=='FAIL')scorecard['Asset Integrity']='PASS'}
 if(evidence.visualReviewed){for(const d of ['Visual Quality','CardNest Continuity','Creative Growth','Distinct Identity'] as const)if(scorecard[d]==='REVIEW')scorecard[d]='PASS'}
 if(evidence.mobileReviewed)scorecard['Mobile Display']='PASS';if(evidence.rightsReviewed&&scorecard.Security!=='FAIL')scorecard.Security='PASS';
 // Text in a baked image cannot be verified from metadata or an OCR negative alone.
 if(evidence.observedText&&actual&&evidence.assetKind==='FULL CARD'){const t=evidence.observedText.toLowerCase();if(!t.includes(actual.name.toLowerCase())||!t.includes(pad(actual.cardNumber)))add('BAKED_TEXT','HIGH','Typography','Observed text does not confirm canonical name and number.','Render labels deterministically, then inspect the final card.');}
 const blockingIssues=issues.filter(i=>i.severity==='CRITICAL'||i.severity==='HIGH');
 const productionStatus=evidence.assetKind==='REFERENCE'||evidence.assetKind==='REJECTED'?'REFERENCE ONLY':blockingIssues.length?'NEEDS REVISION':!evidence.founderApproved||Object.values(scorecard).includes('REVIEW')?'FOUNDER REVIEW':'PRODUCTION READY';
 return {stage:evidence.founderApproved?'PRODUCTION GATE':'REVIEW',subject,scorecard,issues,recommendedFixes:[...new Set(issues.map(i=>i.fix))],blockingIssues,productionStatus};
}
export function inspectAvatar(profile:{nameCandidate:string;theme:string;battleClassCandidate:string;creatureType:string;habitat:string;silhouette:string;generationPrompt:string},assetPresent:boolean):QcReport{
 const scorecard=Object.fromEntries(dimensions.map(d=>[d,'REVIEW'])) as QcReport['scorecard'];const issues:Finding[]=[];
 if(!assetPresent){scorecard['Asset Integrity']='FAIL';issues.push(finding('MISSING_AVATAR','CRITICAL',profile.nameCandidate,'Generated avatar has no stored image.','Restore the stored image before review.'))}else scorecard['Asset Integrity']='PASS';
 if(!taxonomy.themes[profile.theme as keyof typeof taxonomy.themes]||!taxonomy.battleClasses[profile.battleClassCandidate as keyof typeof taxonomy.battleClasses]){scorecard['Canonical Data']='FAIL';issues.push(finding('INVALID_TAXONOMY','CRITICAL',profile.nameCandidate,'Unknown theme or battle class.','Use established CardNest taxonomy.'))}else{scorecard['Theme Icon']='PASS';scorecard['Battle Class']='PASS';scorecard['Battle Class Icon']='PASS'}
 const p=preflight({name:profile.nameCandidate,theme:profile.theme,creatureType:profile.creatureType,habitat:profile.habitat,silhouette:profile.silhouette});issues.push(...p.issues);
 scorecard.Typography='PASS'; // Avatar is source illustration with no baked game text.
 scorecard['Release Safety']='PASS';scorecard.Security='PASS';
 const blockingIssues=issues.filter(i=>['CRITICAL','HIGH'].includes(i.severity));
 return {stage:'REVIEW',subject:profile.nameCandidate,scorecard,issues,recommendedFixes:[...new Set(issues.map(i=>i.fix))],blockingIssues,productionStatus:blockingIssues.length?'NEEDS REVISION':'FOUNDER REVIEW'};
}
export function completeFounderReview(report:QcReport,checks:{visual:boolean;mobile:boolean;originality:boolean;theme:boolean;quality:boolean}){
 const result:QcReport=structuredClone(report);
 if(result.blockingIssues.length)return result;
 for(const [dimension,approved] of [['Visual Quality',checks.visual],['Mobile Display',checks.mobile],['Distinct Identity',checks.originality],['Theme Accuracy',checks.theme],['CardNest Continuity',checks.quality],['Creative Growth',checks.quality],['Canonical Data',checks.quality],['Rarity',checks.quality],['Stats',checks.quality]] as const)if(approved&&result.scorecard[dimension]==='REVIEW')result.scorecard[dimension]='PASS';
 if(Object.values(result.scorecard).every(x=>x==='PASS')){result.stage='PRODUCTION GATE';result.productionStatus='PRODUCTION READY'}
 return result;
}
export function auditSeason(root=process.cwd(),cards:Card[]=canonicalCards){
 const issues:Finding[]=[];const seenId=new Set<string>(),seenNumber=new Set<number>(),hashes=new Map<string,string>();
 const ocrAvailable=spawnSync('tesseract',['--version'],{timeout:2000,stdio:'ignore'}).status===0;let ocrScanned=0;
 for(const c of cards){const subject=label(c.cardNumber);if(seenId.has(c.id)||seenNumber.has(c.cardNumber))issues.push(finding('DUPLICATE_ID_OR_NUMBER','CRITICAL',subject,'Duplicate permanent ID or number.','Restore unique canonical identity.'));seenId.add(c.id);seenNumber.add(c.cardNumber);
  const r=inspectCard(c,{assetKind:c.fullCardUrl?'FULL CARD':'SOURCE ART'},cards);issues.push(...r.issues);
  for(const key of ['artworkUrl','avatarUrl','fullCardUrl','packRevealUrl'] as const){const url=c[key];if(!url)continue;const file=resolve(root,'public',url.replace(/^\//,''));if(!file.startsWith(join(root,'public')+'/')||!existsSync(file)){issues.push(finding('MISSING_ASSET','HIGH',subject,`${key} points to missing asset.`, 'Restore file or clear the manifest URL.'));continue}if(key==='fullCardUrl'){const hash=createHash('sha256').update(readFileSync(file)).digest('hex');const previous=hashes.get(hash);if(previous&&previous!==subject)issues.push(finding('DUPLICATE_ASSET','CRITICAL',subject,`Exact same full-card asset as ${previous}.`,'Replace duplicated asset with original approved art.'));hashes.set(hash,subject);if(ocrAvailable){ocrScanned++;const text=spawnSync('tesseract',[file,'stdout'],{encoding:'utf8',timeout:4000,maxBuffer:200000,stdio:['ignore','pipe','ignore']}).stdout||'';if(/openart|shutterstock|stock photo|watermark/i.test(text))issues.push(finding('WATERMARK_OCR','CRITICAL',subject,'OCR detected possible generator or stock watermark.','Hold asset and inspect visually before replacement.'))}}}
 }
 for(const n of ledger.productionComplete){const c=cards.find(x=>x.cardNumber===n);if(!c||!c.fullCardUrl||!existsSync(resolve(root,'public',c.fullCardUrl.replace(/^\//,'')))||c.artStatus!=='live')issues.push(finding('STALE_LEDGER','MEDIUM',label(n),'Ledger says production complete without a live, verified final asset.','Update ledger state after final art and visual review; do not count review images as complete.'))}
 if(cards.length!==369||seenNumber.size!==369)issues.push(finding('CANONICAL_COUNT','CRITICAL','Season One','Season One must retain 369 unique slots.','Restore manifest identity and count.'));
 for(const [name,url] of Object.entries({'Hatchling Pack':'/art/Hatchling Pack.webp','Nest Pack':'/art/Nest Pack.webp','Guardian Pack':'/art/Guardian Pack.webp','Royal Nest Pack':'/art/Royal Nest Pack.webp'}))if(!existsSync(resolve(root,'public',url.slice(1))))issues.push(finding('PACK_ASSET','HIGH',name,'Pack artwork missing.','Restore the pack art before selling.'));
 return {generatedAt:new Date().toISOString(),summary:Object.fromEntries(['CRITICAL','HIGH','MEDIUM','LOW'].map(s=>[s,issues.filter(i=>i.severity===s).length])),issues,diversity:diversity(cards),assetHashes:hashes.size,ocr:{available:ocrAvailable,scanned:ocrScanned,negativeMeansClear:false},incidents};
}
