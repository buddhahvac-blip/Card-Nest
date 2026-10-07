'use client';

import {useLayoutEffect,useState,type CSSProperties,type RefObject} from 'react';
import styles from './battle-fx.module.css';
import {ThemeAttack,ThemeSupport,themeInk,fxTheme} from './theme-combat-fx';

export type BattleSide='you'|'rival';
export type BattleEffect={kind:'attack'|'heal'|'shield'|'speed'|'debuff'|'swap';side:BattleSide;theme:string;amount?:number;blocked?:number;variant?:'strike'|'ability'|'special';label?:string;knockout?:boolean};
type Point={x:number;y:number};

export function ArenaEnvironment({world='verdant'}:{world?:'verdant'|'emberstorm'|'eclipse'}){
 return <div className={styles.world} data-world={world} aria-hidden="true">
  <div className={styles.worldArt}/>
  <div className={styles.worldGlow}/>
  <div className={styles.worldLandmark}/>
  <div className={styles.lightShafts}><i/><i/><i/></div>
  <div className={styles.foregroundLeaves}>
   {Array.from({length:12},(_,i)=>{
    const leafStyle={
     '--leaf-x':`${(i*29+5)%100}%`,
     '--leaf-delay':`-${i*.45}s`,
    } as CSSProperties;
    return <i key={i} style={leafStyle}/>;
   })}
  </div>
 </div>;
}

export function AmbientParticles({world='verdant'}:{world?:'verdant'|'emberstorm'|'eclipse'}){return <div className={styles.ambient} data-world={world} aria-hidden="true"><div className={styles.mist}/><div className={styles.mistBack}/><div className={styles.gardenRings}/>{Array.from({length:22},(_,i)=><i key={i} style={{left:`${(i*37+7)%100}%`,top:`${(i*23+11)%100}%`,animationDelay:`-${i*.7}s`,animationDuration:`${8+i%5}s`}}/>)}</div>}
export function GreatNest(){return <div className={styles.emblem} aria-hidden="true"><span>✧</span><i/><b/></div>}

export const AttackEffect=ThemeAttack;

export function BossEntrance({name,theme}:{name:string;theme:string}){
 return <div className={styles.bossEntrance} style={{'--fx-color':themeInk[fxTheme(theme)]} as CSSProperties} aria-hidden="true"><span>RUNE BOSS AWAKENS</span><strong>{name}</strong></div>;
}

export function SwapEffect(){return <div className={styles.summon}><i/><span>✦</span></div>}
export function FloatingCombatText({effect}:{effect:BattleEffect}){
 const label=effect.kind==='attack'?`−${effect.amount} HP`:effect.kind==='heal'?`+${effect.amount} HP`:effect.kind==='shield'?`+${effect.amount} Guard`:effect.kind==='speed'?`+${effect.amount} Speed`:effect.kind==='debuff'?`−${effect.amount} Speed`:'Guardian enters';
 return <div className={styles.combatText} data-impact={effect.kind==='attack'} data-special={effect.variant==='special'}>{effect.label&&<em>{effect.label}</em>}<strong>{label}</strong>{!!effect.blocked&&<small>{effect.blocked} blocked · Guard</small>}</div>;
}

// Read anchors on layout changes, not every animation frame. No fixed desktop coordinates.
export function BattleFxLayer({effect,stageRef}:{effect:BattleEffect|null;stageRef:RefObject<HTMLDivElement|null>}){
 const [anchors,setAnchors]=useState<Record<BattleSide,Point>>({you:{x:0,y:0},rival:{x:0,y:0}});
 useLayoutEffect(()=>{
  const stage=stageRef.current;if(!stage)return;
  const measure=()=>{const base=stage.getBoundingClientRect();const point=(side:BattleSide)=>{const box=stage.querySelector(`[data-battle-side="${side}"] [data-battle-anchor]`)?.getBoundingClientRect();return box?{x:box.left-base.left+box.width/2,y:box.top-base.top+box.height*.45}:{x:0,y:0}};setAnchors({you:point('you'),rival:point('rival')})};
  measure();const observer=new ResizeObserver(measure);observer.observe(stage);for(const node of stage.querySelectorAll('[data-battle-side]'))observer.observe(node);
  return ()=>observer.disconnect();
 },[stageRef]);
 if(!effect)return null;
 const target=effect.kind==='attack'||effect.kind==='debuff'?(effect.side==='you'?'rival':'you'):effect.side;
 const point=anchors[target];
 return <div className={styles.fxLayer} aria-hidden="true" data-kind={effect.kind} data-theme={effect.theme} data-variant={effect.variant||'ability'} style={{'--fx-color':themeInk[fxTheme(effect.theme)]} as CSSProperties}><div className={styles.cinematicVignette}/>{effect.label&&<div className={styles.abilityBanner}><span>{effect.variant==='special'?'SIGNATURE ABILITY':effect.kind==='attack'?'ABILITY ACTIVATED':effect.kind==='shield'?'DEFENSE':'RUNE EFFECT'}</span><strong>{effect.label}</strong></div>}
  {effect.kind==='attack'&&<AttackEffect from={anchors[effect.side]} to={point} theme={effect.theme} variant={effect.variant}/>}
  <div className={styles.target} style={{left:point.x,top:point.y}}>
   {(effect.kind==='heal'||effect.kind==='shield'||effect.kind==='speed'||effect.kind==='debuff')&&<ThemeSupport theme={effect.theme} kind={effect.kind}/>}{effect.kind==='swap'&&<SwapEffect/>}
   <FloatingCombatText effect={effect}/>
  </div>
 </div>;
}

export {styles as battleStyles};
