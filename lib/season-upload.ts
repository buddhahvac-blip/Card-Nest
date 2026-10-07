export const SEASON_UPLOAD_MAX_BYTES=12*1024*1024;
export const seasonUploadTypes=['image/png','image/jpeg','image/webp'] as const;

export function seasonUploadExtension(type:string){
  if(type==='image/png')return 'png';
  if(type==='image/jpeg')return 'jpg';
  if(type==='image/webp')return 'webp';
  return null;
}

export function validSeasonImage(type:string,bytes:Uint8Array){
  if(!seasonUploadTypes.includes(type as (typeof seasonUploadTypes)[number]))return false;
  if(bytes.length<512||bytes.length>SEASON_UPLOAD_MAX_BYTES)return false;
  if(type==='image/png')return bytes.length>8&&bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47;
  if(type==='image/jpeg')return bytes.length>3&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;
  if(type==='image/webp')return bytes.length>12&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
  return false;
}

export function uploadedSeasonCardState(art:string){
  return {
    art,
    status:'preview',
    artStatus:'live',
    releaseStatus:'preview',
    isCollectible:true,
    isPackEligible:true
  } as const;
}
