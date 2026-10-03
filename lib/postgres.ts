import {Pool,PoolClient,QueryResult} from 'pg';
import {attachDatabasePool} from '@vercel/functions';

let pool:Pool;

function hardenedConnectionString(raw:string){
 try{
  const url=new URL(raw);
  if(/\.neon\.tech$/i.test(url.hostname))url.searchParams.set('sslmode','verify-full');
  return url.toString();
 }catch{return raw}
}

async function setSchema(c:PoolClient){
 await c.query('SET LOCAL search_path TO cardnest_v1, public')
}

export function database(){
 if(!process.env.DATABASE_URL)throw new Error('Database is not configured');
 if(!pool){
  pool=new Pool({
   connectionString:hardenedConnectionString(process.env.DATABASE_URL),
   max:5,
   connectionTimeoutMillis:10000,
   idleTimeoutMillis:10000
  });
  const connect=pool.connect.bind(pool);
  (pool as any).query=async (...args:any[]):Promise<QueryResult>=>{
   const c=await connect();
   try{
    await c.query('BEGIN');
    await setSchema(c);
    const result=await (c.query as any)(...args);
    await c.query('COMMIT');
    return result
   }catch(e){
    await c.query('ROLLBACK').catch(()=>{});
    throw e
   }finally{
    c.release()
   }
  };
  attachDatabasePool(pool)
 }
 return pool
}

export async function transaction<T>(fn:(client:PoolClient)=>Promise<T>){
 const c=await database().connect();
 try{
  await c.query('BEGIN');
  await setSchema(c);
  const result=await fn(c);
  await c.query('COMMIT');
  return result
 }catch(e){
  await c.query('ROLLBACK').catch(()=>{});
  throw e
 }finally{
  c.release()
 }
}
