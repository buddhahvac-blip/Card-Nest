import {randomUUID} from 'node:crypto';
import {studioOwner,runtime as studioRuntime} from '@/lib/studio-auth';
import {seasonManifest} from '@/lib/season-manifest';
import {database,transaction} from '@/lib/postgres';
import {rateLimit,sameOrigin} from '@/lib/http';
import {seasonUploadExtension,validSeasonImage,uploadedSeasonCardState} from '@/lib/season-upload';
import {quickImageCheck,integrationTargets} from '@/lib/card-integration';

export const runtime='nodejs';
export const dynamic='force-dynamic';

export async function POST(req:Request){
  try{sameOrigin(req)}catch{return Response.json({error:'Request origin rejected'},{status:403})}
  const length=Number(req.headers.get('content-length'));
  if(Number.isFinite(length)&&length>13*1024*1024)return Response.json({error:'Upload is too large'},{status:413});
  const owner=await studioOwner();
  if(!owner)return Response.json({error:'Admin access required'},{status:403});
  try{
    await rateLimit('season-one-upload:'+owner.userId,30);
    const form=await req.formData();
    const cardId=String(form.get('cardId')||'');
    const file=form.get('file');
    const card=seasonManifest.find(entry=>entry.id===cardId);
    if(!card)return Response.json({error:'Unknown Season One slot'},{status:400});
    if(!(file instanceof File))return Response.json({error:'Choose an image file'},{status:400});
    const bytes=new Uint8Array(await file.arrayBuffer());
    const ext=seasonUploadExtension(file.type);
    const signatureValid=Boolean(ext&&validSeasonImage(file.type,bytes));
    const qc=quickImageCheck(file.type,bytes,signatureValid);
    if(qc.verdict==='FAIL'){
      await database().query("INSERT INTO security_events(kind,actor_id,subject,details) VALUES('founder-upload-failed',$1,$2,$3)",[owner.userId,card.id,JSON.stringify({number:card.cardNumber,uploadSource:'founder',qc})]);
      return Response.json({ok:false,error:'Image failed the fast integration check.',qc,card:{id:card.id,number:card.cardNumber,name:card.name}},{status:422});
    }

    const published=new Date().toISOString();
    const objectKey='season-1/'+String(card.cardNumber).padStart(3,'0')+'/'+randomUUID()+'.'+ext;
    const bucket=studioRuntime().BUCKET;
    if(!bucket)return Response.json({error:'Artwork storage is unavailable'},{status:503});
    await bucket.put(objectKey,bytes);

    const art='/api/season-art/'+encodeURIComponent(card.id)+'?v='+encodeURIComponent(published);
    const next=uploadedSeasonCardState(art);

    await transaction(async c=>{
      const {rowCount}=await c.query("UPDATE cards SET art=$2,status=$3,art_status=$4,release_status=$5,is_collectible=$6,is_pack_eligible=$7,upload_source='founder',approved_by_founder=true,founder_uploaded_at=now(),uploaded_by_user_id=$8 WHERE id=$1 AND season_id='season-1'",[card.id,next.art,next.status,next.artStatus,next.releaseStatus,next.isCollectible,next.isPackEligible,owner.userId]);
      if(!rowCount)throw Error('Season One card record is missing');
      await c.query("INSERT INTO card_art(card_id,job_id,object_key,published) VALUES($1,$2,$3,$4) ON CONFLICT(card_id) DO UPDATE SET job_id=excluded.job_id,object_key=excluded.object_key,published=excluded.published",[card.id,'manual-upload:'+randomUUID(),objectKey,published]);
      await c.query("INSERT INTO security_events(kind,actor_id,subject,details) VALUES('founder-upload-pass',$1,$2,$3)",[owner.userId,card.id,JSON.stringify({number:card.cardNumber,uploadSource:'founder',approvedByFounder:true,qc,targets:integrationTargets(),paidSales:false})]);
    });

    const {rows:[packState]}=await database().query("SELECT count(*) FILTER (WHERE sale_enabled)::int AS enabled FROM packs");
    return Response.json({
      ok:true,
      card:{id:card.id,number:card.cardNumber,name:card.name,art,status:'preview',packEligible:true,collectible:true,uploadSource:'founder',approvedByFounder:true,founderUploadedAt:published},
      paidSalesEnabled:Number(packState?.enabled||0)>0,
      qc,
      integration:integrationTargets(),
      message:'PASS · Founder Upload · approved and integrated into Season One, free pack pulls, Nest Battles, and the Rune Dungeon eligible roster. Paid sales remain off.'
    });
  }catch(error){
    console.error('Season One upload failed',{name:(error as Error)?.name});
    return Response.json({error:'Upload could not be completed'},{status:500});
  }
}
