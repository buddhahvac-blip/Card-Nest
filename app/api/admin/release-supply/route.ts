import {z} from 'zod';
import {studioOwner} from '@/lib/studio-auth';
import {database} from '@/lib/postgres';
import {releaseSupply,RELEASE_CONTROL_ID} from '@/lib/release-supply';
import {strictBody,rateLimit,RequestError,failure,json} from '@/lib/http';

export const runtime='nodejs';
export const dynamic='force-dynamic';

const update=z.strictObject({
 commonPullCap:z.number().int().min(0).max(10000000),
 epicReleaseAt:z.string().datetime().nullable(),
 enabled:z.boolean()
});

export async function GET(){
 try{
  const owner=await studioOwner();
  if(!owner)throw new RequestError('Founder access required.',403);
  return json(await releaseSupply());
 }catch(e){return failure(e)}
}

export async function POST(req:Request){
 try{
  const owner=await studioOwner();
  if(!owner)throw new RequestError('Founder access required.',403);
  const body=await strictBody(req,update,1024);
  await rateLimit('release-supply:'+owner.userId,20);
  await database().query(
   'INSERT INTO release_controls(id,common_pull_cap,epic_release_at,enabled,updated_at) VALUES($1,$2,$3,$4,now()) ON CONFLICT(id) DO UPDATE SET common_pull_cap=excluded.common_pull_cap,epic_release_at=excluded.epic_release_at,enabled=excluded.enabled,updated_at=now()',
   [RELEASE_CONTROL_ID,body.commonPullCap,body.epicReleaseAt,body.enabled]
  );
  return json(await releaseSupply());
 }catch(e){return failure(e)}
}
