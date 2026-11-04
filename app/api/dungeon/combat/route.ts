import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {currentUser} from '@/lib/auth/server';
import {database,transaction} from '@/lib/postgres';
import {ensureUser} from '@/lib/commerce';
import {strictBody,failure,json,RequestError,rateLimit} from '@/lib/http';
import {STARTER_BATTLE_IDS} from '@/lib/battle-roster';
import {seasonManifest} from '@/lib/season-manifest';
import {dungeonRotationKey,dungeonEnemyRotations,isRuneFloorUnlocked,runeEnergyForFloor,runeFloor} from '@/lib/rune-dungeon';
import {applyDungeonTurn,createDungeonCombat,DUNGEON_ENGINE_VERSION,type ServerCombatState,type DungeonAction} from '@/lib/dungeon-server-engine';
import {assertVerifiedDungeonVictory} from '@/lib/dungeon-verified-settlement';
import commonMasterArt from '@/data/common-master-art.json';

export const dynamic='force-dynamic';

// A separate, draft-only authoritative API. The old client-reported clear
// endpoint must remain blocked; the server awards a first clear ONLY when
// its own simulated combat reaches a terminal victory.
const command=z.discriminatedUnion('action',[
 z.strictObject({
  action:z.literal('start'),
  floor:z.number().int().min(1).max(30),
  roster:z.array(z.string().min(1).max(80)).length(3)
 }),
 z.strictObject({
  action:z.literal('turn'),
  attempt:z.string().uuid(),
  expectedTurn:z.number().int().min(0).max(199),
  move:z.enum(['strike','ability','power','special','guard','swap']),
  swapIndex:z.number().int().min(0).max(2).optional()
 })
]);

async function approvedEnemyIds(c:import('pg').PoolClient,floor:number){
 const approved=await c.query("SELECT id FROM cards WHERE season_id='season-1' AND release_status IN ('preview','released') AND is_collectible=true AND is_pack_eligible=true AND art_status='live' AND art IS NOT NULL");
 const ready=new Set<string>([...Object.keys(commonMasterArt as Record<string,string>),...approved.rows.map(row=>String(row.id))]);
 const cards=seasonManifest.filter(card=>ready.has(card.id)).map(card=>({id:card.id,theme:card.theme,rarity:card.rarity}));
 const rotationKey=dungeonRotationKey();
 const enemyIds=dungeonEnemyRotations(cards,rotationKey)[String(floor)];
 if(!enemyIds||enemyIds.length!==3)throw new RequestError('Dungeon enemy rotation is not available.',503);
 return {enemyIds,rotationKey,ready};
}

async function assertRoster(c:import('pg').PoolClient,userId:string,roster:string[],ready:ReadonlySet<string>){
 if(new Set(roster).size!==3)throw new RequestError('Choose three distinct guardians.',400);
 const {rows}=await c.query('SELECT DISTINCT card FROM copies WHERE user_id=$1 AND card=ANY($2::text[])',[userId,roster]);
 const free=new Set<string>(STARTER_BATTLE_IDS);
 const owned=new Set<string>(rows.map(row=>String(row.card)));
 for(const id of roster){
  if(!seasonManifest.some(card=>card.id===id)||(!free.has(id)&&(!owned.has(id)||!ready.has(id))))
   throw new RequestError('Choose guardians from your unlocked or owned battle roster.',403);
 }
}

export async function GET(req:Request){
 try{
  const user=await currentUser();
  if(!user)throw new RequestError('Sign in to resume a Dungeon battle.',401);
  const attempt=new URL(req.url).searchParams.get('attempt');
  if(!attempt||!z.string().uuid().safeParse(attempt).success)throw new RequestError('A valid attempt is required.',400);
  const {rows:[row]}=await database().query(
   'SELECT id,floor,combat_state,turn_index,outcome,expires_at,expires_at>now() AS unexpired FROM rune_dungeon_attempts WHERE id=$1 AND user_id=$2',
   [attempt,user.userId]
  );
  if(!row||row.engine_version===null||!row.combat_state)throw new RequestError('Battle not found.',404);
  return json({attemptId:row.id,floor:row.floor,state:row.combat_state,turnIndex:Number(row.turn_index),outcome:row.outcome,unexpired:row.unexpired});
 }catch(error){return failure(error)}
}

export async function POST(req:Request){
 try{
  const user=await currentUser();
  if(!user)throw new RequestError('Sign in to save Dungeon battles.',401);
  const body=await strictBody(req,command);
  await rateLimit('rune-dungeon-combat:'+user.userId,50);

  if(body.action==='start'){
   const floor=runeFloor(body.floor);
   if(!floor)throw new RequestError('Unknown Dungeon floor.',400);
   const attemptId=randomUUID();
   const battle=await transaction(async c=>{
    await ensureUser(c,user.userId);
    await c.query('INSERT INTO rune_dungeon_progress(user_id) VALUES($1) ON CONFLICT(user_id) DO NOTHING',[user.userId]);
    await c.query('SELECT user_id FROM rune_dungeon_progress WHERE user_id=$1 FOR UPDATE',[user.userId]);
    const clears=await c.query('SELECT floor FROM rune_dungeon_clears WHERE user_id=$1',[user.userId]);
    if(!isRuneFloorUnlocked(body.floor,new Set<number>(clears.rows.map(row=>Number(row.floor)))))
     throw new RequestError('Clear earlier floors in this Rune World first.',409);
    const {enemyIds,rotationKey,ready}=await approvedEnemyIds(c,body.floor);
    await assertRoster(c,user.userId,body.roster,ready);
    const state=createDungeonCombat(body.floor,body.roster,enemyIds,floor.hpMultiplier,floor.damageMultiplier);
    await c.query(
     'INSERT INTO rune_dungeon_attempts(id,user_id,floor,engine_version,combat_state,turn_index) VALUES($1,$2,$3,$4,$5::jsonb,0)',
     [attemptId,user.userId,body.floor,DUNGEON_ENGINE_VERSION,JSON.stringify(state)]
    );
    return {state,rotationKey};
   });
   return json({attemptId,floor:body.floor,turnIndex:0,expiresInSeconds:1800,...battle});
  }

  if((body.move==='swap')!==(body.swapIndex!==undefined))
   throw new RequestError('Swap index is required only for a swap move.',400);

  const outcome=await transaction(async c=>{
   await ensureUser(c,user.userId);
   await c.query('INSERT INTO rune_dungeon_progress(user_id) VALUES($1) ON CONFLICT(user_id) DO NOTHING',[user.userId]);
   // Serialize energy updates before locking a battle attempt. Identical
   // or concurrent turn requests then have a single authoritative winner.
   const {rows:[progress]}=await c.query(
    'SELECT highest_cleared,rune_energy FROM rune_dungeon_progress WHERE user_id=$1 FOR UPDATE',[user.userId]
   );
   const {rows:[attempt]}=await c.query(
    'SELECT id,floor,user_id,engine_version,combat_state,turn_index,outcome,completed_at,expires_at,expires_at>now() AS unexpired FROM rune_dungeon_attempts WHERE id=$1 AND user_id=$2 FOR UPDATE',
    [body.attempt,user.userId]
   );
   if(!attempt||!attempt.unexpired||attempt.completed_at||attempt.outcome!=='active')
    throw new RequestError('Battle is missing, expired, or already completed.',409);
   if(attempt.engine_version!==DUNGEON_ENGINE_VERSION||!attempt.combat_state)
    throw new RequestError('This attempt must be restarted with server-verified combat.',409);
   const before=attempt.combat_state as ServerCombatState;
   if(attempt.turn_index!==body.expectedTurn||before.turn!==body.expectedTurn||before.floor!==Number(attempt.floor))
    throw new RequestError('Stale Dungeon turn. Refresh the battle state.',409);
   const after=applyDungeonTurn(before,body.move as DungeonAction,body.swapIndex);
   await c.query(
    'INSERT INTO rune_dungeon_turns(attempt_id,turn_index,actor_id,action,resulting_state) VALUES($1,$2,$3,$4,$5::jsonb)',
    [body.attempt,after.turn,before.player[before.playerActive].id,body.move,JSON.stringify(after)]
   );
   const terminal=after.result!=='active';
   const {rows:[saved]}=await c.query(
    "UPDATE rune_dungeon_attempts SET combat_state=$2::jsonb,turn_index=$3,outcome=CASE WHEN $4 THEN $5 ELSE outcome END,completed_at=CASE WHEN $4 THEN now() ELSE completed_at END,combat_verified_at=CASE WHEN $4 THEN now() ELSE combat_verified_at END WHERE id=$1 RETURNING completed_at,combat_verified_at,expires_at",
    [body.attempt,JSON.stringify(after),after.turn,terminal,after.result]
   );
   let reward=0,alreadyCleared=false;
   if(after.result==='won'){
    assertVerifiedDungeonVictory({
     userId:user.userId,floor:Number(attempt.floor),outcome:'won',
     completedAt:saved.completed_at,expiresAt:saved.expires_at,
     engineVersion:attempt.engine_version,combatState:after,
     combatVerifiedAt:saved.combat_verified_at,turnIndex:after.turn
    },user.userId,Number(attempt.floor));
    const first=runeEnergyForFloor(Number(attempt.floor));
    const credited=await c.query(
     'INSERT INTO rune_dungeon_clears(user_id,floor,energy_awarded) VALUES($1,$2,$3) ON CONFLICT (user_id,floor) DO NOTHING RETURNING energy_awarded',
     [user.userId,attempt.floor,first]
    );
    if(credited.rowCount){
     reward=first;
     await c.query('UPDATE rune_dungeon_progress SET highest_cleared=GREATEST(highest_cleared,$2),rune_energy=rune_energy+$3,updated_at=now() WHERE user_id=$1',[user.userId,attempt.floor,reward]);
    }else alreadyCleared=true;
   }
   return {attemptId:body.attempt,state:after,turnIndex:after.turn,result:after.result,reward,alreadyCleared,runeEnergy:Number(progress.rune_energy)+reward};
  });
  return json(outcome);
 }catch(error){return failure(error)}
}
