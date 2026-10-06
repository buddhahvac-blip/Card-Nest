import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {currentUser} from '@/lib/auth/server';
import {database,transaction} from '@/lib/postgres';
import {strictBody,failure,json,RequestError,rateLimit} from '@/lib/http';
import {ensureUser,grantDungeonReward} from '@/lib/commerce';
import {RUNE_DUNGEON_FLOORS,RUNE_PACK_COSTS,runeEnergyForFloor,runePackCost} from '@/lib/rune-dungeon';

export const dynamic='force-dynamic';

const command=z.discriminatedUnion('action',[
 z.strictObject({action:z.literal('start'),floor:z.number().int().min(1).max(10)}),
 z.strictObject({action:z.literal('clear'),floor:z.number().int().min(1).max(10),attempt:z.string().uuid().optional()}),
 z.strictObject({action:z.literal('claim'),pack:z.enum(['hatchling','nest','guardian','royal'])})
]);

async function readProgress(userId:string){
 const p=database();
 const [progress,clears,claims]=await Promise.all([
  p.query('SELECT highest_cleared,rune_energy,updated_at FROM rune_dungeon_progress WHERE user_id=$1',[userId]),
  p.query('SELECT floor,energy_awarded,cleared_at FROM rune_dungeon_clears WHERE user_id=$1 ORDER BY floor',[userId]),
  p.query('SELECT id,pack_id,energy_cost,entitlement_id,created_at FROM rune_dungeon_claims WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50',[userId])
 ]);
 const row=progress.rows[0]||{highest_cleared:0,rune_energy:0};
 return {
  signedIn:true,
  highestCleared:Number(row.highest_cleared||0),
  unlockedFloor:Math.min(10,Number(row.highest_cleared||0)+1),
  runeEnergy:Number(row.rune_energy||0),
  clears:clears.rows,
  claims:claims.rows,
  packCosts:RUNE_PACK_COSTS,
  floors:RUNE_DUNGEON_FLOORS.map(({floor,name,mission,energy,boss})=>({floor,name,mission,energy,boss:!!boss}))
 };
}

export async function GET(){
 try{
  const user=await currentUser();
  if(!user)return json({signedIn:false,highestCleared:0,unlockedFloor:1,runeEnergy:0,clears:[],claims:[],packCosts:RUNE_PACK_COSTS,floors:RUNE_DUNGEON_FLOORS.map(({floor,name,mission,energy,boss})=>({floor,name,mission,energy,boss:!!boss}))});
  return json(await readProgress(user.userId));
 }catch(error){return failure(error)}
}

export async function POST(req:Request){
 try{
  const user=await currentUser();
  if(!user)throw new RequestError('Sign in to save Rune Dungeon progress and claim rewards.',401);
  const body=await strictBody(req,command);
  await rateLimit('rune-dungeon:'+user.userId);

  if(body.action==='start'){
   const floor=RUNE_DUNGEON_FLOORS.find(entry=>entry.floor===body.floor);
   if(!floor)throw new RequestError('Unknown Rune Dungeon floor',400);
   const attemptId=randomUUID();
   await transaction(async c=>{
    await ensureUser(c,user.userId);
    await c.query('INSERT INTO rune_dungeon_progress(user_id) VALUES($1) ON CONFLICT(user_id) DO NOTHING',[user.userId]);
    const {rows:[progress]}=await c.query('SELECT highest_cleared FROM rune_dungeon_progress WHERE user_id=$1 FOR UPDATE',[user.userId]);
    const highest=Number(progress.highest_cleared||0);
    if(body.floor>highest+1)throw new RequestError('Clear the previous Rune Dungeon floor first.',409);
    await c.query('INSERT INTO rune_dungeon_attempts(id,user_id,floor) VALUES($1,$2,$3)',[attemptId,user.userId,body.floor]);
   });
   return json({attemptId,floor:body.floor,expiresInSeconds:1800});
  }

  if(body.action==='clear'){
   const reward=runeEnergyForFloor(body.floor);
   if(!reward)throw new RequestError('Unknown Rune Dungeon floor',400);
   const result=await transaction(async c=>{
    await ensureUser(c,user.userId);
    await c.query('INSERT INTO rune_dungeon_progress(user_id) VALUES($1) ON CONFLICT(user_id) DO NOTHING',[user.userId]);
    const {rows:[progress]}=await c.query('SELECT highest_cleared,rune_energy FROM rune_dungeon_progress WHERE user_id=$1 FOR UPDATE',[user.userId]);
    const existing=await c.query('SELECT energy_awarded FROM rune_dungeon_clears WHERE user_id=$1 AND floor=$2',[user.userId,body.floor]);
    if(existing.rows[0])return {alreadyCleared:true,reward:0,highestCleared:Number(progress.highest_cleared),runeEnergy:Number(progress.rune_energy)};
    if(body.floor!==Number(progress.highest_cleared)+1)throw new RequestError('Clear the previous Rune Dungeon floor first.',409);
    if(!body.attempt)throw new RequestError('Start this Rune Dungeon floor before saving a first clear.',409);
    const attempt=await c.query("SELECT id FROM rune_dungeon_attempts WHERE id=$1 AND user_id=$2 AND floor=$3 AND completed_at IS NULL AND expires_at>now() AND started_at<=now()-interval '15 seconds' FOR UPDATE",[body.attempt,user.userId,body.floor]);
    if(!attempt.rows[0])throw new RequestError('This Dungeon attempt is invalid, expired, or completed too quickly. Start the floor again.',409);
    await c.query('UPDATE rune_dungeon_attempts SET completed_at=now() WHERE id=$1',[body.attempt]);
    await c.query('INSERT INTO rune_dungeon_clears(user_id,floor,energy_awarded) VALUES($1,$2,$3)',[user.userId,body.floor,reward]);
    const {rows:[updated]}=await c.query('UPDATE rune_dungeon_progress SET highest_cleared=$2,rune_energy=rune_energy+$3,updated_at=now() WHERE user_id=$1 RETURNING highest_cleared,rune_energy',[user.userId,body.floor,reward]);
    return {alreadyCleared:false,reward,highestCleared:Number(updated.highest_cleared),runeEnergy:Number(updated.rune_energy)};
   });
   return json({...result,unlockedFloor:Math.min(10,result.highestCleared+1),bossCleared:result.highestCleared===10});
  }

  const cost=runePackCost(body.pack);
  if(!cost)throw new RequestError('Unknown reward pack',400);
  const claim=await transaction(async c=>{
   await ensureUser(c,user.userId);
   await c.query('INSERT INTO rune_dungeon_progress(user_id) VALUES($1) ON CONFLICT(user_id) DO NOTHING',[user.userId]);
   const {rows:[progress]}=await c.query('SELECT rune_energy,highest_cleared FROM rune_dungeon_progress WHERE user_id=$1 FOR UPDATE',[user.userId]);
   if(Number(progress.rune_energy)<cost)throw new RequestError('Not enough Rune Energy for this pack.',409);
   const claimId=randomUUID();
   const entitlementId=await grantDungeonReward(user.userId,body.pack,claimId,async fn=>fn(c));
   await c.query('UPDATE rune_dungeon_progress SET rune_energy=rune_energy-$2,updated_at=now() WHERE user_id=$1',[user.userId,cost]);
   await c.query('INSERT INTO rune_dungeon_claims(id,user_id,pack_id,energy_cost,entitlement_id) VALUES($1,$2,$3,$4,$5)',[claimId,user.userId,body.pack,cost,entitlementId]);
   return {claimId,entitlementId,pack:body.pack,cost,runeEnergy:Number(progress.rune_energy)-cost,highestCleared:Number(progress.highest_cleared)};
  });
  return json({...claim,message:'Reward pack added to My Nest.'});
 }catch(error){return failure(error)}
}
