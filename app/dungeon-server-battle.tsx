'use client';

import {useEffect,useState} from 'react';
import {BatteryCharging,Shield,SkipForward,Swords} from 'lucide-react';
import {STARTER_BATTLE_IDS} from '@/lib/battle-roster';
import {seasonCard} from '@/lib/season-manifest';
import type {RuneDungeonFloor} from '@/lib/rune-dungeon';
import type {DungeonAction,ServerCombatState,CombatFighter} from '@/lib/dungeon-server-engine';

type BattleResponse={attemptId:string;state:ServerCombatState;turnIndex:number;result?:ServerCombatState['result'];reward?:number;alreadyCleared?:boolean;runeEnergy?:number};
type Props={
 floor:RuneDungeonFloor;
 onExit:()=>void;
 onVictory:(result:{reward:number;alreadyCleared:boolean;runeEnergy:number})=>void;
};

/**
 * Beta-only UI for server-resolved Dungeon turns. All HP, damage, wins and
 * rewards come from authenticated server responses; no browser victory call.
 */
export default function DungeonServerBattle({floor,onExit,onVictory}:Props){
 const [roster,setRoster]=useState<string[]>(['sproutling-001','tidefin-003','shadowclaw-007']);
 const [attempt,setAttempt]=useState<string|null>(null);
 const [state,setState]=useState<ServerCombatState|null>(null);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [reward,setReward]=useState<number|null>(null);

 useEffect(()=>{
  let cancelled=false;
  const key='nestrune:dungeon-attempt:'+floor.floor;
  const stored=typeof window!=='undefined'?window.localStorage.getItem(key):null;
  if(!stored)return;
  fetch('/api/dungeon/combat?attempt='+encodeURIComponent(stored),{cache:'no-store'})
   .then(async response=>{const value=await response.json();if(!response.ok)throw Error(value.error||'No resumable battle.');
    if(!cancelled&&value.unexpired&&value.outcome==='active'){
     setAttempt(stored);setState(value.state as ServerCombatState);
     setMessage('Resumed your verified Dungeon battle.');
    }else if(!cancelled)window.localStorage.removeItem(key);
   }).catch(()=>{if(!cancelled)window.localStorage.removeItem(key)});
  return()=>{cancelled=true};
 },[floor.floor]);

 function toggle(id:string){
  if(state||busy)return;
  setRoster(previous=>previous.includes(id)?previous.filter(value=>value!==id):previous.length<3?[...previous,id]:previous);
 }

 async function start(){
  if(roster.length!==3||busy)return;
  setBusy(true);setMessage('');
  try{
   const response=await fetch('/api/dungeon/combat',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'start',floor:floor.floor,roster})
   });
   const data=await response.json();
   if(!response.ok)throw Error(data.error||'Unable to start a verified battle.');
   const battle=data as BattleResponse;
   setAttempt(battle.attemptId);setState(battle.state);setReward(null);
   window.localStorage.setItem('nestrune:dungeon-attempt:'+floor.floor,battle.attemptId);
  }catch(error){setMessage(error instanceof Error?error.message:'Battle could not be started.')}
  finally{setBusy(false)}
 }

 async function move(kind:DungeonAction,swapIndex?:number){
  if(!attempt||!state||state.result!=='active'||busy)return;
  setBusy(true);setMessage('');
  try{
   const response=await fetch('/api/dungeon/combat',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'turn',attempt,expectedTurn:state.turn,move:kind,...(kind==='swap'?{swapIndex}:{})})
   });
   const data=await response.json();
   if(!response.ok)throw Error(data.error||'The server could not complete this turn.');
   const next=data as BattleResponse;
   setState(next.state);
   if(next.state.result!=='active'){
    window.localStorage.removeItem('nestrune:dungeon-attempt:'+floor.floor);
    if(next.state.result==='won'){
     setReward(next.reward??0);
     onVictory({reward:next.reward??0,alreadyCleared:!!next.alreadyCleared,runeEnergy:next.runeEnergy??0});
    }else setMessage('Your guardians fell. No Rune Energy was awarded.');
   }
  }catch(error){setMessage(error instanceof Error?error.message:'Turn failed. Refresh to resume the server battle.')}
  finally{setBusy(false)}
 }

 function names(fighters:CombatFighter[],active:number){
  return <div className="dungeon-floor-grid">{fighters.map((fighter,index)=><div key={fighter.id} className={'dungeon-floor '+(fighter.hp<=0?'locked ':'')+(index===active?'selected':'')}>
   <strong>{seasonCard(fighter.id)?.name||fighter.id}{index===active?' · ACTIVE':''}</strong>
   <p>HP {fighter.hp}/{fighter.maxHp} · Guard {fighter.guard} · Energy {fighter.energy}</p>
   <small>Power cooldown {fighter.cooldown} · Special cooldown {fighter.specialCooldown}</small>
  </div>)}</div>;
 }

 return <section className="rune-dungeon">
  <div className="dungeon-section-head"><div><span className="eyebrow">SERVER-VERIFIED BATTLE BETA</span><h2>{floor.name}</h2></div><button className="outline" onClick={onExit}>← Dungeon map</button></div>
  <p>{floor.mission}</p>
  {!state&&<div className="dungeon-signin">
   <div><strong>Choose three guardians</strong><p>Starter guardians are available to everyone. Earned card rewards require a server-verified win.</p>
    <div className="battle-pill-row">{STARTER_BATTLE_IDS.map(id=><button key={id} type="button" className={roster.includes(id)?'gold':'outline'} aria-pressed={roster.includes(id)} onClick={()=>toggle(id)}>{seasonCard(id)?.name||id}</button>)}</div>
    <button className="gold" disabled={roster.length!==3||busy} onClick={()=>{void start()}}><Swords size={16}/> {busy?'Starting…':'Start verified battle'}</button>
   </div>
  </div>}
  {state&&<div className="dungeon-world">
   <div className="dungeon-section-head"><h3>Turn {state.turn+1} · {state.result==='active'?'Battle underway':state.result==='won'?'Victory!':'Defeat'}</h3><span>Verified on NestRune servers</span></div>
   <h3>Your guardians</h3>{names(state.player,state.playerActive)}
   <h3>Dungeon enemies</h3>{names(state.enemy,state.enemyActive)}
   {state.result==='active'?<><div className="battle-pill-row">
    <button className="gold" disabled={busy} onClick={()=>{void move('strike')}}><Swords size={16}/> Strike</button>
    <button className="outline" disabled={busy} onClick={()=>{void move('guard')}}><Shield size={16}/> Guard</button>
    <button className="outline" disabled={busy} onClick={()=>{void move('ability')}}>Ability</button>
    <button className="outline" disabled={busy} onClick={()=>{void move('power')}}>Power</button>
    <button className="outline" disabled={busy} onClick={()=>{void move('special')}}>Special</button>
   </div>
   <p>Swap active guardian:</p><div className="battle-pill-row">{state.player.map((fighter,index)=><button key={fighter.id} className="outline" disabled={busy||fighter.hp<=0||index===state.playerActive} onClick={()=>{void move('swap',index)}}><SkipForward size={14}/>{seasonCard(fighter.id)?.name||fighter.id}</button>)}</div>
   </>:<p className="dungeon-notice">{state.result==='won'?<><BatteryCharging size={16}/> Verified victory · +{reward??0} first-clear Rune Energy</>:'Defeat · No Energy awarded'}</p>}
  </div>}
  {message&&<p role="status" className="notice dungeon-notice">{message}</p>}
 </section>;
}
