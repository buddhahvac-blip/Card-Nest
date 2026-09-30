import {affiliateCatalog} from '@/lib/affiliate';
export const dynamic='force-dynamic';
export async function GET(){
 return Response.json({
  disclosure:'CardNest may earn a commission if you buy through these partner links, at no extra cost to you.',
  partners:affiliateCatalog()
 },{headers:{'Cache-Control':'no-store'}});
}
