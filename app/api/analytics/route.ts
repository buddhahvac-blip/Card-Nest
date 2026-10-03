import {createHash} from 'node:crypto';
import {eventSchema,columnFor,recordBetaEvent} from '@/lib/beta-events';
import {seasonManifest} from '@/lib/season-manifest';
import {database} from '@/lib/postgres';
import {strictBody,failure,json,rateLimit,RequestError} from '@/lib/http';
import {studioOwner} from '@/lib/studio-auth';

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
  const dimension='dimension' in b?String(b.dimension):'';
  const p=database();
  try{
   const client=await p.connect();
   try{
    await client.query('BEGIN');
    await recordBetaEvent((sql,params)=>client.query(sql,params),sessionHash,b.event,dimension);
    await client.query('COMMIT');
   }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
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
   const [funnel,topCards,topThemes,packMix,topFavorites,daily,affiliate,feedbackPriorities,feedbackIntent,topWishlist,topShares,cardSignals,returnReasons]=await Promise.all([
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
      count(*) FILTER (WHERE showcase_views>0)::int AS showcase_sessions,
      count(*) FILTER (WHERE living_views>0)::int AS living_sessions,
      count(*) FILTER (WHERE album_views>0)::int AS album_sessions,
      count(*) FILTER (WHERE battle_after_save)::int AS battle_after_save_sessions,
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
    p.query("SELECT would_collect AS dimension,count(*)::int AS count FROM beta_feedback WHERE created>=now()-interval '30 days' GROUP BY would_collect ORDER BY count DESC"),
    p.query("SELECT dimension,sum(count)::int AS count FROM analytics_daily WHERE event='wishlist-add' AND day>=(current_date-29)::text GROUP BY dimension ORDER BY count DESC LIMIT 8"),
    p.query("SELECT dimension,sum(count)::int AS count FROM analytics_daily WHERE event='share-card' AND day>=(current_date-29)::text GROUP BY dimension ORDER BY count DESC LIMIT 8"),
    p.query("SELECT dimension,event,sum(count)::int AS count FROM analytics_daily WHERE event IN ('card-view','favorite','wishlist-add','share-card') AND day>=(current_date-29)::text GROUP BY dimension,event"),
    p.query("SELECT return_reason FROM beta_feedback WHERE created>=now()-interval '30 days' ORDER BY created DESC LIMIT 20")
   ]);
   const rarityInterest:Record<string,Record<string,number>>={};
   const themeEngagement:Record<string,Record<string,number>>={};
   for(const row of cardSignals.rows){const card=seasonManifest.find(c=>c.id===row.dimension);if(!card)continue;
    for(const [group,key] of [[rarityInterest,card.rarity],[themeEngagement,card.theme]] as const){
     group[key]??={};group[key][row.event]=(group[key][row.event]||0)+Number(row.count);
    }
   }
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
     showcaseSessions:Number(f.showcase_sessions||0),livingSessions:Number(f.living_sessions||0),albumSessions:Number(f.album_sessions||0),battleAfterSaveSessions:Number(f.battle_after_save_sessions||0),
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
    topWishlist:topWishlist.rows,topShares:topShares.rows,rarityInterest,themeEngagement,
    measurementNote:"Session reach is not an ordered funnel or unique-person count. Battle after save uses server receipt order within one session. Shares are share-button actions, not verified recipients. Raw action counts are exposure-biased.",
    affiliateClicks:affiliate.rows,
    feedback:{returnReasons:returnReasons.rows.map(r=>r.return_reason),priorities:feedbackPriorities.rows,intent:feedbackIntent.rows,responses:feedbackIntent.rows.reduce((sum:any,row:any)=>sum+Number(row.count||0),0)},
    insights
   });
  }catch(e){
   if(unavailable(e))return json({enabled:false,setup:'pending',insights:['Nest Mind collector-loop analytics are coded but the production schema is still pending.']});
   throw e
  }
 }catch(e){return failure(e)}
}
