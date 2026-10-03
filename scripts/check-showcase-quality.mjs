import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const sharp=createRequire(require.resolve('next/package.json'))('sharp');
const root=process.cwd();
const records=JSON.parse(fs.readFileSync('data/season-one-showcase.json','utf8'));
const failures=[];
const audit=[];
for(const art of records){
 try {
  if(art.isPackEligible||art.isCollectible||art.releaseStatus!=='unreleased')throw Error('showcase release gate changed');
  const file=path.resolve(root,'public'+art.artworkUrl);
  if(!file.startsWith(path.join(root,'public')+path.sep))throw Error('artwork path escapes public assets');
  if(/avatar|thumbnail|preview/i.test(art.artworkUrl))throw Error('premium source points to a thumbnail');
  const bytes=fs.readFileSync(file);
  if(createHash('sha256').update(bytes).digest('hex')!==art.sha256)throw Error('source hash differs from reviewed record');
  const metadata=await sharp(bytes,{failOn:'warning'}).metadata();
  await sharp(bytes,{failOn:'warning'}).raw().toBuffer();
  if(metadata.width!==art.width||metadata.height!==art.height)throw Error('declared dimensions differ from actual image');
  if(metadata.width<1024||metadata.height<1536)throw Error('source below existing premium quality floor');
  if(Math.abs(metadata.width/metadata.height-2/3)>.005)throw Error('portrait aspect ratio changed');
  if(bytes.length>4*1024*1024)throw Error('display source exceeds 4 MiB budget');
  audit.push({card:art.cardNumber,width:metadata.width,height:metadata.height,sha256:art.sha256,higherResolutionMaster:metadata.width>=1280&&metadata.height>=1920});
 }catch(error){failures.push(`CN1-${art.cardNumber}: ${error.message}`)}
}
// A candidate can be checked before it is added to any public manifest.
const candidate=process.argv[2];
if(candidate){
 try{
  const metadata=await sharp(candidate,{failOn:'warning'}).metadata();
  await sharp(candidate,{failOn:'warning'}).raw().toBuffer();
  if(metadata.width<1280||metadata.height<1920)throw Error(`actual ${metadata.width}x${metadata.height}; replacement master requires at least 1280x1920`);
  if(Math.abs(metadata.width/metadata.height-2/3)>.005)throw Error('replacement master must retain 2:3 aspect ratio');
 }catch(error){failures.push(`Candidate rejected: ${error.message}`)}
}
console.log(JSON.stringify({checked:audit.length,images:audit,failures,scope:'Technical image checks only; human visual and originality review still required.'},null,2));
if(failures.length)process.exit(1);
