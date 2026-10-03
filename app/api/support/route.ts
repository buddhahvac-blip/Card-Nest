import {createHash,randomUUID} from 'node:crypto';
import {z} from 'zod';
import {database} from '@/lib/postgres';
import {strictBody,failure,json,RequestError,rateLimit} from '@/lib/http';
import {studioOwner} from '@/lib/studio-auth';

const categories=['account','collection','affiliate','bug','privacy','general'] as const;
const statuses=['open','in-progress','waiting','closed'] as const;

const createTicket=z.strictObject({
 name:z.string().trim().min(2).max(80),
 email:z.string().trim().email().max(254),
 category:z.enum(categories),
 subject:z.string().trim().min(3).max(120),
 message:z.string().trim().min(20).max(4000),
 website:z.string().max(0).optional()
});

const updateTicket=z.strictObject({
 id:z.string().uuid(),
 status:z.enum(statuses)
});

const code=(n:number|string)=>'CN-'+String(n).padStart(6,'0');

function requestKey(req:Request){
 const ip=req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()||req.headers.get('x-real-ip')||req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
 return createHash('sha256').update(ip).digest('hex').slice(0,24);
}

export const dynamic='force-dynamic';

export async function POST(req:Request){
 try{
  const b=await strictBody(req,createTicket,7000);
  if(b.website)throw new RequestError('Request rejected',400);
  await rateLimit('support:'+requestKey(req),5);
  const id=randomUUID();
  const r=await database().query(
   'INSERT INTO support_tickets(id,name,email,category,subject,message) VALUES($1,$2,$3,$4,$5,$6) RETURNING number,created',
   [id,b.name,b.email.toLowerCase(),b.category,b.subject,b.message]
  );
  const row=r.rows[0];
  return json({ticket:id,code:code(row.number),created:row.created});
 }catch(e){return failure(e)}
}

export async function GET(){
 try{
  const owner=await studioOwner();
  if(!owner)throw new RequestError('Founder access required',403);
  const r=await database().query("SELECT id,number,name,email,category,subject,message,status,created,updated,closed_at FROM support_tickets ORDER BY CASE status WHEN 'open' THEN 0 WHEN 'in-progress' THEN 1 WHEN 'waiting' THEN 2 ELSE 3 END, created DESC LIMIT 150");
  const counts=await database().query("SELECT status,count(*)::int AS count FROM support_tickets GROUP BY status");
  return json({tickets:r.rows.map(x=>({...x,code:code(x.number)})),counts:counts.rows});
 }catch(e){return failure(e)}
}

export async function PATCH(req:Request){
 try{
  const owner=await studioOwner();
  if(!owner)throw new RequestError('Founder access required',403);
  const b=await strictBody(req,updateTicket,1024);
  await rateLimit('support-admin:'+owner.userId,30);
  const r=await database().query(
   "UPDATE support_tickets SET status=$2,updated=now(),closed_at=CASE WHEN $2='closed' THEN coalesce(closed_at,now()) ELSE NULL END WHERE id=$1 RETURNING number,status,updated,closed_at",
   [b.id,b.status]
  );
  if(!r.rowCount)throw new RequestError('Ticket not found',404);
  return json({...r.rows[0],code:code(r.rows[0].number)});
 }catch(e){return failure(e)}
}
