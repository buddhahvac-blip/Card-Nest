'use client';

import {useEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import Image from 'next/image';
import commonMasterArt from '@/data/common-master-art.json';
import {AmbientParticles,ArenaEnvironment,BattleFxLayer,GreatNest,battleStyles,type BattleEffect} from './battle-fx';
import {ArrowRight,RotateCcw,Shield,Sparkles,Swords,Volume2,VolumeX,Zap} from 'lucide-react';
import {GuardianCard} from './cards';
import {seasonManifest,themeColors} from '@/lib/season-manifest';
import {CLASS_GUIDE,NEST_BATTLE_RULES_VERSION,abilityDamage,affinityMultiplier,guardDamage,strikeDamage} from '@/lib/nest-battle-rules';
import {trackBeta} from '@/lib/client-analytics';
import {showcaseFor} from '@/lib/showcase';
import {playBattleSound,startBattleMusic,stopBattleMusic,unlockBattleAudio,type BattleMusicKey} from '@/lib/battle-audio';
import {battleRosterIds,practiceRivalIds} from '@/lib/battle-roster';
import {battleAbilityProfile,rarityAttackTuning} from '@/lib/battle-ability-profile';

type Fighter={id:string;hp:number;maxHp:number;guard:number;speedDelta:number;cooldown:number;specialCooldown:number;defenseCooldown:number;energy:number};
export type DungeonBattleConfig={floor:number;world:'verdant'|'emberstorm'|'eclipse';worldName:string;worldThemes:string[];musicKey:BattleMusicKey;name:string;mission:string;energy:number;boss?:boolean;worldBoss?:boolean;enemyIds:string[];hpMultiplier:number;damageMultiplier:number;rewardsEnabled:boolean;onVictory:()=>void;onExit:()=>void};
type ActionKind='strike'|'ability'|'power'|'special'|'guard';
type BattleFrame={effect:BattleEffect;player:Fighter[];rival:Fighter[];playerActive:number;rivalActive:number};

const illustratedBattleIds=Object.keys(commonMasterArt as Record<string,string>);

function cardById(id:string){return seasonManifest.find(card=>card.id===id)!}
function makeTeam(ids:string[],hpMultiplier=1):Fighter[]{return ids.map(id=>{const c=cardById(id);const maxHp=Math.max(1,Math.round(c.health*hpMultiplier));return {id,hp:maxHp,maxHp,guard:0,speedDelta:0,cooldown:0,specialCooldown:0,defenseCooldown:0,energy:2}})}
function nextLiving(team:Fighter[],from=0){for(let offset=0;offset<team.length;offset++){const index=(from+offset)%team.length;if(team[index].hp>0)return index}return 0}
function isTeamDown(team:Fighter[]){return team.every(member=>member.hp<=0)}
function copyTeam(team:Fighter[]){return team.map(member=>({...member}))}
function tickTeam(team:Fighter[]){return team.map(member=>({...member,cooldown:Math.max(0,member.cooldown-1),specialCooldown:Math.max(0,member.specialCooldown-1),defenseCooldown:Math.max(0,member.defenseCooldown-1)}))}

export default function NestBattles({dungeon}:{dungeon?:DungeonBattleConfig}={}){
 const [battlePoolIds,setBattlePoolIds]=useState<string[]>(()=>battleRosterIds([],illustratedBattleIds));
 const [uploadedArt,setUploadedArt]=useState<Record<string,string>>({});
 const pool=useMemo(()=>battlePoolIds.map(cardById).filter(Boolean),[battlePoolIds]);
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
 const [inspectCard,setInspectCard]=useState<string|null>(null);
 const [soundOn,setSoundOn]=useState(true);
 const victoryReported=useRef(false);
 useEffect(()=>{
  let active=true;
  Promise.all([
   fetch('/api/catalog',{cache:'no-store'}).then(async response=>response.ok?response.json():{cards:[]}).catch(()=>({cards:[]})),
   fetch('/api/season-art',{cache:'no-store'}).then(async response=>response.ok?response.json():{art:{}}).catch(()=>({art:{}}))
  ]).then(([catalogData,artData])=>{
   if(!active)return;
   setBattlePoolIds(battleRosterIds(Array.isArray(catalogData.cards)?catalogData.cards:[],illustratedBattleIds));
   setUploadedArt(artData&&typeof artData.art==='object'?artData.art:{});
  });
  return()=>{active=false;timers.current.forEach(clearTimeout);playing.current=false;stopBattleMusic(.15)};
 },[]);
 function cancelPlayback(){timers.current.forEach(clearTimeout);timers.current=[];finishPlayback.current=null;playing.current=false;setBusy(false);setFx(null);setSwapEntering(false)}
 function playback(frames:BattleFrame[],finish:()=>void){
  playing.current=true;setBusy(true);
  const complete=()=>{cancelPlayback();finish()};finishPlayback.current=complete;
  const schedule=(fn:()=>void,delay:number)=>{timers.current.push(setTimeout(fn,delay))};
  frames.forEach((frame,index)=>{
   schedule(()=>{setSwapEntering(false);setFx({...frame.effect,id:++sequence.current});playBattleSound(frame.effect,soundOn)},index*600);
   schedule(()=>{setPlayer(frame.player);setRival(frame.rival);setPlayerActive(frame.playerActive);setRivalActive(frame.rivalActive);setSwapEntering(frame.effect.kind==='swap')},index*600+(frame.effect.kind==='swap'?220:280));
  });
  schedule(complete,frames.length*600);
 }
 function snapshot(frames:BattleFrame[],effect:BattleEffect,p:Fighter[],e:Fighter[],pIndex:number,eIndex:number){frames.push({effect,player:copyTeam(p),rival:copyTeam(e),playerActive:pIndex,rivalActive:eIndex})}

 const [log,setLog]=useState<string[]>(['Choose three battle-ready guardians.']);

 function toggle(id:string){
  if(phase!=='setup')return;
  setSelected(current=>current.includes(id)?current.filter(x=>x!==id):current.length<3?[...current,id]:current);
 }

 function start(){
  if(selected.length!==3)return;
  victoryReported.current=false;
  if(soundOn){unlockBattleAudio();startBattleMusic(true,dungeon?.musicKey||'emberstorm')}
  const rivalIds=dungeon?.enemyIds||practiceRivalIds(battlePoolIds,selected);
  setPlayer(makeTeam(selected));setRival(makeTeam(rivalIds,dungeon?.hpMultiplier||1));
  setPlayerActive(0);setRivalActive(0);setRound(1);setPhase('battle');
  setLog([dungeon?`Floor ${dungeon.floor}: ${dungeon.name}. ${dungeon.mission}`:'The Garden Arena wakes up. Read the matchup, then choose your first move.']);
  trackBeta('battle-view',(dungeon?'dungeon:'+dungeon.floor+':':'start:')+selected.join(','));
 }

 function reset(){
  cancelPlayback();
  stopBattleMusic(.22);
  setPhase('setup');setPlayer([]);setRival([]);setRound(1);
  setLog(['Choose three battle-ready guardians.']);
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
  const profile=battleAbilityProfile(card.rarity);
  const tuning=rarityAttackTuning(card.rarity);

  if(kind==='guard'){
   const cost=1;
   if(actor.defenseCooldown===0&&actor.energy>=cost){
    actor.energy-=cost;
    actor.defenseCooldown=2;
    const amount=Math.max(16,Math.round(tuning.guard+card.defense*.28));
    actor.guard+=amount;
    emit({kind:'shield',side,theme:card.theme,amount,variant:'ability',label:'Rune Guard'});
    return prefix+' raises Rune Guard and gains '+amount+' Guard.';
   }
  }

  if(profile==='high'&&(kind==='power'||kind==='special')){
   const special=kind==='special';
   const cooldown=special?actor.specialCooldown:actor.cooldown;
   const cost=special?3:1;
   if(cooldown===0&&actor.energy>=cost){
    actor.energy-=cost;
    if(special)actor.specialCooldown=4;else actor.cooldown=2;
    const base=special?tuning.special:tuning.power;
    const raw=abilityDamage(card,foe,base);
    const amount=Math.max(1,Math.round(raw*(side==='rival'?(dungeon?.damageMultiplier||1):1)));
    const result=receive(enemy,enemyActive,amount);
    const label=special?'Signature Strike':'Rune Assault';
    emit({kind:'attack',side,theme:card.theme,amount:result.damage,blocked:result.absorbed,variant:special?'special':'ability',label,knockout:target.hp<=0});
    return prefix+' uses '+label+' for '+result.damage+' damage'+(result.absorbed?' ('+result.absorbed+' blocked)':'')+(special?' — Special!':'')+'.';
   }
  }

  if(profile!=='uncommon'&&(kind==='ability'||kind==='special')){
   const special=kind==='special';
   const ability=special?card.abilitySecondary:card.abilityPrimary;
   const cooldown=special?actor.specialCooldown:actor.cooldown;
   const cost=Math.max(1,ability.energyCost||1);
   if(cooldown===0&&actor.energy>=cost){
    actor.energy-=cost;
    if(special)actor.specialCooldown=Math.max(4,ability.cooldownTurns||4);
    else actor.cooldown=Math.max(1,ability.cooldownTurns||2);
    const variant=special?'special' as const:'ability' as const;
    if(ability.effect==='deal_damage'){
     const raw=abilityDamage(card,foe,ability.amount||20);const amount=Math.max(1,Math.round(raw*(side==='rival'?(dungeon?.damageMultiplier||1):1)));const result=receive(enemy,enemyActive,amount);
     emit({kind:'attack',side,theme:card.theme,amount:result.damage,blocked:result.absorbed,variant,label:ability.name,knockout:target.hp<=0});
     return prefix+' unleashes '+ability.name+' for '+result.damage+' damage'+(result.absorbed?' ('+result.absorbed+' blocked)':'')+(special?' — Special!':'')+'.';
    }
    if(ability.effect==='gain_guard'){
     actor.guard+=ability.amount||20;emit({kind:'shield',side,theme:card.theme,amount:ability.amount||20,variant,label:ability.name});
     return prefix+' uses '+ability.name+' and gains '+(ability.amount||20)+' Guard'+(special?' — Special!':'')+'.';
    }
    if(ability.effect==='heal'){
     const before=actor.hp;actor.hp=Math.min(actor.maxHp,actor.hp+(ability.amount||20));emit({kind:'heal',side,theme:card.theme,amount:actor.hp-before,variant,label:ability.name});
     return prefix+' uses '+ability.name+' and restores '+(actor.hp-before)+' HP'+(special?' — Special!':'')+'.';
    }
    if(ability.effect==='gain_speed'){
     actor.speedDelta+=ability.amount||20;emit({kind:'speed',side,theme:card.theme,amount:ability.amount||20,variant,label:ability.name});
     return prefix+' uses '+ability.name+' and gains '+(ability.amount||20)+' Speed this round'+(special?' — Special!':'')+'.';
    }
    if(ability.effect==='reduce_speed'){
     target.speedDelta-=ability.amount||20;emit({kind:'debuff',side,theme:card.theme,amount:ability.amount||20,variant,label:ability.name});
     return prefix+' uses '+ability.name+' and cuts '+foe.name+' Speed by '+(ability.amount||20)+(special?' — Special!':'')+'.';
    }
   }
  }

  actor.energy=Math.min(3,actor.energy+1);const raw=strikeDamage(card,foe);const amount=Math.max(1,Math.round(raw*(side==='rival'?(dungeon?.damageMultiplier||1):1)));const result=receive(enemy,enemyActive,amount);
  emit({kind:'attack',side,theme:card.theme,amount:result.damage,blocked:result.absorbed,variant:'strike',label:'Quick Strike',knockout:target.hp<=0});
  const mult=affinityMultiplier(card.theme,foe);
  const note=mult>1?' Super effective!':mult<1?' Resisted.':'';
  return prefix+' uses Quick Strike for '+result.damage+' damage'+(result.absorbed?' ('+result.absorbed+' blocked)':'')+'.'+note;
 }

 function rivalChoice(team:Fighter[],active:number){
  const member=team[active];if(!member)return 'strike' as ActionKind;
  const card=cardById(member.id);
  const profile=battleAbilityProfile(card.rarity);

  if(profile==='uncommon'){
   if(member.defenseCooldown===0&&member.energy>=1&&member.guard<16&&member.hp<member.maxHp*.72)return 'guard';
   return 'strike';
  }

  if(profile==='high'){
   if(member.defenseCooldown===0&&member.energy>=1&&member.guard<20&&member.hp<member.maxHp*.6)return 'guard';
   if(member.specialCooldown===0&&member.energy>=3)return 'special';
   if(member.cooldown===0&&member.energy>=1)return 'power';
   return 'strike';
  }

  const special=card.abilitySecondary;
  if(member.specialCooldown===0){
   if(member.energy>=Math.max(1,special.energyCost||3)){
    if(special.effect==='heal'&&member.hp>=member.maxHp*.9)return member.cooldown===0?'ability':'strike';
    if(special.effect==='gain_guard'&&member.guard>=30)return member.cooldown===0?'ability':'strike';
    return 'special';
   }
   if(member.energy===2&&member.hp>card.health*.5)return 'strike';
  }
  if(member.cooldown>0||member.energy<Math.max(1,card.abilityPrimary.energyCost||1))return 'strike';
  if(card.abilityPrimary.effect==='heal'&&member.hp>=member.maxHp*.78)return 'strike';
  if(card.abilityPrimary.effect==='gain_guard'&&member.guard>=12)return 'strike';
  return 'ability';
 }

 function act(kind:ActionKind){
  if(phase!=='battle'||playing.current)return;
  if(soundOn)unlockBattleAudio();
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
  if(won)notes.push(dungeon?((dungeon.boss||dungeon.worldBoss)?(dungeon.boss?'The Runeheart shatters. The final Epic bosses are defeated!':'World boss defeated. The next Rune path opens!'):'Floor '+dungeon.floor+' cleared. Rune Energy spills from the seal!'):'The Great Nest is safe. Your team wins the practice match!');
  if(lost)notes.push('Your team needs a rest. Try a different trio or order.');
  playback(frames,()=>{
  setPlayer(p);setRival(e);setPlayerActive(pIndex);setRivalActive(eIndex);setRound(value=>value+1);
  setLog(current=>[...notes,...current].slice(0,8));
  if(won||lost){setPhase('finished');stopBattleMusic(.9);trackBeta('battle-view',dungeon?(won?'dungeon-clear:'+dungeon.floor:'dungeon-loss:'+dungeon.floor):(won?'finish:win':'finish:loss'));if(won&&dungeon&&!victoryReported.current){victoryReported.current=true;dungeon.onVictory()}}
  });
 }

 function swap(index:number){
  if(phase!=='battle'||playing.current||index===playerActive||player[index]?.hp<=0)return;
  if(soundOn)unlockBattleAudio();
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
   <div><span className="eyebrow">{dungeon?`RUNE DUNGEON · FLOOR ${dungeon.floor}${(dungeon.boss||dungeon.worldBoss)?' · BOSS':''}`:'NEST BATTLES · PLAYABLE ALPHA'}</span><h1>{dungeon?dungeon.name:'Pick your flock. Protect the Great Nest.'}</h1><p>{dungeon?dungeon.mission:'Choose any three battle-ready Guardians. Every illustrated card and every successful Card Studio upload can join your team.'}</p><div className="battle-pill-row"><span>{battlePoolIds.length} battle-ready Guardians</span><span>{dungeon?`+${dungeon.energy} Rune Energy`:'No paid advantage'}</span><span>{dungeon?`Rival HP ×${dungeon.hpMultiplier.toFixed(2)}`:'Uploaded cards can battle'}</span><span>{(dungeon?.boss||dungeon?.worldBoss)?'Boss encounter':'2–5 minute battle'}</span></div></div>
   <div className={`battle-orb ${dungeon?.boss?'boss-orb':''}`} aria-hidden="true"><Sparkles/><strong>{dungeon?dungeon.floor:3}</strong><span>{(dungeon?.boss||dungeon?.worldBoss)?'BOSS':dungeon?'Floor':'Choose three'}</span></div>
  </div>
  <div className="battle-picker-head"><div><span className="eyebrow">{dungeon?'DUNGEON LOADOUT':'BATTLE ROSTER'}</span><h2>{dungeon?'Choose any three battle-ready Guardians for this floor.':'Your uploaded roster. Three slots. Your strategy.'}</h2></div><strong>{selected.length} / 3 selected · {battlePoolIds.length} available</strong></div>
  <div className="battle-picker-grid">{pool.map(card=>{const picked=selected.includes(card.id);const guide=CLASS_GUIDE[card.battleClass];return <button key={card.id} className={'battle-picker '+(picked?'selected':'')} onClick={()=>toggle(card.id)} aria-pressed={picked}>
   <div className="battle-picker-art"><GuardianCard id={card.id}/><span className="battle-check">{picked?'✓':'+'}</span></div>
   <div className="battle-picker-copy"><span style={{color:themeColors[card.theme]}}>{card.theme} · {card.battleClass}</span><h3>{card.name}</h3><p>{guide?.purpose}</p><small>HP {card.health} · ATK {card.attack} · DEF {card.defense} · SPD {card.speed}</small></div>
  </button>})}</div>
  <div className="battle-launch"><div><Shield/><strong>{dungeon?`${(dungeon.boss||dungeon.worldBoss)?'Boss':'Floor'} ${dungeon.floor} mission`:'Kid-friendly surface, grown-up decisions.'}</strong><p>{dungeon?`${dungeon.rewardsEnabled?'First clear awards':'Sign in to bank'} ${dungeon.energy} Rune Energy. Replays do not award additional Energy.`:'Big readable moves and bright feedback on top; affinity, timing, class roles, Guard, Energy and cooldowns underneath.'}</p></div><button className="gold" disabled={selected.length!==3} onClick={start}>{dungeon?`Enter Floor ${dungeon.floor}`:'Start practice match'} <ArrowRight size={17}/></button>{dungeon&&<button className="outline" onClick={dungeon.onExit}>Back to dungeon map</button>}</div>
  {!dungeon&&<div className="battle-roadmap"><article><span>01</span><h3>Practice Arena</h3><p>Local battles and rule testing with no rewards or spending.</p></article><article><span>02</span><h3>Rune Dungeon</h3><p>Ten PvE floors, missions, Rune Energy and a boss at the Runeheart.</p></article><article><span>03</span><h3>Nest League</h3><p>Ranked play after balance, account safety and anti-cheat validation.</p></article><article><span>04</span><h3>Flocks</h3><p>Cooperative groups and shared bosses without open child chat at launch.</p></article></div>}
  <p className="disclaimer">Alpha rules: {NEST_BATTLE_RULES_VERSION}. {dungeon?'Rune Energy is a free beta gameplay reward with no cash value. First-clear rewards only.':'Battle results do not change ownership, rarity, collection value, pack odds or commercial eligibility.'}</p>
 </section>;

 const active=player[playerActive];const enemy=rival[rivalActive];const activeCard=active?cardById(active.id):pool[0];const enemyCard=enemy?cardById(enemy.id):pool[1];
 const motion=(side:'you'|'rival')=>!fx?undefined:fx.kind==='swap'&&fx.side===side?(swapEntering?'in':'out'):fx.kind==='attack'?(fx.side===side?(fx.variant==='special'?'special':fx.variant==='ability'?'cast':'attack'):(fx.knockout?'ko':'hit')):fx.side===side?(fx.variant==='special'?'special':'cast'):undefined;
 const abilityReady=!!active&&active.cooldown===0&&active.energy>=Math.max(1,activeCard.abilityPrimary.energyCost||1);
 const specialReady=!!active&&active.specialCooldown===0&&active.energy>=Math.max(1,activeCard.abilitySecondary.energyCost||3);
 const matchup=affinityMultiplier(activeCard.theme,enemyCard)>1?'Advantage':affinityMultiplier(activeCard.theme,enemyCard)<1?'Resisted':'Neutral';
 const currentMasterFor=(id:string)=>uploadedArt[id]||(commonMasterArt as Record<string,string>)[id]||'';
 const avatarFor=(id:string)=>{const card=cardById(id);const showcase=showcaseFor(id);return currentMasterFor(id)||showcase?.avatarUrl||showcase?.artworkUrl||card.artworkUrl||card.fullCardUrl||card.avatarUrl||card.thumbnailUrl||'/art/nestrune-card-back.svg'};
 const cardArtFor=(id:string)=>{const card=cardById(id);const showcase=showcaseFor(id);return currentMasterFor(id)||showcase?.artworkUrl||showcase?.avatarUrl||card.fullCardUrl||card.artworkUrl||card.avatarUrl||card.thumbnailUrl||'/art/nestrune-card-back.svg'};
 return <section className="nest-battles battle-live">
  <div className="battle-compact-hud">
   <div><span className="eyebrow">{dungeon?`RUNE DUNGEON · FLOOR ${dungeon.floor}${(dungeon.boss||dungeon.worldBoss)?' · BOSS':''}`:'GARDEN ARENA'} · ROUND {round}</span><strong>{phase==='finished'?(dungeon?'Floor complete':'Practice complete'):'Your turn'}</strong></div>
   <div className="battle-hud-matchup"><span>{activeCard.theme}</span><b>VS</b><span>{enemyCard.theme}</span><small>{matchup}</small></div>
   <div className="battle-hud-actions"><button className="outline battle-sound-toggle" onClick={()=>{const next=!soundOn;setSoundOn(next);if(next){unlockBattleAudio();if(phase==='battle')startBattleMusic(true,dungeon?.musicKey||'emberstorm')}else stopBattleMusic(.18)}} aria-label={soundOn?'Mute battle music and sounds':'Enable battle music and sounds'}>{soundOn?<Volume2 size={15}/>:<VolumeX size={15}/>}<span>{soundOn?'Music + SFX':'Muted'}</span></button><button className="outline" onClick={dungeon?dungeon.onExit:reset}><RotateCcw size={15}/>{dungeon?'Dungeon map':'New team'}</button></div>
  </div>

  <div ref={stageRef} className={`battle-stage battle-stage-v4 ${battleStyles.arena}`} data-impact={fx?.kind==='attack'} data-fx={fx?.kind||'idle'}>
   <ArenaEnvironment world={dungeon?.world||'verdant'}/>
   <AmbientParticles world={dungeon?.world||'verdant'}/>
   <BattleFxLayer key={fx?.id??0} effect={fx} stageRef={stageRef}/>

   <div className="battle-combatant battle-combatant-player">
    <div className="battle-side-label">YOUR GUARDIAN</div>
    <div className="battle-avatar-fighter">
     <div className={`battle-guardian-actor ${battleStyles.fighter}`} data-battle-side="you" data-motion={motion('you')} data-guard={!!active?.guard} style={{'--aura':themeColors[activeCard.theme]} as CSSProperties}>
      <span className="battle-card-echo battle-card-echo-player" aria-hidden="true"><Image src={cardArtFor(activeCard.id)} alt="" fill sizes="150px" quality={72}/></span>
      <button className="battle-guardian-avatar" data-battle-anchor type="button" onClick={()=>setInspectCard(activeCard.id)} aria-label={`Inspect ${activeCard.name} card`}>
       <span className="battle-avatar-aura"/>
       <Image src={avatarFor(activeCard.id)} alt={`${activeCard.name} battle avatar`} fill sizes="(max-width: 700px) 34vw, 235px" quality={88}/>
       <span className="battle-avatar-inspect">View card</span>
      </button>
     </div>
     <div className="battle-status battle-status-v4">
      <div className="battle-status-title"><strong>{activeCard.name}</strong><span style={{color:themeColors[activeCard.theme]}}>{activeCard.theme} · {activeCard.battleClass}</span></div>
      <div className="hp-track"><i style={{width:Math.max(0,(active?.hp||0)/(active?.maxHp||activeCard.health)*100)+'%'}}/></div>
      <div className="battle-stat-line"><span>{active?.hp||0}/{active?.maxHp||activeCard.health} HP</span><span>{active?.guard||0} Guard</span><span>{active?.energy||0} Energy</span><span>SPD {activeCard.speed+(active?.speedDelta||0)}</span></div>
     </div>
    </div>
    <div className="battle-reserves" aria-label="Your Guardian team">{player.map((fighter,index)=>{const card=cardById(fighter.id);return <button key={fighter.id} disabled={busy||phase!=='battle'||fighter.hp<=0||index===playerActive} onClick={()=>swap(index)} className={'battle-reserve '+(index===playerActive?'active':'')+(fighter.hp<=0?' down':'')} title={index===playerActive?card.name+' is active':'Swap to '+card.name}><Image src={avatarFor(fighter.id)} alt="" width={38} height={38} quality={78}/><span>{index===playerActive?'Active':fighter.hp>0?fighter.hp+' HP':'Resting'}</span></button>})}</div>
   </div>

   <div className="battle-center battle-center-v4"><span>{dungeon?dungeon.worldName.toUpperCase():'THE GREAT NEST'}</span><GreatNest/><strong>VS</strong><small>{activeCard.theme} → {enemyCard.theme}</small></div>

   <div className="battle-combatant battle-combatant-rival">
    <div className="battle-side-label">RIVAL GUARDIAN</div>
    <div className="battle-avatar-fighter rival-fighter">
     <div className={`battle-guardian-actor ${battleStyles.fighter}`} data-battle-side="rival" data-motion={motion('rival')} data-guard={!!enemy?.guard} style={{'--aura':themeColors[enemyCard.theme]} as CSSProperties}>
      <span className="battle-card-echo battle-card-echo-rival" aria-hidden="true"><Image src={cardArtFor(enemyCard.id)} alt="" fill sizes="150px" quality={72}/></span>
      <button className="battle-guardian-avatar rival-avatar" data-battle-anchor type="button" onClick={()=>setInspectCard(enemyCard.id)} aria-label={`Inspect ${enemyCard.name} card`}>
       <span className="battle-avatar-aura"/>
       <Image src={avatarFor(enemyCard.id)} alt={`${enemyCard.name} battle avatar`} fill sizes="(max-width: 700px) 34vw, 235px" quality={88}/>
       <span className="battle-avatar-inspect">View card</span>
      </button>
     </div>
     <div className="battle-status battle-status-v4">
      <div className="battle-status-title"><strong>{enemyCard.name}</strong><span>{enemyCard.theme} · {enemyCard.battleClass}</span></div>
      <div className="hp-track"><i style={{width:Math.max(0,(enemy?.hp||0)/(enemy?.maxHp||enemyCard.health)*100)+'%'}}/></div>
      <div className="battle-stat-line"><span>{enemy?.hp||0}/{enemy?.maxHp||enemyCard.health} HP</span><span>{enemy?.guard||0} Guard</span><span>{enemy?.energy||0} Energy</span><span>SPD {enemyCard.speed+(enemy?.speedDelta||0)}</span></div>
     </div>
    </div>
    <div className="battle-reserves battle-reserves-rival" aria-label="Rival Guardian team">{rival.map((fighter,index)=>{const card=cardById(fighter.id);return <div key={fighter.id} className={'battle-reserve '+(index===rivalActive?'active':'')+(fighter.hp<=0?' down':'')} title={card.name}><Image src={avatarFor(fighter.id)} alt="" width={38} height={38} quality={78}/><span>{index===rivalActive?'Active':fighter.hp>0?fighter.hp+' HP':'Resting'}</span></div>})}</div>
   </div>
   <div className="battle-action-dock battle-action-dock-overlay">
    <div className={`${battleStyles.controls} battle-controls-v4`}><p role="status">{busy?'Guardians in motion…':'Attack now · no scrolling needed.'}</p>{busy&&<button className="outline" onClick={()=>finishPlayback.current?.()}>Skip effects</button>}</div>
    <div className="battle-command-deck battle-command-deck-v4">
     <button className="battle-command strike" disabled={busy||phase!=='battle'} onClick={()=>act('strike')}><Swords/><span><strong>Quick Strike</strong><small>Lunge attack · restores 1 Energy</small></span></button>
     <button className="battle-command ability" disabled={busy||phase!=='battle'||!abilityReady} onClick={()=>act('ability')}><Zap/><span><strong>{activeCard.abilityPrimary.name}</strong><small>{abilityReady?(activeCard.abilityPrimary.energyCost||1)+' Energy · '+activeCard.abilityPrimary.effect.replaceAll('_',' '):active?.cooldown?'Cooldown '+active.cooldown+' round'+(active.cooldown===1?'':'s'):'Needs '+(activeCard.abilityPrimary.energyCost||1)+' Energy'}</small></span></button>
     <button className="battle-command special" disabled={busy||phase!=='battle'||!specialReady} onClick={()=>act('special')}><Sparkles/><span><strong>{activeCard.abilitySecondary.name}</strong><small>{specialReady?'SPECIAL · 3 Energy · 4-turn cooldown':active?.specialCooldown?'Special cooldown '+active.specialCooldown+' round'+(active.specialCooldown===1?'':'s'):'Needs 3 Energy'}</small></span></button>
    </div>
   </div>
  </div>

  <details className="battle-log battle-log-compact"><summary><span>Battle Story</span><strong>{log[0]}</strong></summary><div>{log.map((entry,index)=><p key={index} className={index===0?'latest':''}>{entry}</p>)}</div></details>

  {phase==='finished'&&<div className={`battle-finish ${(dungeon?.boss||dungeon?.worldBoss)&&isTeamDown(rival)?'dungeon-boss-clear':''}`}><Sparkles/><div><h2>{isTeamDown(rival)?(dungeon?((dungeon.boss||dungeon.worldBoss)?(dungeon.boss?'Runeheart Epic Bosses defeated!':'World Boss defeated!'):`Floor ${dungeon.floor} cleared!`):'Your Nest held strong!'):'A new strategy is waiting.'}</h2><p>{isTeamDown(rival)&&dungeon?(dungeon.rewardsEnabled?`First-clear reward: +${dungeon.energy} Rune Energy.`:`Sign in to save this clear and bank ${dungeon.energy} Rune Energy.`):'Try another combination. Your battle-ready Guardians can play very differently depending on class and matchup.'}</p></div><button className="gold" onClick={dungeon?dungeon.onExit:reset}>{dungeon?(isTeamDown(rival)?'Return to Rune Dungeon':'Return to dungeon map'):'Build another team'}</button>{dungeon&&!isTeamDown(rival)&&<button className="outline" onClick={reset}>Retry floor</button>}</div>}

  {inspectCard&&<div className="battle-card-modal" role="dialog" aria-modal="true" aria-label="Guardian card inspection" onClick={()=>setInspectCard(null)}><div className="battle-card-modal-panel" onClick={event=>event.stopPropagation()}><button className="battle-modal-close" onClick={()=>setInspectCard(null)} aria-label="Close card inspection">×</button><GuardianCard id={inspectCard} eager/><p>Collectible card view · Special: <strong>{cardById(inspectCard).abilitySecondary.name}</strong> · 3 Energy · 4-turn cooldown.</p></div></div>}

  <p className="disclaimer battle-live-disclaimer">{dungeon?'Rune Dungeon beta: first-clear Rune Energy is account-bound, has no cash value, cannot be purchased, and only redeems free beta pack entitlements while preview rewards are enabled.':'Practice alpha only. No matchmaking, trading, rewards, paid boosts or persistent battle rank are active. Stats and rules remain subject to playtesting.'}</p>
 </section>;
}
