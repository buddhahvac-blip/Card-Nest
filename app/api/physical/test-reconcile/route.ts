import {json} from '@/lib/http';
import {reconcileAbandonedPhysicalSandboxOrders} from '@/lib/physical-sandbox-reconciliation';
export const runtime='nodejs';
export async function POST(req:Request){
 const token=process.env.PHYSICAL_RECONCILIATION_SECRET;
 if(!token||token.length<32||req.headers.get('authorization')!=='Bearer '+token)return json({error:'Unauthorized'},401);
 try{return json(await reconcileAbandonedPhysicalSandboxOrders())}
 catch{return json({error:'Sandbox reconciliation unavailable'},503)}
}
