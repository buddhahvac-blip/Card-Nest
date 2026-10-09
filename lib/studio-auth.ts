import {currentUser} from './auth/server';
import {database} from './postgres';
const bucket={async put(key:string,bytes:Uint8Array,_options?:unknown){await database().query('INSERT INTO art_objects(key,body) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET body=excluded.body',[key,Buffer.from(bytes)])},async get(key:string){const r=await database().query('SELECT body FROM art_objects WHERE key=$1',[key]);return r.rows[0]?{body:new Uint8Array(r.rows[0].body)}:null}};
export const runtime=()=>({OPENAI_API_KEY:process.env.OPENAI_API_KEY,NEST_IMAGE_DAILY_LIMIT:process.env.NEST_IMAGE_DAILY_LIMIT,NEST_IMAGE_MODEL:process.env.NEST_IMAGE_MODEL,BUCKET:process.env.DATABASE_URL?bucket:undefined});
export async function studioOwner(){const u=await currentUser();return u&&(u.role==='admin'||u.role==='founder')?u:null}
