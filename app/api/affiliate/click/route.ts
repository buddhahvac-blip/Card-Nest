import {z} from 'zod';
import {strictBody,failure,json,rateLimit} from '@/lib/http';
import {recordAffiliateClick} from '@/lib/affiliate';
const schema=z.strictObject({slug:z.string().min(2).max(80)});
export async function POST(req:Request){
 try{
  const b=await strictBody(req,schema,512);
  await rateLimit('affiliate-click',120);
  await recordAffiliateClick(b.slug);
  return json({saved:true});
 }catch(e){return failure(e)}
}
