import type {CSSProperties} from 'react';
import styles from './theme-combat-fx.module.css';

type Point={x:number;y:number};
export type FxTheme='Volt'|'Ember'|'Tide'|'Bloom'|'Mystic'|'Shadow';
export const themeInk:Record<FxTheme,string>={Volt:'#b6f3ff',Ember:'#ff9349',Tide:'#63dce9',Bloom:'#9fe57c',Mystic:'#dec2ff',Shadow:'#aa7de0'};
export function fxTheme(theme:string):FxTheme{return Object.hasOwn(themeInk,theme)?theme as FxTheme:'Mystic'}

// Silhouettes, not recolored symbols. Shared by attacks, restoration and barriers.
export function ThemeMark({theme}:{theme:FxTheme}){
 return <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
  {theme==='Volt'&&<><path d="M59 4 25 49 48 45 34 95 79 38 54 43Z" fill="currentColor"/><path d="m20 16-9 22 13-3-8 25M83 54l8 15-12 3 6 18"/></>}
  {theme==='Ember'&&<><path d="M50 5C67 29 42 33 72 48L78 30C103 72 74 96 49 95 15 94 9 69 26 44L29 63C42 45 27 29 50 5Z" fill="currentColor" stroke="none"/><path d="M51 48C65 66 61 71 68 76 64 97 33 96 35 75Z" fill="#fff2bd" stroke="none"/></>}
  {theme==='Tide'&&<><path d="M8 69C20 72 20 28 54 23 84 17 94 51 69 54 79 29 49 34 51 54 56 75 80 69 93 61 85 88 32 94 8 69Z" fill="currentColor" fillOpacity=".32"/><path d="M9 80Q40 103 91 77M17 60Q29 12 64 22M40 67Q61 81 87 64"/></>}
  {theme==='Bloom'&&<><path d="M50 94Q32 66 54 41T54 6M46 72Q10 74 12 40Q40 40 46 72ZM50 52Q83 53 91 20Q58 18 50 52Z" fill="currentColor" fillOpacity=".3"/><path d="m24 52 19 18m20-29 15-11M50 93l-15-3m13-8 16 5"/></>}
  {theme==='Mystic'&&<><circle cx="50" cy="50" r="43"/><circle cx="50" cy="50" r="34" strokeDasharray="3 9"/><path d="m50 17 29 50H21Zm0 66L21 33h58Z"/><path d="m50 39 9 11-9 11-9-11Z" fill="currentColor"/></>}
  {theme==='Shadow'&&<><ellipse cx="50" cy="50" rx="30" ry="44" fill="#0b051c" strokeWidth="6"/><path d="M36 13Q86 35 33 84M50 11Q99 36 47 87M64 17Q108 41 63 83" strokeWidth="5"/><path d="m14 30 7 12-10 13m73 6 8 8-9 13"/></>}
 </svg>;
}

export function ThemeAttack({from,to,theme,variant='ability'}:{from:Point;to:Point;theme:string;variant?:'strike'|'ability'|'special'}){
 const identity=fxTheme(theme),dx=to.x-from.x,dy=to.y-from.y;
 const count=variant==='special'?12:variant==='strike'?4:8;
 const geometry={left:from.x,top:from.y,'--dx':`${dx}px`,'--dy':`${dy}px`,'--heading':`${Math.atan2(dy,dx)*180/Math.PI}deg`} as CSSProperties;
 return <div className={styles.attack} data-theme={identity} data-variant={variant}>
  <div className={styles.charge} style={{left:from.x,top:from.y}}><ThemeMark theme={identity}/></div>
  <svg className={styles.route} width="100%" height="100%" aria-hidden="true">
   {identity==='Volt'?Array.from({length:variant==='strike'?1:3},(_,i)=><path key={i} d={`M${from.x} ${from.y} L${from.x+dx*.23} ${from.y+dy*.23-14-i*8} l-12 ${22+i*9} L${from.x+dx*.62} ${from.y+dy*.62-18-i*9} l-5 22 L${to.x} ${to.y}`} strokeWidth={i===0?4:1.5}/>):identity==='Bloom'?<path d={`M${from.x} ${from.y} C${from.x+dx*.3} ${from.y-65},${to.x-dx*.3} ${to.y+65},${to.x} ${to.y}`} strokeWidth="5"/>:identity==='Tide'?<><path d={`M${from.x} ${from.y} Q${from.x+dx*.5} ${from.y+dy*.5-38} ${to.x} ${to.y}`} strokeWidth="12" opacity=".35"/><path d={`M${from.x} ${from.y} Q${from.x+dx*.5} ${from.y+dy*.5+24} ${to.x} ${to.y}`} strokeWidth="3"/></>:identity==='Mystic'?<path d={`M${from.x} ${from.y} L${to.x} ${to.y}`} strokeWidth="6"/>:null}
  </svg>
  <div className={styles.missile} style={geometry}><ThemeMark theme={identity}/></div>
  <div className={styles.burst} style={{left:to.x,top:to.y}}><ThemeMark theme={identity}/><i className={styles.shockwave}/>{Array.from({length:count},(_,i)=><i className={styles.fragment} key={i} style={{'--angle':`${i*360/count}deg`,'--distance':`${42+i%3*13}px`} as CSSProperties}/>)}</div>
  {(identity==='Ember'||identity==='Shadow')&&<div className={styles.smoke} style={{left:to.x,top:to.y}}><i/><i/><i/></div>}
 </div>;
}

export function ThemeSupport({theme,kind}:{theme:string;kind:'heal'|'shield'|'speed'|'debuff'}){
 return <div className={styles.support} data-theme={fxTheme(theme)} data-kind={kind}>
  <div className={styles.barrier}/><ThemeMark theme={fxTheme(theme)}/>
  {Array.from({length:6},(_,i)=><i key={i} style={{'--angle':`${i*60}deg`,'--lift':`${i*9}px`} as CSSProperties}/>)}
  {kind==='heal'&&<b>+</b>}{kind==='speed'&&<b>↑</b>}{kind==='debuff'&&<b>↓</b>}
 </div>;
}
