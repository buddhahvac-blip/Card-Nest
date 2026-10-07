import {db} from '@/lib/nest-db';
export const dynamic='force-dynamic';

export async function GET(){
 try{
  const result=await db().prepare("SELECT ca.card_id,ca.published FROM card_art ca JOIN cards c ON c.id=ca.card_id WHERE c.art_status='live' AND c.release_status IN ('preview','released') AND c.is_collectible=true AND c.is_pack_eligible=true").all<{card_id:string;published:string}>();
  return Response.json({art:Object.fromEntries(result.results.map(r=>[r.card_id,'/api/season-art/'+encodeURIComponent(r.card_id)+'?v='+encodeURIComponent(r.published)]))},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({art:{}},{status:503,headers:{'Cache-Control':'no-store'}})}
}
