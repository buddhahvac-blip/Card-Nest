import {createHash} from 'node:crypto';
import {database} from './postgres';
import {rateLimit,RequestError} from './http';

const kinds=new Set(['auth-denied','admin-denied','art-approved','art-rejected','art-generated','art-review-failed','nestforge-idea','nestforge-overseer','nestforge-approved','nestforge-rejected','nestforge-production','stripe-admin','guardian-failure']);
export async function auditEvent(kind:string,actorId:string|null,subject:string|null=null,details:Record<string,string|number|boolean>={}){
 if(!kinds.has(kind))throw new Error('Unknown security event');
 // Allowlisted event types and deliberately small, non-sensitive metadata only.
 await database().query('INSERT INTO security_events(kind,actor_id,subject,details) VALUES($1,$2,$3,$4)',[kind,actorId,subject,JSON.stringify(details)]);
}
export async function auditDenied(kind:'auth-denied'|'admin-denied',actorId:string|null){try{await auditEvent(kind,actorId)}catch{console.error('Security audit storage unavailable',{kind})}}
export async function throttleAuth(req:Request,path:string){
 const ip=req.headers.get('x-vercel-ip')||req.headers.get('x-real-ip')||'unknown';
 const digest=createHash('sha256').update(ip).digest('hex').slice(0,24);
 await rateLimit(`auth:${path}:${digest}`,path.includes('reset-password')?5:10);
}
export function requireNoBody(req:Request){if(Number(req.headers.get('content-length'))>0)throw new RequestError('Unexpected request body');}
