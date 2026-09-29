import {randomUUID} from 'node:crypto';
import {studioOwner} from '@/lib/studio-auth';
import {database,transaction} from '@/lib/postgres';
import {strictBody,rateLimit,RequestError,failure,json} from '@/lib/http';
import {auditDenied} from '@/lib/security';
import {command,makeConcept,oversee,signature,generationLimits,canPromote,type ConceptProfile} from '@/lib/nestforge';

export const runtime='nodejs';
export const dynamic='force-dynamic';

export async function GET(){
 try{
  const owner=await studioOwner();if(!owner){await auditDenied('admin-denied',null);throw new RequestError('Founder access required',403)}
  const p=database();const [concepts,counts,usage,states]=await Promise.all([
   p.query('SELECT id,profile,state,overseer,review_note,generation_model,asset_key,founder_approval,created,updated FROM nestforge_concepts WHERE owner_id=$1 ORDER BY created DESC LIMIT 100',[owner.userId]),
   p.query('SELECT interest,clicks FROM nestforge_interest_counts ORDER BY clicks DESC LIMIT 18'),
   p.query('SELECT coalesce(sum(calls),0)::int AS calls,coalesce(sum(reserved_cents),0)::int AS reserved_cents FROM nestforge_usage WHERE day=CURRENT_DATE'),
   p.query('SELECT state,count(*)::int AS count FROM nestforge_concepts WHERE owner_id=$1 GROUP BY state',[owner.userId])
  ]);
  return json({concepts:concepts.rows.map(x=>({...x,profile:{...x.profile,productionAssetUrl:null}})),interests:counts.rows,usage:usage.rows[0],states:states.rows,limits:generationLimits(),personalizationEnabled:process.env.NESTFORGE_PERSONALIZATION_ENABLED==='true'});
 }catch(e){return failure(e)}
}

export async function POST(req:Request){
 try{
  const owner=await studioOwner();if(!owner){await auditDenied('admin-denied',null);throw new RequestError('Founder access required',403)}
  const b=await strictBody(req,command,4096);await rateLimit('nestforge:'+owner.userId,12);
  if(b.action==='idea'||b.action==='variation'){
   let signals:string[];
   if(b.action==='variation'){
    const previous=(await database().query('SELECT profile FROM nestforge_concepts WHERE id=$1 AND owner_id=$2',[b.id,owner.userId])).rows[0];
    if(!previous)throw new RequestError('Concept not found',404);
    signals=previous.profile.interestSignals;
   }else signals=b.interests;
   const result=await transaction(async c=>{
    await c.query('SELECT pg_advisory_xact_lock(hashtext($1), 2)',[owner.userId]);
    const existing=(await c.query('SELECT id,state FROM nestforge_concepts WHERE owner_id=$1 AND request_key=$2',[owner.userId,b.requestKey])).rows[0];if(existing)return {...existing,replayed:true};
    const today=(await c.query("SELECT count(*)::int AS count FROM nestforge_concepts WHERE owner_id=$1 AND created>=CURRENT_DATE",[owner.userId])).rows[0].count;
    if(today>=30)throw new RequestError('Daily concept limit reached',429);
    for(let attempt=0;attempt<12;attempt++){
     const id=randomUUID(),profile=makeConcept(signals,id),sig=signature(profile);
     const prior=((await c.query('SELECT 1 FROM nestforge_concepts WHERE signature=$1 LIMIT 1',[sig])).rowCount||0)>0;
     const report=oversee(profile);
     if(prior||!report.pass)continue;
     await c.query('INSERT INTO nestforge_concepts(id,owner_id,request_key,signature,profile) VALUES($1,$2,$3,$4,$5)',[id,owner.userId,b.requestKey,sig,JSON.stringify(profile)]);
     await c.query("INSERT INTO security_events(kind,actor_id,subject) VALUES('nestforge-idea',$1,$2)",[owner.userId,id]);
     return {id,state:'idea',profile};
    }
    throw new RequestError('Distinct concept could not be found; revise the interests',409);
   });
   return json(result);
  }
  if(b.action==='generate-art'){
   const limits=generationLimits();
   if(process.env.NESTFORGE_PAID_GENERATION_APPROVED!=='true'||!limits.enabled)throw new RequestError('Paid avatar generation is disabled until the founder sets an explicit budget and approves activation',503);
   const model=process.env.NESTFORGE_IMAGE_MODEL!;
   const locked=await transaction(async c=>{
    // Serialize all generation reservations so global and per-founder caps cannot race.
    await c.query('SELECT pg_advisory_xact_lock(52433081)');
    const {rows:[row]}=await c.query('SELECT * FROM nestforge_concepts WHERE id=$1 AND owner_id=$2 FOR UPDATE',[b.id,owner.userId]);
    if(!row)throw new RequestError('Concept not found',404);
    if(row.state!=='idea'||row.generation_model)throw new RequestError('Concept already generated; request a variation',409);
    const {rows:[total]}=await c.query('SELECT coalesce(sum(calls),0)::int AS calls,coalesce(sum(reserved_cents),0)::int AS spent FROM nestforge_usage WHERE day=CURRENT_DATE');
    const {rows:[person]}=await c.query('SELECT calls FROM nestforge_usage WHERE day=CURRENT_DATE AND owner_id=$1',[owner.userId]);
    if(total.calls>=limits.global||(person?.calls||0)>=limits.daily||total.spent+limits.unit>limits.budget)throw new RequestError('Generation cap or budget reached; no provider request sent',429);
    await c.query('INSERT INTO nestforge_usage(day,owner_id,calls,reserved_cents) VALUES(CURRENT_DATE,$1,1,$2) ON CONFLICT(day,owner_id) DO UPDATE SET calls=nestforge_usage.calls+1,reserved_cents=nestforge_usage.reserved_cents+$2',[owner.userId,limits.unit]);
    await c.query("UPDATE nestforge_concepts SET state='generated',generation_model=$3,updated=now() WHERE id=$1 AND owner_id=$2",[b.id,owner.userId,model]);
    return row;
   });
   try{
    const res=await fetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model,prompt:locked.profile.generationPrompt,n:1,size:'1024x1536',quality:'low',output_format:'png'}),signal:AbortSignal.timeout(150000)});
    if(!res.ok)throw new Error('Provider failure');const result=await res.json();const encoded=result?.data?.[0]?.b64_json;
    if(typeof encoded!=='string'||encoded.length>24000000)throw new Error('Invalid provider image');
    const image=Buffer.from(encoded,'base64');if(image.length<100||image.length>18000000||image.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error('Invalid PNG');
    const key='nestforge/'+b.id+'.png';
    await transaction(async c=>{await c.query('INSERT INTO art_objects(key,body) VALUES($1,$2)',[key,image]);await c.query("UPDATE nestforge_concepts SET state='overseer-review',asset_key=$2,updated=now() WHERE id=$1 AND owner_id=$3 AND state='generated'",[b.id,key,owner.userId]);await c.query("INSERT INTO security_events(kind,actor_id,subject,details) VALUES('art-generated',$1,$2,$3)",[owner.userId,b.id,JSON.stringify({bytes:image.length})])});
    return json({id:b.id,state:'overseer-review'});
   }catch{
    await database().query("UPDATE nestforge_concepts SET state='needs-revision',review_note='Generation failed or timed out; provider billing may still apply',updated=now() WHERE id=$1 AND owner_id=$2 AND state='generated'",[b.id,owner.userId]);
    return json({error:'Generation did not complete. It will not retry or spend again automatically.'},502);
   }
  }
  const result=await transaction(async c=>{
   const {rows:[row]}=await c.query('SELECT * FROM nestforge_concepts WHERE id=$1 AND owner_id=$2 FOR UPDATE',[b.id,owner.userId]);if(!row)throw new RequestError('Concept not found',404);
   const profile=row.profile as ConceptProfile;
   if(b.action==='oversee'){
    if(row.state!=='overseer-review'||!row.asset_key)throw new RequestError('Generated art must reach the Overseer first',409);
    const {rows:others}=await c.query('SELECT signature FROM nestforge_concepts WHERE id<>$1',[b.id]);
    const report=oversee(profile,others.map(x=>x.signature));
    const next=report.pass?'founder-review':'needs-revision';
    await c.query('UPDATE nestforge_concepts SET overseer=$2,state=$3,updated=now() WHERE id=$1',[b.id,JSON.stringify(report),next]);
    await c.query("INSERT INTO security_events(kind,actor_id,subject) VALUES('nestforge-overseer',$1,$2)",[owner.userId,b.id]);
    return {id:b.id,state:next,overseer:report};
   }
   if(b.action==='approve'||b.action==='reject'){
    if(row.state!=='founder-review')throw new RequestError('Founder review is not ready',409);
    if(b.action==='approve'&&(!row.asset_key||!row.overseer?.pass))throw new RequestError('Artwork has not passed the Overseer',409);
    const next=b.action==='approve'?'approved':'rejected';
    await c.query('UPDATE nestforge_concepts SET state=$3,review_note=$4,founder_approval=$5,updated=now() WHERE id=$1 AND owner_id=$2',[b.id,owner.userId,next,b.note,b.action==='approve'?new Date():null]);
    await c.query('INSERT INTO security_events(kind,actor_id,subject) VALUES($1,$2,$3)',[b.action==='approve'?'nestforge-approved':'nestforge-rejected',owner.userId,b.id]);
    return {id:b.id,state:next};
   }
   if(b.action==='promote'){
    if(!canPromote(row))throw new RequestError('Art, Overseer review, and founder approval are required',409);
    await c.query("UPDATE nestforge_concepts SET state='production-ready',updated=now() WHERE id=$1 AND owner_id=$2",[b.id,owner.userId]);
    await c.query("INSERT INTO security_events(kind,actor_id,subject) VALUES('nestforge-production',$1,$2)",[owner.userId,b.id]);
    // Does not touch canonical cards, pack art, sale flags, or public asset routes.
    return {id:b.id,state:'production-ready'};
   }
   throw new RequestError('Unsupported action');
  });
  return json(result);
 }catch(e){return failure(e)}
}
