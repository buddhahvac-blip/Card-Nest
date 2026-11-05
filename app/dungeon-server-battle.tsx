'use client';

import {useEffect,useState} from 'react';
import Image from 'next/image';
import {ArrowLeft,BatteryCharging,CheckCircle2,RotateCcw,Shield,SkipForward,Sparkles,Swords} from 'lucide-react';
import {STARTER_BATTLE_IDS} from '@/lib/battle-roster';
import {battleAbilityProfile} from '@/lib/battle-ability-profile';
import {seasonCard} from '@/lib/season-manifest';
import type {RuneDungeonFloor} from '@/lib/rune-dungeon';
import type {DungeonAction,ServerCombatState,CombatFighter} from '@/lib/dungeon-server-engine';
import styles from './dungeon-server-battle.module.css';

type BattleResponse={
 attemptId:string;state:ServerCombatState;turnIndex:number;result?:ServerCombatState['result'];
 reward?:number;alreadyCleared?:boolean;runeEnergy?:number;unexpired?:boolean;outcome?:string;
};
type Props={
 floor:RuneDungeonFloor;
 onExit:()=>void;
 onVictory:(result:{reward:number;alreadyCleared:boolean;runeEnergy:number})=>void;
};

function portraitFor(id:string){
 const card=seasonCard(id);
 return [card?.avatarUrl,card?.thumbnailUrl,card?.fullCardUrl].find((src):src is string=>typeof src==='string'&&src.startsWith('/'))||null;
}
function FighterCard({fighter,active,enemy}:{
 fighter:CombatFighter;active:boolean;enemy:boolean;
}){
 const name=seasonCard(fighter.id)?.name||fighter.id;
 const portrait=portraitFor(fighter.id);
 const health=Math.max(0,Math.min(100,Math.round((fighter.hp/Math.max(1,fighter.maxHp))*100)));
 const cls=[styles.fighter,enemy?styles.enemy:'',active?styles.activeFighter:'',fighter.hp<=0?styles.knockedOut:''].filter(Boolean).join(' ');
 return <article className={cls} aria-label={name+', '+fighter.hp+' of '+fighter.maxHp+' health'}>
  <div className={styles.cardTop}><small>{enemy?'DUNGEON FOE':'YOUR GUARDIAN'}</small>{active&&<b>ACTIVE</b>}</div>
  <div className={styles.cardBody}>
   <div className={styles.portrait}>
    {portrait?<Image src={portrait} alt={name+' artwork'} fill sizes="(max-width: 780px) 86px, 110px"/>:<span className={styles.artFallback} aria-hidden="true">{name.slice(0,1)}</span>}
   </div>
   <div className={styles.cardText}>
    <h4>{name}</h4>
    <div className={styles.health}><span>HP</span><strong>{fighter.hp}/{fighter.maxHp}</strong></div>
    <div className={styles.healthTrack} role="progressbar" aria-label={name+' health'} aria-valuemin={0} aria-valuemax={fighter.maxHp} aria-valuenow={fighter.hp}>
     <span className={styles.healthFill} style={{width:health+'%'}}/>
    </div>
    <div className={styles.stats}>
     <span className={styles.stat}><BatteryCharging aria-hidden="true"/> {fighter.energy} Energy</span>
     {fighter.guard>0&&<span className={styles.stat}><Shield aria-hidden="true"/> {fighter.guard} Guard</span>}
     {fighter.speedTurns>0&&<span className={styles.stat}><Sparkles aria-hidden="true"/> {fighter.speedBonus>0?'+':''}{fighter.speedBonus} Speed</span>}
    </div>
   </div>
  </div>
 </article>;
}
const keyFor=(floor:number)=>'nestrune:dungeon-attempt:'+floor;

export default function DungeonServerBattle({floor,onExit,onVictory}:Props){
 const [roster,setRoster]=useState<string[]>(['sproutling-001','tidefin-003','shadowclaw-007']);
 const [attempt,setAttempt]=useState<string|null>(null);
 const [state,setState]=useState<ServerCombatState|null>(null);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [reward,setReward]=useState<number|null>(null);

 useEffect(()=>{
  let cancelled=false;
  const key=keyFor(floor.floor);
  const stored=window.localStorage.getItem(key);
  if(!stored)return;
  fetch('/api/dungeon/combat?attempt='+encodeURIComponent(stored),{cache:'no-store'})
   .then(async response=>{
    const value=await response.json();
    if(!response.ok)throw Error(value.error||'No resumable battle.');
    if(!cancelled&&value.unexpired&&value.outcome==='active'){
     setAttempt(stored);
     setState(value.state as ServerCombatState);
     setMessage('Your verified battle was resumed from the server.');
    }else if(!cancelled)window.localStorage.removeItem(key);
   })
   .catch(()=>{if(!cancelled)window.localStorage.removeItem(key)});
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
   window.localStorage.setItem(keyFor(floor.floor),battle.attemptId);
  }catch(error){setMessage(error instanceof Error?error.message:'Battle could not be started.');}
  finally{setBusy(false);}
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
   if(!response.ok){
    if(response.status===409&&attempt){
     const latest=await fetch('/api/dungeon/combat?attempt='+encodeURIComponent(attempt),{cache:'no-store'});
     if(latest.ok){
      const updated=await latest.json() as BattleResponse;
      setState(updated.state);
     }
    }
    throw Error(data.error||'The server could not complete this turn.');
   }
   const next=data as BattleResponse;
   setState(next.state);
   if(next.state.result!=='active'){
    window.localStorage.removeItem(keyFor(floor.floor));
    if(next.state.result==='won'){
     setReward(next.reward??0);
     onVictory({reward:next.reward??0,alreadyCleared:!!next.alreadyCleared,runeEnergy:next.runeEnergy??0});
    }else setMessage('Your Guardians fell. This attempt awarded no Rune Energy.');
   }
  }catch(error){setMessage(error instanceof Error?error.message:'Turn failed. Refresh to resume your server battle.');}
  finally{setBusy(false);}
 }
 function reset(){
  window.localStorage.removeItem(keyFor(floor.floor));
  setAttempt(null);setState(null);setReward(null);setMessage('');
 }
 const active=state?.player[state.playerActive];
 const card=active?seasonCard(active.id):null;
 const profile=card?battleAbilityProfile(card.rarity):'standard';
 const primaryKind:DungeonAction=profile==='high'?'power':'ability';
 const primaryName=profile==='high'?'Power Strike':card?.abilityPrimary?.name||'Ability';
 const primaryCost=profile==='high'?1:Math.max(1,card?.abilityPrimary?.energyCost||1);
 const specialName=profile==='high'?'Special Attack':card?.abilitySecondary?.name||'Special';
 const specialCost=profile==='high'?3:Math.max(1,card?.abilitySecondary?.energyCost||3);
 const ready=!!active&&active.hp>0&&!busy&&state?.result==='active';
 const canPrimary=ready&&profile!=='uncommon'&&(active?.energy??0)>=primaryCost&&(active?.cooldown??99)<=1;
 const canSpecial=ready&&profile!=='uncommon'&&(active?.energy??0)>=specialCost&&(active?.specialCooldown??99)<=1;
 const canGuard=ready&&(active?.energy??0)>=1&&(active?.defenseCooldown??99)<=1;
 const isWinner=state?.result==='won';

 return <section className={styles.root} aria-label="Server-verified Rune Dungeon battle">
  <div className={styles.head}>
   <div>
    <span className={styles.kicker}><Shield aria-hidden="true"/> SERVER-VERIFIED DUNGEON BETA</span>
    <h2>{floor.name}</h2>
    <p>{floor.mission} Battles are resolved and recorded by NestRune's server, not by your browser.</p>
   </div>
   <button type="button" className={styles.back} onClick={onExit}><ArrowLeft size={16} aria-hidden="true"/> World map</button>
  </div>
  {!state?
   <section className={styles.roster} aria-label="Choose your Guardian team">
    <div className={styles.rosterHead}>
     <span className={styles.eyebrow}>STEP 1 · BUILD YOUR TEAM</span>
     <h3>Choose three Guardians</h3>
     <p>Starter Guardians are free. Choose three from the roster below, then enter the arena. Rewards can only be earned by verified first-clear victories.</p>
    </div>
    <div className={styles.rosterGrid}>
     {STARTER_BATTLE_IDS.map(id=>{
      const hero=seasonCard(id),selected=roster.includes(id),portrait=portraitFor(id);
      return <button type="button" key={id} className={[styles.rosterChoice,selected?styles.selected:''].filter(Boolean).join(' ')}
       aria-pressed={selected} disabled={busy||(!selected&&roster.length>=3)} onClick={()=>toggle(id)}>
       <span className={styles.thumb}>{portrait?<Image src={portrait} alt="" fill sizes="68px"/>:<span className={styles.thumbFallback}>{(hero?.name||id).slice(0,1)}</span>}</span>
       <span><strong>{hero?.name||id}</strong><small>{hero?.rarity||'Guardian'} · Speed {hero?.speed||0}</small>{selected&&<mark>SELECTED</mark>}</span>
      </button>;
     })}
    </div>
    <div className={styles.startRow}>
     <p>{roster.length}/3 Guardians selected · Three unique Guardians are required.</p>
     <button type="button" className={styles.primary} disabled={busy||roster.length!==3} onClick={()=>{void start();}}>
      <Swords size={18} aria-hidden="true"/>{busy?'Starting battle…':'Start verified battle'}
     </button>
    </div>
   </section>:
   <>
    <section className={styles.arena} aria-label="Live battle state">
     <div className={styles.arenaHead}>
      <div><span className={styles.eyebrow}>THE RUNE DUNGEON ARENA</span><h3>{state.result==='active'?'Battle in progress':isWinner?'Verified victory':'Battle ended'}</h3></div>
      <span className={styles.turnChip}>TURN {state.turn+1} · {state.result==='active'?'IN PROGRESS':isWinner?'VICTORY':'DEFEAT'}</span>
     </div>
     <div className={styles.side}>
      <div className={styles.sideTitle}>DUNGEON ENEMIES <small>Server-controlled formation</small></div>
      <div className={styles.fighters}>{state.enemy.map((fighter,index)=><FighterCard key={fighter.id} fighter={fighter} active={index===state.enemyActive} enemy={true}/>)}</div>
     </div>
     <div className={styles.vs}>VERSUS</div>
     <div className={styles.side}>
      <div className={styles.sideTitle}>YOUR NEST <small>Three-Guardian team</small></div>
      <div className={styles.fighters}>{state.player.map((fighter,index)=><FighterCard key={fighter.id} fighter={fighter} active={index===state.playerActive} enemy={false}/>)}</div>
     </div>
    </section>
    {state.result==='active'?
     <section className={styles.commands} aria-label="Choose your battle action">
      <span className={styles.eyebrow}>STEP 2 · COMMAND YOUR GUARDIAN</span>
      <h3>{card?.name||'Guardian'} · Your move</h3>
      <p>Attack, defend, or swap Guardians. The server verifies each turn. Energy and cooldowns determine which abilities are available.</p>
      <div className={styles.actionGrid}>
       <button type="button" className={[styles.action,styles.actionAccent].join(' ')} disabled={!ready} onClick={()=>{void move('strike');}}>
        <Swords aria-hidden="true"/> Strike <small>Basic attack · gain 1 Energy</small>
       </button>
       <button type="button" className={styles.action} disabled={!canGuard} onClick={()=>{void move('guard');}}>
        <Shield aria-hidden="true"/> Guard <small>1 Energy · {active&&active.defenseCooldown>1?'Recharge in '+(active.defenseCooldown-1)+' turn(s)':'Shield your Guardian'}</small>
       </button>
       {profile!=='uncommon'&&<button type="button" className={styles.action} disabled={!canPrimary} onClick={()=>{void move(primaryKind);}}>
        <Sparkles aria-hidden="true"/> {primaryName} <small>{primaryCost} Energy · {active&&active.cooldown>1?'Recharge in '+(active.cooldown-1)+' turn(s)':'Ability ready'}</small>
       </button>}
       {profile!=='uncommon'&&<button type="button" className={styles.action} disabled={!canSpecial} onClick={()=>{void move('special');}}>
        <BatteryCharging aria-hidden="true"/> {specialName} <small>{specialCost} Energy · {active&&active.specialCooldown>1?'Recharge in '+(active.specialCooldown-1)+' turn(s)':'Powerful move'}</small>
       </button>}
      </div>
      <div className={styles.swap}>
       <span className={styles.swapLabel}>SWAP ACTIVE GUARDIAN</span>
       {state.player.map((fighter,index)=><button type="button" key={fighter.id}
        disabled={busy||fighter.hp<=0||index===state.playerActive} onClick={()=>{void move('swap',index);}}>
        <SkipForward size={14} aria-hidden="true"/>{seasonCard(fighter.id)?.name||fighter.id} · {fighter.hp} HP
       </button>)}
      </div>
     </section>:
     <section className={styles.outcome} aria-live="polite">
      {isWinner?<CheckCircle2 aria-hidden="true"/>:<Shield aria-hidden="true"/>}
      <h3>{isWinner?'Victory recorded':'Your Guardians were defeated'}</h3>
      <p>{isWinner?'The server verified your battle result. First-clear rewards: +'+(reward??0)+' Rune Energy. Replays never double-award Energy.':'No Rune Energy was awarded. You can adjust your team and challenge this floor again.'}</p>
      <div className={styles.outcomeActions}>
       <button className={styles.primary} type="button" onClick={onExit}><ArrowLeft size={16} aria-hidden="true"/> Back to the world map</button>
       <button className={styles.back} type="button" onClick={reset}><RotateCcw size={16} aria-hidden="true"/> Play again</button>
      </div>
     </section>}
   </>
  }
  {message&&<p role="status" className={styles.message}>{message}</p>}
 </section>;
}
