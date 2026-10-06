import {z} from 'zod';
import {seasonManifest} from './season-manifest';
import {collectionAlbums} from './collection-albums';
import {showcaseArt} from './showcase';
const ids=new Set(seasonManifest.map(c=>c.id));
const cardDimension=z.string().refine(id=>ids.has(id),'Unknown guardian');
const session=z.string().uuid();
export const eventSchema=z.discriminatedUnion('event',[
 z.strictObject({event:z.literal('visit'),session,dimension:z.string().max(64).regex(/^[a-z0-9_-]*$/i).optional()}),
 z.strictObject({event:z.literal('season-view'),session}),
 z.strictObject({event:z.literal('discover-view'),session}),
 z.strictObject({event:z.literal('battle-view'),session}),
 z.strictObject({event:z.literal('my-nest-view'),session}),
 z.strictObject({event:z.literal('support-view'),session}),
 z.strictObject({event:z.literal('feedback-submit'),session}),
 z.strictObject({event:z.literal('showcase-view'),session}),
 z.strictObject({event:z.literal('card-view'),session,dimension:cardDimension}),
 z.strictObject({event:z.literal('favorite'),session,dimension:cardDimension}),
 z.strictObject({event:z.literal('wishlist-add'),session,dimension:cardDimension}),
 z.strictObject({event:z.literal('share-card'),session,dimension:cardDimension}),
 z.strictObject({event:z.literal('pack-preview'),session,dimension:z.enum(['hatchling','nest','guardian','royal'])}),
 z.strictObject({event:z.literal('theme-select'),session,dimension:z.enum(['Ember','Tide','Bloom','Volt','Mystic','Shadow'])}),
 z.strictObject({event:z.literal('living-view'),session,dimension:z.string().refine(id=>showcaseArt.some(x=>x.cardId===id),'Unknown showcase guardian')}),
 z.strictObject({event:z.literal('album-view'),session,dimension:z.string().refine(id=>collectionAlbums.some(x=>x.id===id),'Unknown album')})
]);
export const columnFor:Record<string,string>={
 visit:'visits','season-view':'season_views','card-view':'card_views','pack-preview':'pack_previews',
 'theme-select':'theme_selects','discover-view':'discover_views','battle-view':'battle_views','my-nest-view':'my_nest_views',
 'support-view':'support_views',favorite:'favorite_actions','wishlist-add':'wishlist_actions','share-card':'share_actions',
 'feedback-submit':'feedback_submits','showcase-view':'showcase_views','living-view':'living_views','album-view':'album_views'
};
// Call within a transaction. Order is server receipt order, not an identified user journey.
export async function recordBetaEvent(query:(sql:string,params:unknown[])=>Promise<unknown>,hash:string,event:string,dimension:string){
 const col=columnFor[event];if(!col)throw Error('Unknown event');
 const save=event==='favorite'||event==='wishlist-add';
 await query(`INSERT INTO analytics_sessions(session_hash,${col},first_saved_at) VALUES($1,1,CASE WHEN $2 THEN now() ELSE NULL END)
 ON CONFLICT(session_hash) DO UPDATE SET ${col}=analytics_sessions.${col}+1,last_seen=now(),
 first_saved_at=CASE WHEN $2 THEN coalesce(analytics_sessions.first_saved_at,now()) ELSE analytics_sessions.first_saved_at END,
 battle_after_save=analytics_sessions.battle_after_save OR ($3 AND analytics_sessions.first_saved_at IS NOT NULL)`,[hash,save,event==='battle-view']);
 await query('INSERT INTO analytics_daily(day,event,dimension,count) VALUES($1,$2,$3,1) ON CONFLICT(day,event,dimension) DO UPDATE SET count=analytics_daily.count+1',[new Date().toISOString().slice(0,10),event,dimension]);
}
