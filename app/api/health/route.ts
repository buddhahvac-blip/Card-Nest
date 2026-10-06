import {database} from '@/lib/postgres';
export const dynamic='force-dynamic';
export async function GET(){
 const configured=Boolean(process.env.DATABASE_URL);
 try{
  const r=await database().query('SELECT count(*)::int AS cards FROM cards');
  return Response.json({ok:true,build:'nestrune-first-flight-v1',database:'connected',catalog:r.rows[0].cards,payments:'test-only-gated'},{headers:{'Cache-Control':'no-store'}})
 }catch(error){
  const e=error as {name?:string;message?:string;code?:string};
  console.error('NestRune database health failure',{configured,name:e?.name,code:e?.code,message:undefined});
  return Response.json({ok:false,build:'nestrune-first-flight-v1',database:'unavailable',databaseConfigured:configured,payments:'disabled'},{status:503,headers:{'Cache-Control':'no-store'}})
 }
}
