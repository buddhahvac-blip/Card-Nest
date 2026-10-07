import {db} from '@/lib/nest-db';
import {runtime} from '@/lib/studio-auth';
import {packCardAvailable} from '@/lib/release';

function contentType(key:string){
 if(key.endsWith('.webp'))return 'image/webp';
 if(key.endsWith('.jpg')||key.endsWith('.jpeg'))return 'image/jpeg';
 return 'image/png';
}

export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
 try{
  const {id}=await params;
  const row=await db().prepare("SELECT ca.object_key,c.status,c.release_status,c.is_collectible,c.is_pack_eligible,c.art,c.art_status FROM card_art ca JOIN cards c ON c.id=ca.card_id WHERE ca.card_id=?").bind(id).first<{object_key:string;status:string;release_status:string;is_collectible:boolean;is_pack_eligible:boolean;art:string|null;art_status:string}>();
  if(!row||!row.is_pack_eligible||!packCardAvailable(row,false))return new Response('Not found',{status:404});
  const obj=await runtime().BUCKET?.get(row.object_key);
  if(!obj)return new Response('Not found',{status:404});
  return new Response(obj.body,{headers:{'Content-Type':contentType(row.object_key),'Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff'}});
 }catch{return new Response('Image unavailable',{status:503})}
}
