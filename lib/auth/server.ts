import 'server-only';
import {createNeonAuth} from '@neondatabase/auth/next/server';
let instance:ReturnType<typeof createNeonAuth>;
export function auth(){if(!process.env.NEON_AUTH_BASE_URL||!process.env.NEON_AUTH_COOKIE_SECRET)throw Error('Accounts are not configured');return instance??=createNeonAuth({baseUrl:process.env.NEON_AUTH_BASE_URL,cookies:{secret:process.env.NEON_AUTH_COOKIE_SECRET,sessionDataTtl:0}})}
export async function currentUser(){if(!process.env.NEON_AUTH_BASE_URL)return null;const {data}=await auth().getSession();if(!data?.user)return null;if(process.env.PUBLIC_SIGNUPS_ENABLED!=='true'&&data.user.email.toLowerCase()!==process.env.NEST_ADMIN_EMAIL?.toLowerCase())return null;return {userId:data.user.id,email:data.user.email,displayName:data.user.name||'Collector',verified:data.user.emailVerified}}
