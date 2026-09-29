import {auth} from '@/lib/auth/server';
import {json,sameOrigin,limitedText,RequestError} from '@/lib/http';
import {throttleAuth,auditDenied} from '@/lib/security';
export const dynamic='force-dynamic';

function logAuthFailure(error:unknown){
 const e=error as {name?:string;message?:string;code?:string};
 console.error('CardNest auth failure',{
  name:e?.name,
  code:e?.code,
  cookieSecretConfigured:!!process.env.NEON_AUTH_COOKIE_SECRET,
  baseUrlConfigured:!!process.env.NEON_AUTH_BASE_URL
 })
}

export async function GET(req:Request,context:{params:Promise<{path:string[]}>}){
 try{return await auth().handler().GET(req,context)}
 catch(error){logAuthFailure(error);return json({error:'Accounts are not configured yet.'},503)}
}

export async function POST(req:Request,context:{params:Promise<{path:string[]}>}){
 try{sameOrigin(req);await limitedText(req.clone(),8192)}catch(e){return json({error:(e as RequestError).message},(e as RequestError).status||400)}
 const path=new URL(req.url).pathname;
 if(path.includes('/sign-up')&&process.env.PUBLIC_SIGNUPS_ENABLED!=='true')return json({error:'New accounts open after the launch review. Existing testers can sign in.'},403);
 try{await throttleAuth(req,path);return await auth().handler().POST(req,context)}
 catch(error){if(error instanceof RequestError)return json({error:error.message},error.status);logAuthFailure(error);await auditDenied('auth-denied',null);return json({error:'Account service unavailable'},503)}
}
