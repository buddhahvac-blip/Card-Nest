import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const manifest=JSON.parse(fs.readFileSync(path.join(root,'data','season-one.json'),'utf8'));

const exists=(p)=>!!p && fs.existsSync(path.join(root,'public',p.replace(/^\//,'')));
const by=(key)=>Object.fromEntries([...new Set(manifest.map(c=>c[key]))].map(v=>[v,manifest.filter(c=>c[key]===v).length]));

const rows=manifest.map(c=>{
  const n=String(c.cardNumber).padStart(3,'0');
  const dir=path.join(root,'public','cards','season-01',n);
  const fullCandidates=[
    c.fullCardUrl,
    `/cards/season-01/${n}/full-card.jpg`,
    `/cards/season-01/${n}/full-card.webp`
  ].filter(Boolean);
  const avatarCandidates=[
    c.avatarUrl,
    `/cards/season-01/${n}/avatar.jpg`,
    `/cards/season-01/${n}/avatar.webp`
  ].filter(Boolean);
  const artCandidates=[
    c.artworkUrl,
    c.highResolutionArtworkUrl,
    `/cards/season-01/${n}/art.webp`
  ].filter(Boolean);
  return {
    cardNumber:c.cardNumber,id:c.id,name:c.name,clan:c.clan,rarity:c.rarity,
    folder:fs.existsSync(dir),
    fullCard:fullCandidates.some(exists),
    avatar:avatarCandidates.some(exists),
    sourceArt:artCandidates.some(exists),
    releaseStatus:c.releaseStatus,
    packEligible:c.isPackEligible,
    reviewStatus:c.reviewStatus
  };
});

const dupIds=Object.entries(rows.reduce((m,r)=>(m[r.id]=(m[r.id]||0)+1,m),{})).filter(([,n])=>n>1);
const dupNums=Object.entries(rows.reduce((m,r)=>(m[r.cardNumber]=(m[r.cardNumber]||0)+1,m),{})).filter(([,n])=>n>1);
const missingFull=rows.filter(r=>!r.fullCard);
const missingAvatar=rows.filter(r=>!r.avatar);
const missingSource=rows.filter(r=>!r.sourceArt);
const unsafe=rows.filter(r=>r.releaseStatus!=='unreleased'||r.packEligible!==false);

const report={
  total:rows.length,
  clans:by('clan'),
  rarities:by('rarity'),
  fullCardAssets:rows.filter(r=>r.fullCard).length,
  avatarAssets:rows.filter(r=>r.avatar).length,
  sourceArtAssets:rows.filter(r=>r.sourceArt).length,
  missingFullCard:missingFull.length,
  missingAvatar:missingAvatar.length,
  missingSourceArt:missingSource.length,
  duplicateIds:dupIds,
  duplicateCardNumbers:dupNums,
  unsafeReleaseFlags:unsafe.map(r=>({cardNumber:r.cardNumber,id:r.id,releaseStatus:r.releaseStatus,packEligible:r.packEligible})),
  firstMissingFullCard:missingFull.slice(0,25).map(r=>({cardNumber:r.cardNumber,id:r.id,name:r.name,clan:r.clan,rarity:r.rarity}))
};

console.log(JSON.stringify(report,null,2));
if(rows.length!==369 || dupIds.length || dupNums.length || unsafe.length) process.exitCode=1;
