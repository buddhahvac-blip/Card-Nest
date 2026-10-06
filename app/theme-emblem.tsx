import {Flame,Droplets,Leaf,Zap,Sparkles,Moon} from 'lucide-react';

const themeStyles:Record<string,{fg:string;bg:string;border:string;Icon:any}>={
 Ember:{fg:'#ffb35c',bg:'rgba(255,116,38,.13)',border:'rgba(255,166,89,.45)',Icon:Flame},
 Tide:{fg:'#78d8ff',bg:'rgba(45,164,220,.13)',border:'rgba(120,216,255,.42)',Icon:Droplets},
 Bloom:{fg:'#91e08f',bg:'rgba(72,170,83,.13)',border:'rgba(145,224,143,.42)',Icon:Leaf},
 Volt:{fg:'#ffe36f',bg:'rgba(228,191,37,.13)',border:'rgba(255,227,111,.46)',Icon:Zap},
 Mystic:{fg:'#d9adff',bg:'rgba(151,91,211,.13)',border:'rgba(217,173,255,.44)',Icon:Sparkles},
 Shadow:{fg:'#b9b5df',bg:'rgba(85,78,126,.18)',border:'rgba(185,181,223,.38)',Icon:Moon},
};

export default function ThemeEmblem({theme,size=28,label=true}:{theme:string;size?:number;label?:boolean}){
 const style=themeStyles[theme]||themeStyles.Mystic;
 const Icon=style.Icon;
 return <span
  title={theme+' Theme'}
  aria-label={theme+' Theme'}
  style={{
   display:'inline-flex',
   alignItems:'center',
   gap:7,
   flexShrink:0,
   color:style.fg,
   fontSize:12,
   fontWeight:800,
   letterSpacing:'.06em',
   textTransform:'uppercase',
  }}
 >
  <span aria-hidden="true" style={{
   width:size,
   height:size,
   display:'inline-grid',
   placeItems:'center',
   borderRadius:'50%',
   background:style.bg,
   border:'1px solid '+style.border,
   boxShadow:'0 0 14px '+style.bg,
  }}>
   <Icon size={Math.max(14,Math.round(size*.56))} strokeWidth={2.2}/>
  </span>
  {label?<span>{theme}</span>:null}
 </span>;
}
