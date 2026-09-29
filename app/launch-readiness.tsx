'use client';
import plan from '@/data/launch-readiness.json';

type Runtime={
 supportConfigured?:boolean;
 publicSignupsEnabled?:boolean;
 paymentsEnabled?:boolean;
 betaStats?:{accounts?:number;openers?:number;openings?:number};
};

const tone:Record<string,string>={
 'BLOCKER':'#ffaf93',
 'HIGH':'#edc781'
};

export default function LaunchReadiness({runtime}:{runtime?:Runtime}){
 const status=(id:string,base:string)=>{
  if(id==='trust-support')return runtime?.supportConfigured?'CONFIGURED':'NEEDS CONFIGURATION';
  if(id==='public-beta')return runtime?.paymentsEnabled?'REVIEW PAYMENT FLAG':'ACTIVE';
  return base;
 };
 return <section style={{marginTop:30}}>
  <div className="section-head"><div><div className="eyebrow">PUBLIC BETA · FOUNDER LAUNCH BOARD</div><h2>Ten things that must stay visible.</h2><p>These are operating gates, not marketing claims. A public beta can continue while commercial blockers stay closed.</p></div><span className="tag">SALES GATE · CLOSED</span></div>
  <div className="agent-list">{plan.points.map(p=><article className="panel" key={p.id}>
   <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><span className="tag">#{p.number} · {p.priority}</span><strong style={{color:tone[p.priority]||'#b6e8ac',fontSize:12}}>{status(p.id,p.status)}</strong></div>
   <h3>{p.title}</h3><p>{p.why}</p><p className="disclaimer"><strong>Next:</strong> {p.next}</p>
  </article>)}</div>
  <div className="stats" style={{marginTop:24}}>
   <div className="stat"><span className="muted">Public mode</span><strong>Beta</strong><span className="status">Browsing live</span></div>
   <div className="stat"><span className="muted">Real payments</span><strong>{runtime?.paymentsEnabled?'Review':'Off'}</strong><span className="muted">Must remain gated</span></div>
   <div className="stat"><span className="muted">Support</span><strong>{runtime?.supportConfigured?'Configured':'Needed'}</strong><span className="muted">Required before commerce</span></div>
   <div className="stat"><span className="muted">Beta accounts</span><strong>{runtime?.betaStats?.accounts??'—'}</strong><span className="muted">Target: 50–100 real collectors</span></div>
  </div>
 </section>
}
