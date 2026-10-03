import {createHash} from 'node:crypto';
import {z} from 'zod';
import {database} from '@/lib/postgres';
import {strictBody,failure,json,rateLimit,RequestError} from '@/lib/http';
import {studioOwner} from '@/lib/studio-auth';

const eventSchema=z.discriminatedUnion('event',[
 z.strictObject({event:z.literal('visit'),session:z.string().uuid()}),
 z.strictObject({event:z.literal('season-view'),session:z.string().uuid()}),
 z.strictObject({event:z.literal('card-view'),session:z.string().uuid(),dimension:z.string().regex(/^[a-z0-9-]{2,80}$/)}),
 z.strictObject({event:z.literal('pack-preview'),session:z.string().uuid(),dimension:z.enum(['hatchling','nest','guardian','royal'])}),
 z.strictObject({event:z.literal('theme-select'),session:z.string().uuid(),dimension:z.enum(['Ember','Tide','Bloom','Volt','Mystic','Shadow'])}),
 z.strictObject({event:z.literal('discover-view'),session:z.string().uuid()}),
 z.strictObject({event:z.literal('battle-view'),session:z.string().uuid()}),
 z.strictObject({event:z.literal('my-nest-view'),session:z.string().uuid()}),
 z.strictObject({event:z.literal('support-view'),session:z.string().uuid()})
]);

const columnFor:Record<string,string>={
 'visit':'visits','season-view':'season_views','card-view':'card_views','pack-preview':'pack_previews',
 'theme-select':'theme_selects','discover-view':'discover_views','battle-view':'battle_views',
 'my-nest-view':'my_nest_views','support-view':'support_views'
};

function hashSession(id:string){return createHash('sha256').update(id).digest('hex').slice(0,32)}
function pct(n:number,d:number){return d?Math.round(n/d*100):0}
function unavailable(e:unknown){return !!(e&&typeof e==='object'&&'code' in e&&(e as any).code==='42P01')}

export const dynamic='force-dynamic';

export async function POST(req:Request){
 try{
  const b=await strictBody(req,eventSchema,1024);
  const sessionHash=hashSession(b.session);
  await rateLimit('analytics:'+sessionHash,120);
  const col=columnFor[b.event];
  if(!col)throw new RequestError('Unknown analytics event');
  const dimension='dimension' in b?b.dimension:'';
  const day=new Date().toISOString().slice(0,10);
  const p=database();
  try{
   await p.query(
    `INSERT INTO analytics_sessions(session_hash,${col}) VALUES($1,1)
     ON CONFLICT(session_hash) DO UPDATE SET ${col}=analytics_sessions.${col}+1,last_seen=now()`,
    [sessionHash]
   );
   await p.query(
    "INSERT INTO analytics_daily(day,event,dimension,count) VALUES($1,$2,$3,1) ON CONFLICT(day,event,dimension) DO UPDATE SET count=analytics_daily.count+1",
    [day,b.event,dimension]
   );
  }catch(e){if(unavailable(e))return json({saved:false,setup:'pending'},202);throw e}
  return json({saved:true});
 }catch(e){return failure(e)}
}

export async function GET(){
 try{
  const owner=await studioOwner();
  if(!owner)throw new RequestError('Founder access required',403);
  const p=database();
  try{
   const [funnel,topCards,topThemes,packMix,daily,affiliate]=await Promise.all([
    p.query(`SELECT
      count(*)::int AS sessions,
      count(*) FILTER (WHERE season_views>0)::int AS season_sessions,
      count(*) FILTER (WHERE card_views>0)::int AS card_sessions,
      count(*) FILTER (WHERE pack_previews>0)::int AS pack_sessions,
      count(*) FILTER (WHERE discover_views>0)::int AS discover_sessions,
      count(*) FILTER (WHERE battle_views>0)::int AS battle_sessions,
      count(*) FILTER (WHERE my_nest_views>0)::int AS nest_sessions,
      count(*) FILTER (WHERE support_views>0)::int AS support_sessions,
      coalesce(sum(card_views),0)::int AS card_views,
      coalesce(sum(pack_previews),0)::int AS pack_previews
      FROM analytics_sessions WHERE last_seen>=now()-interval '30 days'`),
    p.query("SELECT dimension,count::int FROM analytics_daily WHERE event='card-view' AND day>=(current_date-29)::text ORDER BY count DESC LIMIT 8"),
    p.query("SELECT dimension,sum(count)::int AS count FROM analytics_daily WHERE event='theme-select' AND day>=(current_date-29)::text GROUP BY dimension ORDER BY count DESC LIMIT 6"),
    p.query("SELECT dimension,sum(count)::int AS count FROM analytics_daily WHERE event='pack-preview' AND day>=(current_date-29)::text GROUP BY dimension ORDER BY count DESC LIMIT 4"),
    p.query("SELECT day,event,sum(count)::int AS count FROM analytics_daily WHERE day>=(current_date-13)::text GROUP BY day,event ORDER BY day"),
    p.query("SELECT subject AS slug,count(*)::int AS count FROM security_events WHERE kind='affiliate-click' AND created>=now()-interval '30 days' GROUP BY subject ORDER BY count DESC LIMIT 8").catch(()=>({rows:[]}))
   ]);
   const f=funnel.rows[0]||{};
   const sessions=Number(f.sessions||0);
   const insights:string[]=[];
   if(sessions<25)insights.push('Early signal only: collect more beta sessions before changing the art roadmap or pack economics.');
   if(sessions>=10){
    const seasonRate=pct(Number(f.season_sessions||0),sessions);
    const cardRate=pct(Number(f.card_sessions||0),sessions);
    const packRate=pct(Number(f.pack_sessions||0),sessions);
    if(seasonRate<35)insights.push('Season One reach is low relative to visits. Make the Season One path more prominent before adding more content.');
    if(cardRate>=45&&packRate<20)insights.push('Visitors inspect guardians more often than they preview packs. Improve the bridge from card discovery to pack previews.');
    if(packRate>=35)insights.push('Pack previews are attracting meaningful engagement. Preserve the opening experience while continuing to keep paid mechanics gated.');
   }
   const themes=topThemes.rows;
   if(themes.length>=2&&Number(themes[0].count)>=10&&Number(themes[0].count)>=Number(themes[1].count)*1.6){
    insights.push(`${themes[0].dimension} is showing a stronger Theme-interest signal than the next Theme. Treat this as a beta lead, not a final art decision.`);
   }
   if(!insights.length)insights.push('No strong behavioral signal yet. Keep collecting privacy-first beta data before making major roadmap changes.');
   return json({
    enabled:true,windowDays:30,
    funnel:{
     sessions,
     seasonSessions:Number(f.season_sessions||0),
     cardSessions:Number(f.card_sessions||0),
     packSessions:Number(f.pack_sessions||0),
     discoverSessions:Number(f.discover_sessions||0),
     battleSessions:Number(f.battle_sessions||0),
     nestSessions:Number(f.nest_sessions||0),
     supportSessions:Number(f.support_sessions||0),
     cardViews:Number(f.card_views||0),
     packPreviews:Number(f.pack_previews||0)
    },
    rates:{
     season:pct(Number(f.season_sessions||0),sessions),
     card:pct(Number(f.card_sessions||0),sessions),
     pack:pct(Number(f.pack_sessions||0),sessions)
    },
    topCards:topCards.rows,topThemes:themes,packMix:packMix.rows,daily:daily.rows,affiliateClicks:affiliate.rows,insights
   });
  }catch(e){
   if(unavailable(e))return json({enabled:false,setup:'pending',insights:['Nest Mind analytics is coded but the production analytics tables have not been approved yet.']});
   throw e
  }
 }catch(e){return failure(e)}
}
