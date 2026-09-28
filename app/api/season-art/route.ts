import {db} from '@/lib/nest-db';
import {seasonManifest as catalog} from '@/lib/season-manifest';
export const dynamic='force-dynamic';
export async function GET(){try{const result=await db().prepare('SELECT card_id,published FROM card_art').all<{card_id:string;published:string}>();return Response.json({art:Object.fromEntries(result.results.filter(r=>catalog.some(c=>c.id===r.card_id)).map(r=>[r.card_id,'/api/season-art/'+encodeURIComponent(r.card_id)+'?v='+encodeURIComponent(r.published)]))},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({art:{}},{status:503,headers:{'Cache-Control':'no-store'}})}}
