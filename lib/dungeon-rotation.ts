import {seasonManifest,hasSeasonArtwork} from './season-manifest';
import {RUNE_DUNGEON_FLOORS,RUNE_DUNGEON_WORLDS} from './rune-dungeon';

/**
 * Stateless daily dungeon patch. America/New_York keeps the refresh at 3 AM
 * Eastern wall-clock time through daylight-saving changes. No cron or mutable
 * process memory is required: every server instance computes the same lineup.
 */
export function dungeonRotationDay(now=new Date()):string {
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(now);
 const read=(type:string)=>Number(parts.find(p=>p.type===type)?.value);
 const year=read('year'),month=read('month'),day=read('day'),hour=read('hour');
 const date=new Date(Date.UTC(year,month-1,day));
 if(hour<3)date.setUTCDate(date.getUTCDate()-1);
 return date.toISOString().slice(0,10);
}

function lineupForFloor(floor:number,day:string):string[]{
 const def=RUNE_DUNGEON_FLOORS.find(f=>f.floor===floor);
 if(!def)return [];
 const world=RUNE_DUNGEON_WORLDS.find(w=>w.id===def.world)!;
 const boss=!!(def.boss||def.worldBoss);
 // Bosses feature only Rare/Epic/Legendary; other floors use all rarities.
 const allowed=seasonManifest.filter(c=>hasSeasonArtwork(c)&&(!boss||['rare','epic','legendary'].includes(c.rarity.toLowerCase())));
 const themed=allowed.filter(c=>world.themes.includes(c.theme||c.clan));
 // Keep three real eligible cards, widening across Themes if needed.
 const pool=themed.length>=6?themed:allowed;
 const candidates=[...new Map(pool.map(c=>[c.id,c])).values()].sort((a,b)=>a.cardNumber-b.cardNumber);
 if(candidates.length<3)return def.enemyIds; // Keep a playable fallback until more approved artwork exists.
 const dayNumber=Math.floor(Date.parse(day+'T00:00:00Z')/86400000);
 // Consecutive 3-card blocks never overlap when the pool has >= 6 items.
 const start=((dayNumber*3+floor*3)%candidates.length+candidates.length)%candidates.length;
 return Array.from({length:3},(_,i)=>candidates[(start+i)%candidates.length].id);
}

export function dungeonEnemyRotation(now=new Date()){
 const day=dungeonRotationDay(now);
 return {rotationDay:day,refreshHourET:3,enemyIdsByFloor:Object.fromEntries(RUNE_DUNGEON_FLOORS.map(f=>[f.floor,lineupForFloor(f.floor,day)])) as Record<number,string[]>};
}
