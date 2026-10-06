'use client';

import {useLayoutEffect,useState,type CSSProperties,type RefObject} from 'react';
import styles from './battle-fx.module.css';

export type BattleSide='you'|'rival';
export type BattleEffect={kind:'attack'|'heal'|'shield'|'speed'|'debuff'|'swap';side:BattleSide;theme:string;amount?:number;blocked?:number;variant?:'strike'|'ability';label?:string};
type Point={x:number;y:number};
const palettes:Record<string,string>={Bloom:'#98ed99',Ember:'#ffab66',Tide:'#76dfff',Volt:'#ffe887',Mystic:'#d9bdff',Shadow:'#c68eff'};
const motifs:Record<string,string>={Bloom:'❧',Ember:'◆',Tide:'◜',Volt:'ϟ',Mystic:'✧',Shadow:'⋰'};

export function ArenaEnvironment(){return <div className={styles.world} aria-hidden="true"><div className={styles.worldArt}/><div className={styles.worldGlow}/><div className={styles.lightShafts}><i/><i/><i/></div><div className={styles.foregroundLeaves}>{Array.from({length:12},(_,i)=><i key={i} style={{'--leaf-x':`${(i*29+5)%100}%`,'--leaf-delay':`-${i*.45}s`} as CSSProperties}}/>)}</div></div>}

export function AmbientParticles(){return <div className={styles.ambient} aria-hidden="true"><div className={styles.mist}/><div className={styles.mistBack}/><div className={styles.gardenRings}/>{Array.from({length:22},(_,i)=><i key={i} style={{left:`${(i*37+7)%100}%`,top:`${(i*23+11)%100}%`,animationDelay:`-${i*.7}s`,animationDuration:`${8+i%5}s`}}/>)}</div>}
export function GreatNest(){return <div className={styles.emblem} aria-hidden="true"><span>✧</span><i/><b/></div>}

export function AttackEffect({from,to,theme,variant='ability'}:{from:Point;to:Point;theme:string;variant?:'strike'|'ability'}){
 const dx=to.x-from.x,dy=to.y-from.y;
 if(variant==='strike')return <><svg className={styles.path} width="100%" height="100%"><path className={styles.strikeTrail} d={`M${from.x},${from.y} Q${from.x+dx*.55},${from.y+dy*.2} ${to.x},${to.y}`} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg><div className={styles.slashImpact} style={{left:to.x,top:to.y}}><i/><i/><b>✦</b></div><div className={styles.impact} style={{left:to.x,top:to.y}}>{Array.from({length:8},(_,i)=><i key={i} style={{'--angle':`${i*45}deg`} as CSSProperties}/>)}<b>✧</b></div></>;
 return <><svg className={styles.path} width="100%" height="100%"><path className={styles.trail} d={theme==='Volt'?`M${from.x},${from.y} l${dx*.28+18},${dy*.28} l-32,18 L${to.x},${to.y}`:`M${from.x},${from.y} Q${from.x+dx*.65+35},${from.y+dy*.25} ${to.x},${to.y}`} fill="none" stroke="currentColor" strokeWidth={theme==='Tide'?8:3} strokeLinecap="round"/></svg><div className={`${styles.projectile} ${styles[theme==='Shadow'?'shadowProjectile':theme.toLowerCase()]||''}`} style={{left:from.x,top:from.y,'--dx':`${dx}px`,'--dy':`${dy}px`} as CSSProperties}>{theme==='Shadow'?<svg viewBox="0 0 48 48" width="48" height="48"><path d="M8 4 Q26 24 8 44 M20 4 Q38 24 20 44 M32 4 Q50 24 32 44" fill="none" stroke="currentColor" strokeWidth="3"/></svg>:motifs[theme]||'✧'}</div><div className={styles.projectileSparks} style={{left:from.x,top:from.y,'--dx':`${dx}px`,'--dy':`${dy}px`} as CSSProperties}>{Array.from({length:6},(_,i)=><i key={i} style={{'--spark-angle':`${i*60}deg`,'--spark-gap':`${14+i*2}px`} as CSSProperties}/>)}</div><div className={styles.impact} style={{left:to.x,top:to.y}}>{Array.from({length:8},(_,i)=><i key={i} style={{'--angle':`${i*45}deg`} as CSSProperties}/>)}<b>✧</b></div></>;
}
export function HealEffect(){return <div className={styles.heal}><i/><b>✚</b><span>✧</span></div>}
export function ShieldEffect(){return <div className={styles.shield}><span>◇</span></div>}
export function SwapEffect(){return <div className={styles.summon}><i/><span>✦</span></div>}
export function FloatingCombatText({effect}:{effect:BattleEffect}){
 const label=effect.kind==='attack'?`−${effect.amount} HP`:effect.kind==='heal'?`+${effect.amount} HP`:effect.kind==='shield'?`+${effect.amount} Guard`:effect.kind==='speed'?`+${effect.amount} Speed`:effect.kind==='debuff'?`−${effect.amount} Speed`:'Guardian enters';
 return <div className={styles.combatText} data-impact={effect.kind==='attack'}>{effect.label&&<em>{effect.label}</em>}<strong>{label}</strong>{!!effect.blocked&&<small>{effect.blocked} blocked · Guard</small>}</div>;
}

// Read anchors on layout changes, not every animation frame. No fixed desktop coordinates.
export function BattleFxLayer({effect,stageRef}:{effect:BattleEffect|null;stageRef:RefObject<HTMLDivElement|null>}){
 const [anchors,setAnchors]=useState<Record<BattleSide,Point>>({you:{x:0,y:0},rival:{x:0,y:0}});
 useLayoutEffect(()=>{
  const stage=stageRef.current;if(!stage)return;
  const measure=()=>{const base=stage.getBoundingClientRect();const point=(side:BattleSide)=>{const box=stage.querySelector(`[data-battle-side="${side}"] .guardian-card`)?.getBoundingClientRect();return box?{x:box.left-base.left+box.width/2,y:box.top-base.top+box.height*.45}:{x:0,y:0}};setAnchors({you:point('you'),rival:point('rival')})};
  measure();const observer=new ResizeObserver(measure);observer.observe(stage);for(const node of stage.querySelectorAll('[data-battle-side]'))observer.observe(node);
  return ()=>observer.disconnect();
 },[stageRef]);
 if(!effect)return null;
 const target=effect.kind==='attack'||effect.kind==='debuff'?(effect.side==='you'?'rival':'you'):effect.side;
 const point=anchors[target];
 return <div className={styles.fxLayer} aria-hidden="true" data-kind={effect.kind} data-theme={effect.theme} style={{'--fx-color':effect.kind==='heal'?'#a0ffc5':palettes[effect.theme]||palettes.Mystic} as CSSProperties}>
  {effect.kind==='attack'&&<AttackEffect from={anchors[effect.side]} to={point} theme={effect.theme} variant={effect.variant}/>}
  <div className={styles.target} style={{left:point.x,top:point.y}}>
   {effect.kind==='heal'&&<HealEffect/>}{(effect.kind==='shield'||!!effect.blocked)&&<ShieldEffect/>}{effect.kind==='swap'&&<SwapEffect/>}
   {effect.kind==='speed'&&<div className={styles.wind}><i/><i/><span>❧</span></div>}
   {effect.kind==='debuff'&&<div className={styles.shadow}>✺</div>}
   <FloatingCombatText effect={effect}/>
  </div>
 </div>;
}

export {styles as battleStyles};
