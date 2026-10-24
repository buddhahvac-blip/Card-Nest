import {collectorMetricKind,collectorMetricSchema,collectorSessionHash} from '@/lib/collector-metrics';
import {database} from '@/lib/postgres';
import {failure,json,rateLimit,RequestError,strictBody} from '@/lib/http';
import {studioOwner} from '@/lib/studio-auth';

export const dynamic='force-dynamic';
export const runtime='nodejs';

// Stores only a one-way hashed, random browser-session token and a short product label.
// No IP, email, account ID, raw session ID or user-agent is stored in these events.
export async function POST(req:Request){
  try{
    const data=await strictBody(req,collectorMetricSchema,1024);
    const hash=collectorSessionHash(data.session);
    await rateLimit('collector-metrics:'+hash,20);
    const kind=collectorMetricKind[data.event];
    await database().query(
      'INSERT INTO security_events(kind,actor_id,subject,details) VALUES($1,NULL,$2,$3)',
      [kind,hash,JSON.stringify({product:data.event!=='visit'?data.product:null})]
    );
    return json({saved:true});
  }catch(e){return failure(e)}
}

export async function GET(){
  try{
    const owner=await studioOwner();
    if(!owner)throw new RequestError('Founder access required',403);
    const result=await database().query(
      "SELECT count(DISTINCT subject) FILTER (WHERE kind='collector-shop-visit')::int AS visitor_sessions, count(DISTINCT subject) FILTER (WHERE kind='collector-shop-inquiry')::int AS requested_sessions, count(*) FILTER (WHERE kind='collector-shop-inquiry')::int AS order_requests, count(*) FILTER (WHERE kind='collector-shop-contact')::int AS contact_clicks FROM security_events WHERE created>=now()-interval '30 days' AND kind IN ('collector-shop-visit','collector-shop-inquiry','collector-shop-contact')"
    );
    const recent=await database().query(
      "SELECT (created AT TIME ZONE 'Pacific/Honolulu')::date::text AS day,kind,count(*)::int AS events FROM security_events WHERE created>=now()-interval '14 days' AND kind IN ('collector-shop-visit','collector-shop-inquiry','collector-shop-contact') GROUP BY day,kind ORDER BY day DESC,kind LIMIT 30"
    );
    const stats=result.rows[0]||{};
    return json({windowDays:30,visitorSessions:Number(stats.visitor_sessions||0),orderRequestSessions:Number(stats.requested_sessions||0),orderRequests:Number(stats.order_requests||0),contactClicks:Number(stats.contact_clicks||0),completedPurchases:null,revenueCents:null,purchaseTrackingReady:false,note:'Session-based measurements, not unique people. Completed physical sales cannot be counted until a verified checkout and webhook are launched.',recent:recent.rows});
  }catch(e){return failure(e)}
}
