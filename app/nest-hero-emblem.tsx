export default function NestHeroEmblem({value,label,subtle=false}:{value:string|number;label:string;subtle?:boolean}){
 return <div className={'nest-hero-emblem nest-hero-illustrated'+(subtle?' subtle':'')} aria-label={label+' '+value}>
  <img className="nest-hero-illustration" src="/art/dungeon-three-egg-nest.svg" alt="" aria-hidden="true" width="320" height="320"/>
  <div className="nest-hero-copy"><strong>{value}</strong><span>{label}</span></div>
 </div>;
}
