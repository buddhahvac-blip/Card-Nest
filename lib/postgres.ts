import {Pool,PoolClient} from 'pg';
import {attachDatabasePool} from '@vercel/functions';
let pool:Pool;
export function database(){if(!process.env.DATABASE_URL)throw new Error('Database is not configured');if(!pool){pool=new Pool({connectionString:process.env.DATABASE_URL,max:5,connectionTimeoutMillis:10000,idleTimeoutMillis:10000,options:'-c search_path=cardnest_v1,public'});attachDatabasePool(pool)}return pool}
export async function transaction<T>(fn:(client:PoolClient)=>Promise<T>){const c=await database().connect();try{await c.query('BEGIN');const result=await fn(c);await c.query('COMMIT');return result}catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}}
