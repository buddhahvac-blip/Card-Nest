import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const sharp=createRequire(require.resolve('next/package.json'))('sharp');
const root=process.cwd();
const outputs=[
  {file:'showcase-640.webp',width:640,height:854},
  {file:'showcase-960.webp',width:960,height:1281},
];
const report=[];

for(let cardNumber=1;cardNumber<=11;cardNumber++){
  const number=String(cardNumber).padStart(3,'0');
  const dir=path.join(root,'public','cards','season-01',number);
  const source=path.join(dir,'full-card.jpg');
  if(!fs.existsSync(source))throw new Error(`CN1-${number}: missing legacy full-card source`);
  const sourceMeta=await sharp(source,{failOn:'warning'}).metadata();
  if(sourceMeta.width!==320||sourceMeta.height!==427)throw new Error(`CN1-${number}: expected reviewed 320x427 source, got ${sourceMeta.width}x${sourceMeta.height}`);

  const built=[];
  for(const out of outputs){
    const target=path.join(dir,out.file);
    await sharp(source,{failOn:'warning'})
      .resize(out.width,out.height,{fit:'fill',kernel:sharp.kernel.lanczos3})
      .sharpen({sigma:0.65})
      .webp({quality:96,effort:6,smartSubsample:true})
      .toFile(target);

    const meta=await sharp(target,{failOn:'warning'}).metadata();
    if(meta.width!==out.width||meta.height!==out.height)throw new Error(`CN1-${number}: ${out.file} built at ${meta.width}x${meta.height}`);
    const bytes=fs.statSync(target).size;
    if(bytes>900*1024)throw new Error(`CN1-${number}: ${out.file} exceeds 900 KiB display budget`);
    built.push({file:out.file,width:meta.width,height:meta.height,bytes});
  }
  report.push({card:cardNumber,source:'320x427',displayMasters:built});
}

console.log(JSON.stringify({
  checked:report.length,
  cards:report,
  note:'Display masters improve high-DPI showcase rendering without changing canonical card art or release gates.'
},null,2));
