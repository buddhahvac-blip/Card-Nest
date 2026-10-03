import {createHash,randomUUID} from 'node:crypto';
import {z} from 'zod';
import {database} from '@/lib/postgres';
import {failure,json,rateLimit,strictBody} from '@/lib/http';

const schema=z.strictObject({
 session:z.string().uuid(),
 favoriteGuardian:z.string().trim().max(80),
 wouldCollect:z.enum(['yes','maybe','no']),
 packFun:z.number().int().min(1).max(5),
 returnReason:z.string().trim().min(10).max(300),
 nextPriority:z.enum(['collecting','battles','stories','trading','customization'])
});
function hashSession(id:string){return createHash('sha256').update(id).digest('hex').slice(0,32)}

export async function POST(req:Request){
 try{
  const body=await strictBody(req,schema,2048);
  const sessionHash=hashSession(body.session);
  await rateLimit('feedback:'+sessionHash,3);
  const p=database();
  await p.query(
   `INSERT INTO beta_feedback(id,session_hash,favorite_guardian,would_collect,pack_fun,return_reason,next_priority)
    VALUES($1,$2,$3,$4,$5,$6,$7)`,
   [randomUUID(),sessionHash,body.favoriteGuardian||null,body.wouldCollect,body.packFun,body.returnReason,body.nextPriority]
  );
  return json({saved:true});
 }catch(e){return failure(e)}
}
