import 'server-only';
import {createNeonAuth} from '@neondatabase/auth/next/server';

const productionAuthBaseUrl='https://ep-proud-wildflower-b5rehm6t.neonauth.c-7.us-east-2.aws.neon.tech/neondb/auth';
let instance:ReturnType<typeof createNeonAuth>;

function baseUrl(){
 return process.env.NEON_AUTH_BASE_URL||productionAuthBaseUrl
}

export function auth(){
 const url=baseUrl();
 if(!process.env.NEON_AUTH_COOKIE_SECRET)throw Error('Accounts are not configured');
 return instance??=createNeonAuth({baseUrl:url,cookies:{secret:process.env.NEON_AUTH_COOKIE_SECRET,sessionDataTtl:0}})
}

export async function currentUser(){
 const {data}=await auth().getSession();
 if(!data?.user)return null;
 if(process.env.PUBLIC_SIGNUPS_ENABLED!=='true'&&data.user.email.toLowerCase()!==process.env.NEST_ADMIN_EMAIL?.toLowerCase())return null;
 return {userId:data.user.id,email:data.user.email,displayName:data.user.name||'Collector',verified:data.user.emailVerified}
}
