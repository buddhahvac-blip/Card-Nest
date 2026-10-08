export type QuickImageVerdict='PASS'|'FAIL';

export type QuickImageCheck={
 verdict:QuickImageVerdict;
 width:number|null;
 height:number|null;
 bytes:number;
 megabytes:number;
 aspectRatio:number|null;
 reasons:string[];
 warnings:string[];
 checks:{
  signature:boolean;
  dimensions:boolean;
  portrait:boolean;
  resolution:boolean;
  transferSize:boolean;
 };
};

const MAX_INTEGRATION_BYTES=6*1024*1024;
const WARN_BYTES=2500*1024;
const MIN_WIDTH=768;
const MIN_HEIGHT=1024;
const MIN_ASPECT=.58;
const MAX_ASPECT=.82;

function u16be(bytes:Uint8Array,i:number){return (bytes[i]<<8)|bytes[i+1]}
function u16le(bytes:Uint8Array,i:number){return bytes[i]|(bytes[i+1]<<8)}
function u24le(bytes:Uint8Array,i:number){return bytes[i]|(bytes[i+1]<<8)|(bytes[i+2]<<16)}
function u32be(bytes:Uint8Array,i:number){return ((bytes[i]<<24)>>>0)+(bytes[i+1]<<16)+(bytes[i+2]<<8)+bytes[i+3]}

export function imageDimensions(type:string,bytes:Uint8Array):{width:number;height:number}|null{
 if(type==='image/png'&&bytes.length>=24&&bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47){
  const width=u32be(bytes,16),height=u32be(bytes,20);
  return width&&height?{width,height}:null;
 }
 if(type==='image/jpeg'&&bytes.length>=12&&bytes[0]===0xff&&bytes[1]===0xd8){
  let i=2;
  const sof=new Set([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf]);
  while(i+8<bytes.length){
   while(i<bytes.length&&bytes[i]!==0xff)i++;
   while(i<bytes.length&&bytes[i]===0xff)i++;
   if(i>=bytes.length)break;
   const marker=bytes[i++];
   if(marker===0xd8||marker===0xd9)continue;
   if(i+1>=bytes.length)break;
   const length=u16be(bytes,i);
   if(length<2||i+length>bytes.length)break;
   if(sof.has(marker)&&length>=7){
    const height=u16be(bytes,i+3),width=u16be(bytes,i+5);
    return width&&height?{width,height}:null;
   }
   i+=length;
  }
 }
 if(type==='image/webp'&&bytes.length>=30&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP'){
  const chunk=String.fromCharCode(...bytes.slice(12,16));
  if(chunk==='VP8X'&&bytes.length>=30)return {width:1+u24le(bytes,24),height:1+u24le(bytes,27)};
  if(chunk==='VP8L'&&bytes.length>=25&&bytes[20]===0x2f){
   const b1=bytes[21],b2=bytes[22],b3=bytes[23],b4=bytes[24];
   return {width:1+(((b2&0x3f)<<8)|b1),height:1+(((b4&0x0f)<<10)|(b3<<2)|((b2&0xc0)>>6))};
  }
  if(chunk==='VP8 '&&bytes.length>=30&&bytes[23]===0x9d&&bytes[24]===0x01&&bytes[25]===0x2a){
   return {width:u16le(bytes,26)&0x3fff,height:u16le(bytes,28)&0x3fff};
  }
 }
 return null;
}

export function quickImageCheck(type:string,bytes:Uint8Array,signatureValid=true):QuickImageCheck{
 const dims=imageDimensions(type,bytes);
 const width=dims?.width??null,height=dims?.height??null;
 const aspectRatio=width&&height?width/height:null;
 const reasons:string[]=[];
 const warnings:string[]=[];
 const dimensionPass=Boolean(width&&height);
 const portrait=Boolean(width&&height&&height>width&&aspectRatio!>=MIN_ASPECT&&aspectRatio!<=MAX_ASPECT);
 const resolution=Boolean(width&&height&&width>=MIN_WIDTH&&height>=MIN_HEIGHT);
 const transferSize=bytes.length<=MAX_INTEGRATION_BYTES;
 if(!signatureValid)reasons.push('File signature does not match a supported PNG, JPG, or WebP image.');
 if(!dimensionPass)reasons.push('Image dimensions could not be read safely.');
 else{
  if(!portrait)reasons.push('Artwork must be portrait format with a card-friendly aspect ratio.');
  if(!resolution)reasons.push(`Resolution is too low. Minimum is ${MIN_WIDTH}×${MIN_HEIGHT}; received ${width}×${height}.`);
 }
 if(!transferSize)reasons.push('Image is over 6 MB. Compress it before upload to reduce buffering.');
 if(transferSize&&bytes.length>WARN_BYTES)warnings.push('Image passes, but compressing below 2.5 MB will improve mobile loading.');
 if(type!=='image/webp')warnings.push('WebP is preferred for the fastest card loading, though PNG/JPG can pass.');
 return {
  verdict:reasons.length?'FAIL':'PASS',
  width,height,bytes:bytes.length,megabytes:Number((bytes.length/1024/1024).toFixed(2)),aspectRatio:aspectRatio?Number(aspectRatio.toFixed(3)):null,
  reasons,warnings,
  checks:{signature:signatureValid,dimensions:dimensionPass,portrait,resolution,transferSize}
 };
}

export function integrationTargets(){
 return {packPulls:true,nestBattles:true,runeDungeon:true,paidSales:false} as const;
}
