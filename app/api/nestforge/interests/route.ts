import {createHash} from 'node:crypto';
import {database} from '@/lib/postgres';
import {strictBody,rateLimit,RequestError,failure,json} from '@/lib/http';
import {interestCommand} from '@/lib/nestforge';
export const dynamic='force-dynamic';
export async function GET(){return json({enabled:process.env.NESTFORGE_PERSONALIZATION_ENABLED==='true',storage:'session only unless the visitor opts into anonymous aggregate counts',childProfiles:false})}
export async function POST(req:Request){try{
 if(process.env.NESTFORGE_PERSONALIZATION_ENABLED!=='true')throw new RequestError('Personalization is disabled',403);
 const b=await strictBody(req,interestCommand,512);
 const ip=req.headers.get('x-vercel-ip')||req.headers.get('x-real-ip')||'unknown';
 await rateLimit('interest:'+createHash('sha256').update(ip).digest('hex').slice(0,24),20);
 await database().query('INSERT INTO nestforge_interest_counts(interest,clicks) VALUES($1,1) ON CONFLICT(interest) DO UPDATE SET clicks=nestforge_interest_counts.clicks+1',[b.interest]);
 return json({saved:true});
}catch(e){return failure(e)}}
