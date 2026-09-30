import {affiliateDestination,recordAffiliateClick} from '@/lib/affiliate';
export const dynamic='force-dynamic';
export async function GET(_req:Request,{params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const target=affiliateDestination(slug);
 if(!target)return new Response('Affiliate partner link is not active.',{status:404,headers:{'Cache-Control':'no-store'}});
 await recordAffiliateClick(slug);
 return Response.redirect(target.url,302);
}
