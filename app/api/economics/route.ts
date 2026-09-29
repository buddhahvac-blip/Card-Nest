import {studioOwner} from '@/lib/studio-auth';
import {db} from '@/lib/nest-db';
import {validEconomics} from '@/lib/economics';
import {body,failure,rateLimit} from '@/lib/http';
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){const u=await studioOwner();if(!u)return reply({error:'Founder access required.'},403);try{const r=await db().prepare('SELECT scenario,updated FROM economics WHERE user_id = ?').bind(u.userId).first<{scenario:string;updated:string}>();return reply({scenario:r?JSON.parse(r.scenario):null,updated:r?.updated})}catch{return reply({error:'Pricing scenario could not load.'},503)}}
export async function POST(req:Request){const u=await studioOwner();if(!u)return reply({error:'Founder access required.'},403);try{const v=await body(req,8000);if(!validEconomics(v))return reply({error:'Enter nonnegative costs, percentages from 0–100, and whole-number sales volumes.'},400);await rateLimit('economics:'+u.userId,10);await db().prepare('INSERT INTO economics (user_id,scenario,updated) VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET scenario=excluded.scenario, updated=excluded.updated').bind(u.userId,JSON.stringify(v),new Date().toISOString()).run();return reply({saved:true})}catch(e){return failure(e)}}
