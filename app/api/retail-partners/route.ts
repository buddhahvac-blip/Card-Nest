import {createHash,randomUUID} from 'node:crypto';
import {z} from 'zod';
import {database} from '@/lib/postgres';
import {strictBody,failure,json,RequestError,rateLimit} from '@/lib/http';
import {retailCatalog} from '@/lib/retail-catalog';
export const dynamic='force-dynamic';
const schema=z.strictObject({name:z.string().trim().min(2).max(80),business:z.string().trim().min(2).max(120),email:z.string().trim().email().max(254),notes:z.string().trim().max(500),items:z.array(z.strictObject({sku:z.string().max(40),quantity:z.number().int().min(1).max(99)})).min(1).max(73)});
export async function POST(req:Request){try{
 const b=await strictBody(req,schema,12000);
 const ip=req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()||req.headers.get('x-real-ip')||'unknown';
 await rateLimit('retail:'+createHash('sha256').update(ip).digest('hex').slice(0,24),5);
 const seen=new Set<string>();let total=0,quotes=0;
 const lines=b.items.map(i=>{const p=retailCatalog.find(p=>p.sku===i.sku);if(!p||seen.has(i.sku))throw new RequestError('Invalid or duplicate product code',400);seen.add(i.sku);if(p.dealerCents===null)quotes++;else total+=p.dealerCents*i.quantity;return [p.sku,'x'+i.quantity,p.dealerCents===null?'QUOTE':'$'+(p.dealerCents/100).toFixed(2)+'/unit'].join(' ')});
 const message=['Retail partner quote request — not a paid order','Business: '+b.business,'Catalog: 2026-11-23',...lines,'Estimated subtotal: $'+(total/100).toFixed(2)+' plus '+quotes+' quote-only SKU(s). GET and freight excluded.','Notes: '+b.notes].join('\n');
 const result=await database().query('INSERT INTO support_tickets(id,name,email,category,subject,message) VALUES($1,$2,$3,$4,$5,$6) RETURNING number',[randomUUID(),b.name,b.email.toLowerCase(),'general',('Retail partner order: '+b.business).slice(0,120),message]);
 return json({code:'CN-'+String(result.rows[0].number).padStart(6,'0')});
 }catch(e){return failure(e)}}
