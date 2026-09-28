import {auth} from '@/lib/auth/server';
import {json} from '@/lib/http';
export const dynamic='force-dynamic';
export async function GET(req:Request,context:{params:Promise<{path:string[]}>}){try{return await auth().handler().GET(req,context)}catch{return json({error:'Accounts are not configured yet.'},503)}}
export async function POST(req:Request,context:{params:Promise<{path:string[]}>}){if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Origin rejected'},403);const path=new URL(req.url).pathname;if(path.includes('/sign-up')&&process.env.PUBLIC_SIGNUPS_ENABLED!=='true')return json({error:'New accounts open after the launch review. Existing testers can sign in.'},403);try{return await auth().handler().POST(req,context)}catch{return json({error:'Account service unavailable'},503)}}
