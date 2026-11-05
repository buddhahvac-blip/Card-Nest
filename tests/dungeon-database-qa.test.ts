import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {Pool} from 'pg';
import {createDungeonCombat,applyDungeonTurn,DUNGEON_ENGINE_VERSION} from '../lib/dungeon-server-engine';
import {assertVerifiedDungeonVictory} from '../lib/dungeon-verified-settlement';
import {runeEnergyForFloor} from '../lib/rune-dungeon';

const enabled=process.env.RUN_DUNGEON_DATABASE_QA==='true';
test('isolated QA database: verified victory, one-time credit, owner check, expiry and rollback',
 {skip:enabled?undefined:'Requires explicit isolated QA-only Vercel environment'},
 async()=>{
  const raw=process.env.DATABASE_URL;
  assert.ok(raw,'Missing QA DATABASE_URL');
  assert.equal(process.env.VERCEL_ENV,'preview','Refusing database writes outside Vercel Preview');
  assert.equal(process.env.VERCEL_GIT_COMMIT_REF,'test/rune-dungeon-progression-security','Refusing an unapproved Git branch');
  const url=new URL(raw);
  assert.equal(url.hostname,process.env.DUNGEON_QA_DB_HOST,'Refusing to connect to a different Neon database');
  assert.ok(url.hostname.endsWith('.neon.tech'));
  url.searchParams.set('sslmode','verify-full');

  const pool=new Pool({connectionString:url.toString(),max:1,connectionTimeoutMillis:10000});
  let client;
  try{
   client=await pool.connect();
   await client.query('BEGIN');
   await client.query('SET LOCAL search_path TO cardnest_v1, public');
   const user='qa-e2e-'+randomUUID(),attempt=randomUUID();
   const firstClearEnergy=runeEnergyForFloor(1);
   assert.equal(firstClearEnergy,10);

   let state=createDungeonCombat(
    1,['sproutling-001','tidefin-003','shadowclaw-007'],
    ['emberwing-002','bloomtail-004','mindfeather-006'],.2,.2
   );
   for(let i=0;i<100&&state.result==='active';i++)state=applyDungeonTurn(state,'strike');
   assert.equal(state.result,'won','Server engine must generate a real terminal victory');
   assert.equal(state.engineVersion,DUNGEON_ENGINE_VERSION);

   await client.query('INSERT INTO users(id) VALUES($1)',[user]);
   await client.query('INSERT INTO rune_dungeon_progress(user_id) VALUES($1)',[user]);
   await client.query(
    "INSERT INTO rune_dungeon_attempts(id,user_id,floor,engine_version,combat_state,turn_index,outcome,completed_at,combat_verified_at,expires_at) VALUES($1,$2,1,$3,$4::jsonb,$5,'won',now(),now(),now()+interval '30 minutes')",
    [attempt,user,DUNGEON_ENGINE_VERSION,JSON.stringify(state),state.turn]
   );
   await client.query(
    'INSERT INTO rune_dungeon_turns(attempt_id,turn_index,actor_id,action,resulting_state) VALUES($1,$2,$3,$4,$5::jsonb)',
    [attempt,state.turn,state.player[0].id,'strike',JSON.stringify(state)]
   );
   const stored=await client.query(
    'SELECT user_id AS "userId",floor,outcome,completed_at AS "completedAt",expires_at AS "expiresAt",engine_version AS "engineVersion",combat_state AS "combatState",combat_verified_at AS "combatVerifiedAt",turn_index AS "turnIndex" FROM rune_dungeon_attempts WHERE id=$1',
    [attempt]
   );
   const verified=stored.rows[0];
   assert.ok(verified);
   assertVerifiedDungeonVictory(verified,user,1,verified.completedAt);
   assert.throws(()=>assertVerifiedDungeonVictory(verified,'another-user',1,verified.completedAt));

   const first=await client.query(
    'INSERT INTO rune_dungeon_clears(user_id,floor,energy_awarded) VALUES($1,1,$2) ON CONFLICT (user_id,floor) DO NOTHING RETURNING energy_awarded',
    [user,firstClearEnergy]
   );
   assert.equal(first.rowCount,1);
   if(first.rowCount)await client.query(
    'UPDATE rune_dungeon_progress SET rune_energy=rune_energy+$2,highest_cleared=1 WHERE user_id=$1',
    [user,firstClearEnergy]
   );
   const replay=await client.query(
    'INSERT INTO rune_dungeon_clears(user_id,floor,energy_awarded) VALUES($1,1,$2) ON CONFLICT (user_id,floor) DO NOTHING RETURNING energy_awarded',
    [user,firstClearEnergy]
   );
   assert.equal(replay.rowCount,0,'Replay must not create another award');
   const balance=await client.query('SELECT rune_energy,highest_cleared FROM rune_dungeon_progress WHERE user_id=$1',[user]);
   assert.equal(Number(balance.rows[0].rune_energy),firstClearEnergy);
   assert.equal(Number(balance.rows[0].highest_cleared),1);

   const foreign=await client.query('SELECT id FROM rune_dungeon_attempts WHERE id=$1 AND user_id=$2',[attempt,'some-other-user']);
   assert.equal(foreign.rowCount,0,'Cross-account attempts must be invisible');
   await client.query("UPDATE rune_dungeon_attempts SET expires_at=now()-interval '1 minute' WHERE id=$1",[attempt]);
   const expired=await client.query('SELECT expires_at>now() AS unexpired FROM rune_dungeon_attempts WHERE id=$1',[attempt]);
   assert.equal(expired.rows[0].unexpired,false);
  }finally{
   if(client){
    await client.query('ROLLBACK').catch(()=>{});
    client.release();
   }
   await pool.end();
  }
 });
