import {studioOwner} from '@/lib/studio-auth';
import {database} from '@/lib/postgres';
export const dynamic='force-dynamic';
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
 const owner=await studioOwner();if(!owner)return new Response('Forbidden',{status:403});
 const {id}=await params;if(!/^[0-9a-f-]{36}$/i.test(id))return new Response('Not found',{status:404});
 try{const {rows:[r]}=await database().query('SELECT o.body FROM nestforge_concepts c JOIN art_objects o ON o.key=c.asset_key WHERE c.id=$1 AND c.owner_id=$2',[id,owner.userId]);if(!r)return new Response('Not found',{status:404});return new Response(new Uint8Array(r.body),{headers:{'Content-Type':'image/png','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})}catch{return new Response('Unavailable',{status:503})}
}
