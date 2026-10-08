import {database} from '@/lib/postgres';
import {runeEnergyForFloor} from '@/lib/rune-dungeon';

export type IntegrityIssue={code:string;userId?:string;detail:string};

export async function auditGameIntegrity(){
 const db=database();
 const issues:IntegrityIssue[]=[];
 const [progress,clears,claims,attempts]=await Promise.all([
  db.query('SELECT user_id,highest_cleared,rune_energy FROM rune_dungeon_progress'),
  db.query('SELECT user_id,floor,energy_awarded FROM rune_dungeon_clears'),
  db.query('SELECT user_id,energy_cost FROM rune_dungeon_claims'),
  db.query("SELECT user_id,floor,outcome,energy_delta FROM rune_dungeon_attempts WHERE completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 5000")
 ]);
 const clearTotals=new Map<string,number>();
 for(const row of clears.rows){
  const floor=Number(row.floor);
  const awarded=Number(row.energy_awarded);
  const expected=runeEnergyForFloor(floor);
  if(floor<1||floor>30)issues.push({code:'invalid-clear-floor',userId:row.user_id,detail:'floor='+floor});
  if(expected!==awarded)issues.push({code:'clear-reward-mismatch',userId:row.user_id,detail:'floor='+floor+' expected='+expected+' actual='+awarded});
  clearTotals.set(row.user_id,(clearTotals.get(row.user_id)||0)+awarded);
 }
 const claimTotals=new Map<string,number>();
 for(const row of claims.rows)claimTotals.set(row.user_id,(claimTotals.get(row.user_id)||0)+Number(row.energy_cost));
 for(const row of progress.rows){
  const highest=Number(row.highest_cleared);
  const actual=Number(row.rune_energy);
  const expected=(clearTotals.get(row.user_id)||0)-(claimTotals.get(row.user_id)||0);
  if(highest<0||highest>30)issues.push({code:'invalid-highest-cleared',userId:row.user_id,detail:'highest='+highest});
  if(actual<0)issues.push({code:'negative-rune-energy',userId:row.user_id,detail:'energy='+actual});
  if(actual!==expected)issues.push({code:'rune-ledger-mismatch',userId:row.user_id,detail:'expected='+expected+' actual='+actual});
 }
 for(const row of attempts.rows){
  const floor=Number(row.floor),delta=Number(row.energy_delta),expected=runeEnergyForFloor(floor);
  if(row.outcome==='lost'&&delta!==0)issues.push({code:'loss-awarded-energy',userId:row.user_id,detail:'floor='+floor+' delta='+delta});
  if(row.outcome==='won'&&delta!==expected)issues.push({code:'win-reward-mismatch',userId:row.user_id,detail:'floor='+floor+' expected='+expected+' actual='+delta});
 }
 return {ok:issues.length===0,checkedAt:new Date().toISOString(),issues};
}
