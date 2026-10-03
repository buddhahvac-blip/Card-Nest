import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root=process.cwd();
const manifest=JSON.parse(fs.readFileSync(path.join(root,'data','season-one.json'),'utf8'));
const policy=JSON.parse(fs.readFileSync(path.join(root,'data','guardian-enforcer-policy.json'),'utf8'));
const taxonomy=JSON.parse(fs.readFileSync(path.join(root,'data','cardnest-taxonomy.json'),'utf8'));
const launch=JSON.parse(fs.readFileSync(path.join(root,'data','launch-readiness.json'),'utf8'));
const failures=[];

const allowedClans=new Set(policy.protectedInvariants.allowedClans);
const allowedThemes=new Set(policy.protectedInvariants.allowedThemes);
const allowedRarities=new Set(policy.protectedInvariants.allowedRarities);
const allowedClasses=new Set(policy.protectedInvariants.allowedBattleClasses);

if(manifest.length!==policy.protectedInvariants.seasonOneCardCount) failures.push('Season One canonical count changed.');
if(launch.mode!=='public-beta') failures.push('Public launch mode changed without review.');
if(!Array.isArray(launch.points)||launch.points.length!==10) failures.push('Ten-point launch readiness plan is missing or incomplete.');
if(launch.commercialSalesReady!==true&&process.env.CARDNEST_COMMERCIAL_SALES_APPROVED==='true') failures.push('Commercial sales approval set while launch readiness still says sales are closed.');

const ids=new Set(), nums=new Set();
for(const c of manifest){
  if(ids.has(c.id)) failures.push(`Duplicate card id: ${c.id}`);
  if(nums.has(c.cardNumber)) failures.push(`Duplicate card number: ${c.cardNumber}`);
  ids.add(c.id); nums.add(c.cardNumber);
  if(!allowedClans.has(c.clan)) failures.push(`Unexpected legacy clan on CN1-${String(c.cardNumber).padStart(3,'0')}: ${c.clan}`);
  if(!allowedThemes.has(c.theme)) failures.push(`Unexpected theme on CN1-${String(c.cardNumber).padStart(3,'0')}: ${c.theme}`);
  const expectedThemeIcon=taxonomy.themes[c.theme]?.iconKey;
  if(c.themeIconKey!==expectedThemeIcon) failures.push(`Theme icon mismatch on CN1-${String(c.cardNumber).padStart(3,'0')}: ${c.themeIconKey} vs ${expectedThemeIcon}`);
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
  /whsec_[A-Za-z0-9]{20,}/g,
  /OPENAI_API_KEY\s*=\s*['"]?sk-[A-Za-z0-9_-]+/g
];
const scanRoots=['app','lib','scripts','data','docs','tests'];
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
for(const name of ['.env','.env.local','.env.production','.env.production.local']){
  const tracked=spawnSync('git',['ls-files','--error-unmatch',name],{cwd:root,stdio:'ignore'});
  if(tracked.status===0)failures.push(`Private environment file tracked in Git: ${name}`);
}
if(process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_'))failures.push('A live Stripe key is not permitted in this review build.');
if(process.env.PAYMENTS_ENABLED==='true'&&process.env.CARDNEST_FOUNDER_PAYMENT_APPROVAL!=='true')failures.push('Payments enabled without explicit founder approval flag.');
if(process.env.PAYMENTS_ENABLED==='true'&&process.env.CARDNEST_NAME_CLEARANCE_APPROVED!=='true')failures.push('Payments enabled before CardNest name clearance approval.');
if(process.env.CARDNEST_COMMERCIAL_SALES_APPROVED==='true'&&process.env.CARDNEST_NAME_CLEARANCE_APPROVED!=='true')failures.push('Commercial sales approved before CardNest name clearance approval.');
if(process.env.CARDNEST_SEARCH_INDEXING_APPROVED==='true'&&process.env.CARDNEST_NAME_CLEARANCE_APPROVED!=='true')failures.push('Search indexing approved before CardNest name clearance approval.');
if(process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_'))failures.push('Live Stripe keys are blocked during public beta.');

const stripeSource=fs.readFileSync('lib/stripe.ts','utf8');
for(const guard of ['CARDNEST_FOUNDER_PAYMENT_APPROVAL','sk_test_'])if(!stripeSource.includes(guard))failures.push(`Payment runtime guard missing: ${guard}`);

const affiliateSource=fs.readFileSync('lib/affiliate.ts','utf8');
for(const guard of ['AFFILIATE_TCGPLAYER_APPROVED','AFFILIATE_EBAY_APPROVED','AFFILIATE_AMAZON_APPROVED','AFFILIATE_TARGET_APPROVED','AFFILIATE_WALMART_APPROVED','AFFILIATE_FANATICS_APPROVED','AFFILIATE_VAULTX_APPROVED','AFFILIATE_PSA_APPROVED','allowedHosts','affiliate-click'])if(!affiliateSource.includes(guard))failures.push(`Affiliate guard missing: ${guard}`);
const affiliateUi=fs.readFileSync('app/affiliate-discovery.tsx','utf8');
for(const guard of ['Affiliate disclosure:','rel="sponsored noopener noreferrer"','paid link'])if(!affiliateUi.includes(guard))failures.push(`Affiliate disclosure guard missing: ${guard}`);

const requiredGuardedRoutes={
  'app/api/nestforge/route.ts':['studioOwner()','strictBody(req,command','rateLimit(','state=\'production-ready\''],
  'app/api/nestforge/art/[id]/route.ts':['studioOwner()','owner_id=$2'],
  'app/api/studio/route.ts':['studioOwner()','strictBody(req,studioCommand'],
  'app/api/checkout/route.ts':['requirePayments()','strictBody(req,checkoutSchema','packCardAvailable(card,true)'],
  'app/api/nest/route.ts':['currentUser()','strictBody(req,nestCommand'],
  'app/api/nestforge/interests/route.ts':['NESTFORGE_PERSONALIZATION_ENABLED','strictBody(req,interestCommand'],
  'app/api/support/route.ts':['strictBody(req,createTicket','rateLimit(\'support:','studioOwner()'],
  'app/api/analytics/route.ts':['strictBody(req,eventSchema','rateLimit(\'analytics:','studioOwner()','createHash']
};
for(const [name,guards] of Object.entries(requiredGuardedRoutes)){
  const source=fs.existsSync(name)?fs.readFileSync(name,'utf8'):'';
  for(const guard of guards)if(!source.includes(guard))failures.push(`${name} missing required security gate: ${guard}`);
}
const forge=fs.readFileSync('lib/nestforge.ts','utf8');
for(const guard of ['daily>0','global>0','budget>0','unit>0','NESTFORGE_IMAGE_DAILY_BUDGET_CENTS'])if(!forge.includes(guard))failures.push(`NestForge missing generation cap ${guard}`);
const route=fs.readFileSync('app/api/nestforge/route.ts','utf8');
for(const guard of ['NESTFORGE_PAID_GENERATION_APPROVED','canPromote(row)','INSERT INTO security_events'])if(!route.includes(guard))failures.push(`NestForge missing approval or audit gate ${guard}`);
if(/process\.env\.PAYMENTS_ENABLED\s*=\s*['"]true['"]/.test(route))failures.push('NestForge may not enable payments.');

const art=spawnSync(process.execPath,[path.join(root,'scripts','art-overseer.mjs')],{stdio:'inherit'});
if(art.status!==0) failures.push('Nest Mind Art Overseer failed.');
const qc=spawnSync(process.execPath,['--import','tsx',path.join(root,'scripts','qc-audit.ts')],{stdio:'inherit'});
if(qc.status!==0) failures.push('CardNest QC production gate failed.');

console.log(JSON.stringify({agent:policy.name,failures},null,2));
if(failures.length) process.exitCode=1;
