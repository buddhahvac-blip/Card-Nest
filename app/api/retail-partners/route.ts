import {createHash,randomUUID} from 'node:crypto';
import {z} from 'zod';
import {strictBody,failure,json,RequestError,rateLimit} from '@/lib/http';
import {retailCatalog} from '@/lib/retail-catalog';
export const dynamic='force-dynamic';
const schema=z.strictObject({name:z.string().trim().min(2).max(80),business:z.string().trim().min(2).max(120),email:z.string().trim().email().max(254),notes:z.string().trim().max(500),items:z.array(z.strictObject({sku:z.string().max(40),quantity:z.number().int().min(1).max(99)})).min(1).max(73)});
export async function POST(req:Request){try{
 const b=await strictBody(req,schema,12000);
 const ip=req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()||req.headers.get('x-real-ip')||'unknown';
 await rateLimit('retail:'+createHash('sha256').update(ip).digest('hex').slice(0,24),5);
 const seen=new Set<string>();let total=0,quotes=0;
 const lines=b.items.map(i=>{const p=retailCatalog.find(p=>p.sku===i.sku);if(!p||seen.has(i.sku))throw new RequestError('Invalid or duplicate product code',400);seen.add(i.sku);if(p.dealerCents===null)quotes++;else total+=p.dealerCents*i.quantity;return [p.sku,p.name,p.format,'x'+i.quantity,p.dealerCents===null?'QUOTE':'$'+(p.dealerCents/100).toFixed(2)+'/unit'].join(' ')});
 const message=['Retail partner quote request — not a paid order','Business: '+b.business,'Catalog: 2026-11-23',...lines,'Estimated subtotal: $'+(total/100).toFixed(2)+' plus '+quotes+' quote-only SKU(s). GET and freight excluded.','Notes: '+b.notes].join('\n');
 const key=process.env.RESEND_API_KEY,from=process.env.RETAIL_ORDER_FROM;
 if(!key||!from)throw new RequestError('Online email delivery is not configured yet. Please email cardnestsupport@gmail.com to request a quote.',503);
 const code='NR-'+randomUUID().slice(0,8).toUpperCase();
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json','Idempotency-Key':code},body:JSON.stringify({from,to:['cardnestsupport@gmail.com'],reply_to:b.email,subject:'NestRune retail quote '+code+' — '+b.business.replace(/[\r\n]/g,' ').slice(0,100),text:['Reference: '+code,'Contact: '+b.name,'Email: '+b.email,message].join('\n')}),signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new RequestError('Email delivery could not be confirmed. Please contact cardnestsupport@gmail.com before retrying.',503);
 const accepted=await response.json();
 if(typeof accepted.id!=='string')throw new RequestError('Email delivery could not be confirmed. Please contact cardnestsupport@gmail.com.',503);
 return json({code});
 }catch(e){return failure(e)}}
