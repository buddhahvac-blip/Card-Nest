import {createHash} from 'node:crypto';
import {z} from 'zod';
import {database} from '@/lib/postgres';
import {strictBody,failure,json,rateLimit,RequestError} from '@/lib/http';
import {studioOwner} from '@/lib/studio-auth';

const cardDimension=z.string().regex(/^[a-z0-9-]{2,80}$/);
const eventSchema=z.discriminatedUnion('event',[
 z.strictObject({event:z.literal('visit'),session:z.string().uuid()}),
 z.strictObject({event:z.literal('season-view'),session:z.string().uuid()}),
 z.strictObject({event:z.literal('card-view'),session:z.string().uuid(),dimension:cardDimension}),
 z.strictObject({event:z.literal('pack-preview'),session:z.string().uuid(),dimension:z.enum(['hatchling','nest','guardian','royal'])}),
 z.strictObject({event:z.literal('theme-select'),session:z.string().uuid(),dimension:z.enum(['Ember','Tide','Bloom','Volt','Mystic','Shadow'])}),
 z.strictObject({event:z.literal('discover-view'),session:z.string().uuid()}),
 z.strictObject({event:z.literal('battle-view'),session:z.string().uuid()}),
 z.strictObject({event:z.literal('my-nest-view'),session:z.string().uuid()}),
 z.strictObject({event:z.literal('support-view'),session:z.string().uuid()}),
 z.strictObject({event:z.literal('favorite'),session:z.string().uuid(),dimension:cardDimension}),
 z.strictObject({event:z.literal('wishlist-add'),session:z.string().uuid(),dimension:cardDimension}),
 z.strictObject({event:z.literal('share-card'),session:z.string().uuid(),dimension:cardDimension}),
 z.strictObject({event:z.literal('feedback-submit'),session:z.string().uuid()})
]);

const columnFor:Record<string,string>={
 'visit':'visits','season-view':'season_views','card-view':'card_views','pack-preview':'pack_previews',
 'theme-select':'theme_selects','discover-view':'discover_views','battle-view':'battle_views',
 'my-nest-view':'my_nest_views','support-view':'support_views','favorite':'favorite_actions',
 'wishlist-add':'wishlist_actions','share-card':'share_actions','feedback-submit':'feedback_submits'
};

function hashSession(id:string){return createHash('sha256').update(id).digest('hex').slice(0,32)}
function pct(n:number,d:number){return d?Math.round(n/d*100):0}
function unavailable(e:unknown){
 return !!(e&&typeof e==='object'&&'code' in e&&['42P01','42703'].includes(String((e as any).code)));
}

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
   const [funnel,topCards,topThemes,packMix,topFavorites,daily,affiliate,feedbackPriorities,feedbackIntent]=await Promise.all([
    p.query(`SELECT
      count(*)::int AS sessions,
      count(*) FILTER (WHERE season_views>0)::int AS season_sessions,
      count(*) FILTER (WHERE card_views>0)::int AS card_sessions,
      count(*) FILTER (WHERE pack_previews>0)::int AS pack_sessions,
      count(*) FILTER (WHERE discover_views>0)::int AS discover_sessions,
      count(*) FILTER (WHERE battle_views>0)::int AS battle_sessions,
      count(*) FILTER (WHERE my_nest_views>0)::int AS nest_sessions,
      count(*) FILTER (WHERE support_views>0)::int AS support_sessions,
      count(*) FILTER (WHERE favorite_actions>0)::int AS favorite_sessions,
      count(*) FILTER (WHERE wishlist_actions>0)::int AS wishlist_sessions,
      count(*) FILTER (WHERE share_actions>0)::int AS share_sessions,
      count(*) FILTER (WHERE feedback_submits>0)::int AS feedback_sessions,
      coalesce(sum(card_views),0)::int AS card_views,
      coalesce(sum(pack_previews),0)::int AS pack_previews,
      coalesce(sum(favorite_actions),0)::int AS favorite_actions,
      coalesce(sum(wishlist_actions),0)::int AS wishlist_actions,
      coalesce(sum(share_actions),0)::int AS share_actions
      FROM analytics_sessions WHERE last_seen>=now()-interval '30 days'`),
    p.query("SELECT dimension,sum(count)::int AS count FROM analytics_daily WHERE event='card-view' AND day>=(current_date-29)::text GROUP BY dimension ORDER BY count DESC LIMIT 8"),
    p.query("SELECT dimension,sum(count)::int AS count FROM analytics_daily WHERE event='theme-select' AND day>=(current_date-29)::text GROUP BY dimension ORDER BY count DESC LIMIT 6"),
    p.query("SELECT dimension,sum(count)::int AS count FROM analytics_daily WHERE event='pack-preview' AND day>=(current_date-29)::text GROUP BY dimension ORDER BY count DESC LIMIT 4"),
    p.query("SELECT dimension,sum(count)::int AS count FROM analytics_daily WHERE event='favorite' AND day>=(current_date-29)::text GROUP BY dimension ORDER BY count DESC LIMIT 8"),
    p.query("SELECT day,event,sum(count)::int AS count FROM analytics_daily WHERE day>=(current_date-13)::text GROUP BY day,event ORDER BY day"),
    p.query("SELECT subject AS slug,count(*)::int AS count FROM security_events WHERE kind='affiliate-click' AND created>=now()-interval '30 days' GROUP BY subject ORDER BY count DESC LIMIT 8").catch(()=>({rows:[]})),
    p.query("SELECT next_priority AS dimension,count(*)::int AS count FROM beta_feedback WHERE created>=now()-interval '30 days' GROUP BY next_priority ORDER BY count DESC"),
    p.query("SELECT would_collect AS dimension,count(*)::int AS count FROM beta_feedback WHERE created>=now()-interval '30 days' GROUP BY would_collect ORDER BY count DESC")
   ]);
   const f=funnel.rows[0]||{};
   const sessions=Number(f.sessions||0);
   const favoriteRate=pct(Number(f.favorite_sessions||0),sessions);
   const insights:string[]=[];
   if(sessions<25)insights.push('Early signal only: collect more beta sessions before changing the art roadmap or pack economics.');
   if(sessions>=10){
    const seasonRate=pct(Number(f.season_sessions||0),sessions);
    const cardRate=pct(Number(f.card_sessions||0),sessions);
    const packRate=pct(Number(f.pack_sessions||0),sessions);
    if(seasonRate<35)insights.push('Season One reach is low relative to visits. Make the Season One path more prominent before adding more content.');
    if(cardRate>=45&&packRate<20)insights.push('Visitors inspect guardians more often than they preview packs. Improve the bridge from card discovery to pack previews.');
    if(cardRate>=35&&favoriteRate<15)insights.push('Guardian interest is not yet converting into saved intent. Improve Favorite and Wishlist visibility before expanding the roster.');
    if(favoriteRate>=25)insights.push('Favorites are forming at a meaningful rate. Use the most-favorited guardians to guide the next reviewed art batch.');
    if(packRate>=35)insights.push('Pack previews are attracting meaningful engagement. Preserve the opening experience while continuing to keep paid mechanics gated.');
   }
   const themes=topThemes.rows;
   if(themes.length>=2&&Number(themes[0].count)>=10&&Number(themes[0].count)>=Number(themes[1].count)*1.6){
    insights.push(`${themes[0].dimension} is showing a stronger Theme-interest signal than the next Theme. Treat this as a beta lead, not a final art decision.`);
   }
   const priorities=feedbackPriorities.rows;
   if(priorities.length&&Number(priorities[0].count)>=3)insights.push(`Beta feedback currently leans toward ${priorities[0].dimension}. Review the written return reasons before changing the roadmap.`);
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
     favoriteSessions:Number(f.favorite_sessions||0),
     wishlistSessions:Number(f.wishlist_sessions||0),
     shareSessions:Number(f.share_sessions||0),
     feedbackSessions:Number(f.feedback_sessions||0),
     cardViews:Number(f.card_views||0),
     packPreviews:Number(f.pack_previews||0),
     favoriteActions:Number(f.favorite_actions||0),
     wishlistActions:Number(f.wishlist_actions||0),
     shareActions:Number(f.share_actions||0)
    },
    rates:{
     season:pct(Number(f.season_sessions||0),sessions),
     card:pct(Number(f.card_sessions||0),sessions),
     pack:pct(Number(f.pack_sessions||0),sessions),
     favorite:favoriteRate,
     wishlist:pct(Number(f.wishlist_sessions||0),sessions),
     share:pct(Number(f.share_sessions||0),sessions),
     feedback:pct(Number(f.feedback_sessions||0),sessions)
    },
    topCards:topCards.rows,topThemes:themes,packMix:packMix.rows,topFavorites:topFavorites.rows,daily:daily.rows,
    affiliateClicks:affiliate.rows,
    feedback:{priorities:feedbackPriorities.rows,intent:feedbackIntent.rows,responses:feedbackIntent.rows.reduce((sum:any,row:any)=>sum+Number(row.count||0),0)},
    insights
   });
  }catch(e){
   if(unavailable(e))return json({enabled:false,setup:'pending',insights:['Nest Mind collector-loop analytics are coded but the production schema is still pending.']});
   throw e
  }
 }catch(e){return failure(e)}
}
