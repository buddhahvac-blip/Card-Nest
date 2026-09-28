import {database} from '@/lib/postgres';
export const dynamic='force-dynamic';
export async function GET(){try{const r=await database().query('SELECT count(*)::int AS cards FROM cards');return Response.json({ok:true,build:'cardnest-first-flight-v1',database:'connected',catalog:r.rows[0].cards,payments:'test-only-gated'},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({ok:false,build:'cardnest-first-flight-v1',database:'unavailable',payments:'disabled'},{status:503,headers:{'Cache-Control':'no-store'}})}}
