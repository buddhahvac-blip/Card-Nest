import {Sparkles} from 'lucide-react';

export default function NestHeroEmblem({value,label,subtle=false}:{value:string|number;label:string;subtle?:boolean}){
 return <div className={'nest-hero-emblem'+(subtle?' subtle':'')} aria-label={label+' '+value}>
  <div className="nest-hero-glow" aria-hidden="true"/>
  <div className="nest-hero-halo" aria-hidden="true"/>
  <div className="nest-hero-eggs" aria-hidden="true"><i/><i/><i/></div>
  <div className="nest-hero-bowl" aria-hidden="true"><i/><i/><i/><i/><i/></div>
  <div className="nest-hero-copy"><Sparkles/><strong>{value}</strong><span>{label}</span></div>
 </div>
}
