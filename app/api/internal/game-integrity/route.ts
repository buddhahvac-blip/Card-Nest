import {auditGameIntegrity} from '@/lib/game-integrity';

export const dynamic='force-dynamic';

export async function GET(req:Request){
 const secret=process.env.CRON_SECRET;
 const auth=req.headers.get('authorization');
 if(!secret||auth!==`Bearer ${secret}`)return Response.json({error:'Unauthorized'},{status:401});
 const result=await auditGameIntegrity();
 if(!result.ok)console.error('Game integrity audit detected anomalies',result.issues);
 return Response.json(result,{status:result.ok?200:409});
}
