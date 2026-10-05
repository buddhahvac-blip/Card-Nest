import {Brain,Gamepad2,ShieldCheck,Sparkles} from 'lucide-react';

const phases=[
 {name:'Alpha · Practice Arena',status:'ACTIVE PROTOTYPE',text:'Validate fun, clarity, class identity, affinity and match length with Common cards before adding progression.'},
 {name:'Beta · Garden Adventure',status:'NEXT',text:'Add PvE chapters, habitat encounters, bosses, beginner missions and tutorial rewards that do not create paid power.'},
 {name:'League · Ranked Battles',status:'GATED',text:'Only after server-authoritative matches, anti-cheat, matchmaking, moderation and balance telemetry pass review.'},
 {name:'Flocks · Cooperative Play',status:'GATED',text:'Team goals and shared bosses. No open child chat at launch; social tools require a separate family-safety review.'},
];

export default function BattleOperations(){
 return <section className="battle-ops">
  <div className="section-head"><div><span className="eyebrow">NEST MIND · GAME OPERATIONS</span><h2>Grow play carefully, not just quickly.</h2><p>Nest Battles is now an operating pillar beside collecting, art and commerce.</p></div><Gamepad2/></div>
  <div className="battle-ops-grid">{phases.map((phase,index)=><article className="panel" key={phase.name}><span className="tag">{String(index+1).padStart(2,'0')} · {phase.status}</span><h3>{phase.name}</h3><p>{phase.text}</p></article>)}</div>
  <div className="battle-ops-guardrails"><ShieldCheck/><div><strong>Permanent design guardrails</strong><p>Rarity does not raise the base stat budget. Paid products cannot sell battle power. Kid-facing UI stays readable and low-pressure; strategic depth comes from team construction, matchup knowledge, timing and sequencing.</p></div></div>
  <div className="battle-ops-signals"><Brain/><span>Measure: match completion, rematch rate, class pick diversity, surrender rate, average rounds, ability usage and matchup win rates.</span><Sparkles/><span>Review manually before changing stats or monetization.</span></div>
 </section>;
}
