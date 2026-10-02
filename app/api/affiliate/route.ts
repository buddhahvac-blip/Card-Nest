import {affiliateCatalog} from '@/lib/affiliate';
export const dynamic='force-dynamic';
export async function GET(){
 const partners=affiliateCatalog();
 return Response.json({
  disclosure:'CardNest may earn a commission if you buy through these partner links, at no extra cost to you.',
  amazonDisclosure:partners.some(p=>p.partner==='amazon'&&p.active)?'As an Amazon Associate I earn from qualifying purchases.':null,
  partners
 },{headers:{'Cache-Control':'no-store'}});
}
