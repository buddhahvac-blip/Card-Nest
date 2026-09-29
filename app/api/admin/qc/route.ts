import {z} from 'zod';
import {studioOwner} from '@/lib/studio-auth';
import {database} from '@/lib/postgres';
import {strictBody,rateLimit,RequestError,failure,json} from '@/lib/http';
import {auditDenied} from '@/lib/security';
import {auditSeason,inspectAvatar} from '@/lib/quality-control';

export const runtime='nodejs';
export const dynamic='force-dynamic';
const command=z.strictObject({action:z.literal('run-full-audit')});

export async function POST(req:Request){
 try{
  const owner=await studioOwner();if(!owner){await auditDenied('admin-denied',null);throw new RequestError('Founder access required',403)}
  await strictBody(req,command,256);await rateLimit('qc-audit:'+owner.userId,3);
  const report=auditSeason();
  const rows=(await database().query('SELECT profile,state,asset_key,overseer FROM nestforge_concepts WHERE owner_id=$1 ORDER BY created DESC LIMIT 500',[owner.userId])).rows;
  const concepts=rows.map(row=>({name:row.profile.nameCandidate,state:row.state,report:inspectAvatar(row.profile,!!row.asset_key),storedReview:row.overseer?.quality?.productionStatus||null}));
  const issues=[...report.issues,...concepts.filter(x=>x.state==='production-ready'&&x.storedReview!=='PRODUCTION READY').map(x=>({code:'UNVERIFIED_AVATAR',severity:'CRITICAL' as const,subject:x.name,message:'Production-ready concept lacks passing QC evidence.',fix:'Return to founder review and record required checks.'}))];
  const summary=Object.fromEntries(['CRITICAL','HIGH','MEDIUM','LOW'].map(s=>[s,issues.filter(i=>i.severity===s).length]));
  await database().query("INSERT INTO security_events(kind,actor_id,subject,details) VALUES('qc-full-audit',$1,'Season One',$2)",[owner.userId,JSON.stringify({summary,concepts:rows.length})]);
  return json({...report,summary,issues,concepts:concepts.map(x=>({name:x.name,state:x.state,productionStatus:x.report.productionStatus,storedReview:x.storedReview})),limits:{mobile:'Visual display requires browser checks at phone, tablet, desktop and landscape viewports; no screenshot was inspected by this server audit.',ocr:'Image pixels and embedded text were not conclusively recognized; negative watermark detection is never a clearance.',rights:'Similarity to protected franchise art needs human review; no legal clearance is inferred.'}});
 }catch(e){return failure(e)}
}
