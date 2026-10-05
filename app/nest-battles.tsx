'use client';

import {useEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {AmbientParticles,BattleFxLayer,GreatNest,battleStyles,type BattleEffect} from './battle-fx';
import {ArrowRight,RotateCcw,Shield,Sparkles,Swords,Zap} from 'lucide-react';
import {GuardianCard} from './cards';
import {seasonManifest,themeColors} from '@/lib/season-manifest';
import {CLASS_GUIDE,NEST_BATTLE_RULES_VERSION,abilityDamage,affinityMultiplier,guardDamage,strikeDamage} from '@/lib/nest-battle-rules';
import {trackBeta} from '@/lib/client-analytics';

type Fighter={id:string;hp:number;guard:number;speedDelta:number;cooldown:number;energy:number};
type ActionKind='strike'|'ability';
type BattleFrame={effect:BattleEffect;player:Fighter[];rival:Fighter[];playerActive:number;rivalActive:number};

const learningPoolIds=['sproutling-001','tidefin-003','voltbeak-005','shadowclaw-007','reserved-008','reserved-012'];

function cardById(id:string){return seasonManifest.find(card=>card.id===id)!}
function makeTeam(ids:string[]):Fighter[]{return ids.map(id=>{const c=cardById(id);return {id,hp:c.health,guard:0,speedDelta:0,cooldown:0,energy:2}})}
function nextLiving(team:Fighter[],from=0){for(let offset=0;offset<team.length;offset++){const index=(from+offset)%team.length;if(team[index].hp>0)return index}return 0}
function isTeamDown(team:Fighter[]){return team.every(member=>member.hp<=0)}
function copyTeam(team:Fighter[]){return team.map(member=>({...member}))}
function tickTeam(team:Fighter[]){return team.map(member=>({...member,cooldown:Math.max(0,member.cooldown-1)}))}

export default function NestBattles(){
 const pool=useMemo(()=>learningPoolIds.map(cardById),[]);
 const [selected,setSelected]=useState<string[]>(['sproutling-001','tidefin-003','shadowclaw-007']);
 const [phase,setPhase]=useState<'setup'|'battle'|'finished'>('setup');
 const [player,setPlayer]=useState<Fighter[]>([]);
 const [rival,setRival]=useState<Fighter[]>([]);
 const [playerActive,setPlayerActive]=useState(0);
 const [rivalActive,setRivalActive]=useState(0);
 const [round,setRound]=useState(1);
 const stageRef=useRef<HTMLDivElement>(null);
 const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const playing=useRef(false);
 const finishPlayback=useRef<(()=>void)|null>(null);
 const [busy,setBusy]=useState(false);
 const [fx,setFx]=useState<(BattleEffect&{id:number})|null>(null);
 const sequence=useRef(0);
 const [swapEntering,setSwapEntering]=useState(false);
 useEffect(()=>()=>{timers.current.forEach(clearTimeout);playing.current=false},[]);
 function cancelPlayback(){timers.current.forEach(clearTimeout);timers.current=[];finishPlayback.current=null;playing.current=false;setBusy(false);setFx(null);setSwapEntering(false)}
 function playback(frames:BattleFrame[],finish:()=>void){
  playing.current=true;setBusy(true);
  const complete=()=>{cancelPlayback();finish()};finishPlayback.current=complete;
  const schedule=(fn:()=>void,delay:number)=>{timers.current.push(setTimeout(fn,delay))};
  frames.forEach((frame,index)=>{
   schedule(()=>{setSwapEntering(false);setFx({...frame.effect,id:++sequence.current})},index*600);
   schedule(()=>{setPlayer(frame.player);setRival(frame.rival);setPlayerActive(frame.playerActive);setRivalActive(frame.rivalActive);setSwapEntering(frame.effect.kind==='swap')},index*600+(frame.effect.kind==='swap'?220:280));
  });
  schedule(complete,frames.length*600);
 }
 function snapshot(frames:BattleFrame[],effect:BattleEffect,p:Fighter[],e:Fighter[],pIndex:number,eIndex:number){frames.push({effect,player:copyTeam(p),rival:copyTeam(e),playerActive:pIndex,rivalActive:eIndex})}

 const [log,setLog]=useState<string[]>(['Choose three guardians. The practice rival will use the other three.']);

 function toggle(id:string){
  if(phase!=='setup')return;
  setSelected(current=>current.includes(id)?current.filter(x=>x!==id):current.length<3?[...current,id]:current);
 }

 function start(){
  if(selected.length!==3)return;
  const rivalIds=learningPoolIds.filter(id=>!selected.includes(id));
  setPlayer(makeTeam(selected));setRival(makeTeam(rivalIds));
  setPlayerActive(0);setRivalActive(0);setRound(1);setPhase('battle');
  setLog(['The Garden Arena wakes up. Read the matchup, then choose your first move.']);
  trackBeta('battle-view','start:'+selected.join(','));
 }

 function reset(){
  cancelPlayback();
  setPhase('setup');setPlayer([]);setRival([]);setRound(1);
  setLog(['Choose three guardians. The practice rival will use the other three.']);
  trackBeta('battle-view','reset');
 }

 function receive(team:Fighter[],index:number,amount:number){
  const result=guardDamage(amount,team[index].guard);
  team[index].guard=result.guard;
  team[index].hp=Math.max(0,team[index].hp-result.damage);
  return result;
 }

 function perform(team:Fighter[],active:number,enemy:Fighter[],enemyActive:number,kind:ActionKind,side:'you'|'rival',emit:(effect:BattleEffect)=>void){
  const actor=team[active];const target=enemy[enemyActive];
  if(!actor||actor.hp<=0||!target||target.hp<=0)return side==='you'?'Your guardian could not act.':'The rival lost its action.';
  const card=cardById(actor.id);const foe=cardById(target.id);
  const prefix=side==='you'?card.name:'Rival '+card.name;
  if(kind==='ability'&&actor.cooldown===0&&actor.energy>0){
   const ability=card.abilityPrimary;
   actor.energy-=Math.max(1,ability.energyCost||1);actor.cooldown=Math.max(1,ability.cooldownTurns||2);
   if(ability.effect==='deal_damage'){
    const amount=abilityDamage(card,foe,ability.amount||20);const result=receive(enemy,enemyActive,amount);
    emit({kind:'attack',side,theme:card.theme,amount:result.damage,blocked:result.absorbed});
    return prefix+' uses '+ability.name+' for '+result.damage+' damage'+(result.absorbed?' ('+result.absorbed+' blocked)':'')+'.';
   }
   if(ability.effect==='gain_guard'){
    actor.guard+=ability.amount||20;emit({kind:'shield',side,theme:card.theme,amount:ability.amount||20});return prefix+' uses '+ability.name+' and gains '+(ability.amount||20)+' Guard.';
   }
   if(ability.effect==='heal'){
    const before=actor.hp;actor.hp=Math.min(card.health,actor.hp+(ability.amount||20));emit({kind:'heal',side,theme:card.theme,amount:actor.hp-before});
    return prefix+' uses '+ability.name+' and restores '+(actor.hp-before)+' HP.';
   }
   if(ability.effect==='gain_speed'){
    actor.speedDelta+=ability.amount||20;emit({kind:'speed',side,theme:card.theme,amount:ability.amount||20});return prefix+' uses '+ability.name+' and gains '+(ability.amount||20)+' Speed this round.';
   }
   if(ability.effect==='reduce_speed'){
    target.speedDelta-=ability.amount||20;emit({kind:'debuff',side,theme:card.theme,amount:ability.amount||20});return prefix+' uses '+ability.name+' and cuts '+foe.name+' Speed by '+(ability.amount||20)+' this round.';
   }
  }
  actor.energy=Math.min(3,actor.energy+1);const amount=strikeDamage(card,foe);const result=receive(enemy,enemyActive,amount);
    emit({kind:'attack',side,theme:card.theme,amount:result.damage,blocked:result.absorbed});
  const mult=affinityMultiplier(card.theme,foe);
  const note=mult>1?' Super effective!':mult<1?' Resisted.':'';
  return prefix+' uses Quick Strike for '+result.damage+' damage'+(result.absorbed?' ('+result.absorbed+' blocked)':'')+'.'+note;
 }

 function rivalChoice(team:Fighter[],active:number){
  const member=team[active];if(!member)return 'strike' as ActionKind;
  const card=cardById(member.id);if(member.cooldown>0||member.energy<=0)return 'strike';
  if(card.abilityPrimary.effect==='heal'&&member.hp>=card.health*.78)return 'strike';
  if(card.abilityPrimary.effect==='gain_guard'&&member.guard>=12)return 'strike';
  return 'ability';
 }

 function act(kind:ActionKind){
  if(phase!=='battle'||playing.current)return;
  const p=tickTeam(copyTeam(player));const e=tickTeam(copyTeam(rival));
  let pIndex=playerActive;let eIndex=rivalActive;
  if(p[pIndex]?.hp<=0)pIndex=nextLiving(p,pIndex+1);
  if(e[eIndex]?.hp<=0)eIndex=nextLiving(e,eIndex+1);
  const pCard=cardById(p[pIndex].id);const eCard=cardById(e[eIndex].id);
  const rivalKind=rivalChoice(e,eIndex);
  const playerSpeed=pCard.speed+p[pIndex].speedDelta;
  const rivalSpeed=eCard.speed+e[eIndex].speedDelta;
  p[pIndex].speedDelta=0;e[eIndex].speedDelta=0;
  const frames:BattleFrame[]=[];
  const emit=(effect:BattleEffect)=>snapshot(frames,effect,p,e,pIndex,eIndex);
  const notes:string[]=[];
  if(playerSpeed>=rivalSpeed){
   notes.push(perform(p,pIndex,e,eIndex,kind,'you',emit));
   if(!isTeamDown(e)&&e[eIndex].hp>0)notes.push(perform(e,eIndex,p,pIndex,rivalKind,'rival',emit));
  }else{
   notes.push(perform(e,eIndex,p,pIndex,rivalKind,'rival',emit));
   if(!isTeamDown(p)&&p[pIndex].hp>0)notes.push(perform(p,pIndex,e,eIndex,kind,'you',emit));
  }
  if(e[eIndex].hp<=0&&!isTeamDown(e)){const next=nextLiving(e,eIndex+1);eIndex=next;emit({kind:'swap',side:'rival',theme:cardById(e[next].id).theme});notes.push('The rival sends in '+cardById(e[next].id).name+'.')}
  if(p[pIndex].hp<=0&&!isTeamDown(p)){const next=nextLiving(p,pIndex+1);pIndex=next;emit({kind:'swap',side:'you',theme:cardById(p[next].id).theme});notes.push(cardById(p[next].id).name+' flies in for your team.')}
  const won=isTeamDown(e);const lost=isTeamDown(p);
  if(won)notes.push('The Great Nest is safe. Your team wins the practice match!');
  if(lost)notes.push('Your team needs a rest. Try a different trio or order.');
  playback(frames,()=>{
  setPlayer(p);setRival(e);setPlayerActive(pIndex);setRivalActive(eIndex);setRound(value=>value+1);
  setLog(current=>[...notes,...current].slice(0,8));
  if(won||lost){setPhase('finished');trackBeta('battle-view',won?'finish:win':'finish:loss')}
  });
 }

 function swap(index:number){
  if(phase!=='battle'||playing.current||index===playerActive||player[index]?.hp<=0)return;
  const p=tickTeam(copyTeam(player));const e=tickTeam(copyTeam(rival));
  const old=cardById(p[playerActive].id);const incoming=cardById(p[index].id);
  const eIndex=e[rivalActive]?.hp>0?rivalActive:nextLiving(e,rivalActive+1);
  const notes=['You swap '+old.name+' for '+incoming.name+'.'];
  let pIndex=index;
  const frames:BattleFrame[]=[];
  const emit=(effect:BattleEffect)=>snapshot(frames,effect,p,e,pIndex,eIndex);
  emit({kind:'swap',side:'you',theme:incoming.theme});
  notes.push(perform(e,eIndex,p,index,rivalChoice(e,eIndex),'rival',emit));
  if(p[pIndex].hp<=0&&!isTeamDown(p)){pIndex=nextLiving(p,pIndex+1);emit({kind:'swap',side:'you',theme:cardById(p[pIndex].id).theme});notes.push(cardById(p[pIndex].id).name+' steps in after the counterattack.')}
  const lost=isTeamDown(p);
  if(lost)notes.push('Your team needs a rest. Try a different trio or order.');
  playback(frames,()=>{
  setPlayer(p);setRival(e);setPlayerActive(pIndex);setRivalActive(eIndex);setRound(value=>value+1);
  setLog(current=>[...notes,...current].slice(0,8));if(lost)setPhase('finished');
  });
 }

 if(phase==='setup')return <section className="nest-battles">
  <div className="battle-hero">
   <div><span className="eyebrow">NEST BATTLES · PLAYABLE ALPHA</span><h1>Pick your flock. Protect the Great Nest.</h1><p>Choose any three Common guardians. Each class teaches a different kind of strategy, and the practice rival uses the three you leave behind.</p><div className="battle-pill-row"><span>3 Guardian teams</span><span>No paid advantage</span><span>Common cards matter</span><span>2–5 minute practice</span></div></div>
   <div className="battle-orb" aria-hidden="true"><Sparkles/><strong>3</strong><span>Choose three</span></div>
  </div>
  <div className="battle-picker-head"><div><span className="eyebrow">STARTER LAB</span><h2>Six classes. Three slots. Your strategy.</h2></div><strong>{selected.length} / 3 selected</strong></div>
  <div className="battle-picker-grid">{pool.map(card=>{const picked=selected.includes(card.id);const guide=CLASS_GUIDE[card.battleClass];return <button key={card.id} className={'battle-picker '+(picked?'selected':'')} onClick={()=>toggle(card.id)} aria-pressed={picked}>
   <div className="battle-picker-art"><GuardianCard id={card.id}/><span className="battle-check">{picked?'✓':'+'}</span></div>
   <div className="battle-picker-copy"><span style={{color:themeColors[card.theme]}}>{card.theme} · {card.battleClass}</span><h3>{card.name}</h3><p>{guide?.purpose}</p><small>HP {card.health} · ATK {card.attack} · DEF {card.defense} · SPD {card.speed}</small></div>
  </button>})}</div>
  <div className="battle-launch"><div><Shield/><strong>Kid-friendly surface, grown-up decisions.</strong><p>Big readable moves and bright feedback on top; affinity, timing, class roles, Guard, Energy and cooldowns underneath.</p></div><button className="gold" disabled={selected.length!==3} onClick={start}>Start practice match <ArrowRight size={17}/></button></div>
  <div className="battle-roadmap"><article><span>01</span><h3>Practice Arena</h3><p>Local battles and rule testing with no rewards or spending.</p></article><article><span>02</span><h3>Garden Adventure</h3><p>PvE chapters, habitats and boss encounters built around the six Themes.</p></article><article><span>03</span><h3>Nest League</h3><p>Ranked play after balance, account safety and anti-cheat validation.</p></article><article><span>04</span><h3>Flocks</h3><p>Cooperative groups and shared bosses without open child chat at launch.</p></article></div>
  <p className="disclaimer">Alpha rules: {NEST_BATTLE_RULES_VERSION}. Battle results do not change ownership, rarity, collection value, pack odds or commercial eligibility.</p>
 </section>;

 const active=player[playerActive];const enemy=rival[rivalActive];const activeCard=active?cardById(active.id):pool[0];const enemyCard=enemy?cardById(enemy.id):pool[1];
 const motion=(side:'you'|'rival')=>!fx?undefined:fx.kind==='swap'&&fx.side===side?(swapEntering?'in':'out'):fx.kind==='attack'?(fx.side===side?'attack':'hit'):undefined;
 const abilityReady=!!active&&active.cooldown===0&&active.energy>0;
 return <section className="nest-battles">
  <div className="battle-match-head"><div><span className="eyebrow">GARDEN ARENA · ROUND {round}</span><h1>{phase==='finished'?'Practice complete.':'Read the field. Choose your move.'}</h1><p>Speed decides who acts first. Guard absorbs damage. Affinity can strengthen or soften an attack.</p></div><button className="outline" onClick={reset}><RotateCcw size={16}/>New team</button></div>
  <div ref={stageRef} className={`battle-stage ${battleStyles.arena}`} data-impact={fx?.kind==='attack'}>
   <AmbientParticles/>
   <BattleFxLayer key={fx?.id??0} effect={fx} stageRef={stageRef}/>
   <div className="battle-sky battle-sky-rival">
    <div className="battle-team-strip">{rival.map((fighter,index)=><div key={fighter.id} className={'battle-mini '+(index===rivalActive?'active':'')+(fighter.hp<=0?' down':'')}><GuardianCard id={fighter.id}/><span>{fighter.hp>0?fighter.hp+' HP':'Resting'}</span></div>)}</div>
    <div className={`battle-active-card rival-card ${battleStyles.fighter}`} data-battle-side="rival" data-motion={motion('rival')} data-guard={!!enemy?.guard} style={{'--aura':themeColors[enemyCard.theme]} as CSSProperties}><GuardianCard id={enemyCard.id}/><div className="battle-status"><strong>{enemyCard.name}</strong><span>{enemyCard.theme} · {enemyCard.battleClass}</span><div className="hp-track"><i style={{width:Math.max(0,(enemy?.hp||0)/enemyCard.health*100)+'%'}}/></div><small>{enemy?.hp||0} / {enemyCard.health} HP · {enemy?.guard||0} Guard</small><span className={battleStyles.speedStatus}>Speed {enemyCard.speed+(enemy?.speedDelta||0)} · {enemy?.energy||0} Energy · Cooldown {enemy?.cooldown||0}</span></div></div>
   </div>
   <div className="battle-center"><span>THE GREAT NEST</span><GreatNest/><strong>VS</strong><small>{activeCard.theme} into {enemyCard.theme}: {affinityMultiplier(activeCard.theme,enemyCard)>1?'advantage':affinityMultiplier(activeCard.theme,enemyCard)<1?'resisted':'neutral'}</small></div>
   <div className="battle-sky battle-sky-player">
    <div className={`battle-active-card ${battleStyles.fighter}`} data-battle-side="you" data-motion={motion('you')} data-guard={!!active?.guard} style={{'--aura':themeColors[activeCard.theme]} as CSSProperties}><GuardianCard id={activeCard.id}/><div className="battle-status"><strong>{activeCard.name}</strong><span style={{color:themeColors[activeCard.theme]}}>{activeCard.theme} · {activeCard.battleClass}</span><div className="hp-track"><i style={{width:Math.max(0,(active?.hp||0)/activeCard.health*100)+'%'}}/></div><small>{active?.hp||0} / {activeCard.health} HP · {active?.guard||0} Guard · {active?.energy||0} Energy</small><span className={battleStyles.speedStatus}>Speed {activeCard.speed+(active?.speedDelta||0)} · Cooldown {active?.cooldown||0}</span></div></div>
    <div className="battle-team-strip">{player.map((fighter,index)=><button key={fighter.id} disabled={busy||phase!=='battle'||fighter.hp<=0||index===playerActive} onClick={()=>swap(index)} className={'battle-mini '+(index===playerActive?'active':'')+(fighter.hp<=0?' down':'')}><GuardianCard id={fighter.id}/><span>{index===playerActive?'Active':fighter.hp>0?'Swap · '+fighter.hp+' HP':'Resting'}</span></button>)}</div>
   </div>
  </div>
  <div className={battleStyles.controls}><p role="status">{busy?'Guardians in motion…':'Your move · Choose a move or swap a Guardian.'}</p>{busy&&<button className="outline" onClick={()=>finishPlayback.current?.()}>Skip effects</button>}</div>
  <div className="battle-command-deck">
   <button className="battle-command strike" disabled={busy||phase!=='battle'} onClick={()=>act('strike')}><Swords/><span><strong>Quick Strike</strong><small>Reliable damage · restores 1 Energy</small></span></button>
   <button className="battle-command ability" disabled={busy||phase!=='battle'||!abilityReady} onClick={()=>act('ability')}><Zap/><span><strong>{activeCard.abilityPrimary.name}</strong><small>{abilityReady?'1 Energy · '+activeCard.abilityPrimary.effect.replaceAll('_',' '):active?.cooldown?'Cooldown '+active.cooldown+' round'+(active.cooldown===1?'':'s'):'Needs Energy'}</small></span></button>
   <div className="battle-tip"><Shield/><div><strong>{CLASS_GUIDE[activeCard.battleClass]?.label} tip</strong><p>{CLASS_GUIDE[activeCard.battleClass]?.purpose}</p></div></div>
  </div>
  <div className="battle-log" aria-live="polite"><span className="eyebrow">BATTLE STORY</span>{log.map((entry,index)=><p key={index} className={index===0?'latest':''}>{entry}</p>)}</div>
  {phase==='finished'&&<div className="battle-finish"><Sparkles/><div><h2>{isTeamDown(rival)?'Your Nest held strong!':'A new strategy is waiting.'}</h2><p>Try another combination. The same Common guardians can play very differently depending on class and matchup.</p></div><button className="gold" onClick={reset}>Build another team</button></div>}
  <p className="disclaimer">Practice alpha only. No matchmaking, trading, rewards, paid boosts or persistent battle rank are active. Stats and rules remain subject to playtesting.</p>
 </section>;
}
