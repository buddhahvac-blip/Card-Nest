'use client';
import {useEffect,useState} from 'react';
import {Activity,Eye,Layers,Sparkles} from 'lucide-react';
import {seasonManifest} from '@/lib/season-manifest';

type Data={
 enabled:boolean;
 setup?:string;
 funnel?:{sessions:number;seasonSessions:number;cardSessions:number;packSessions:number;discoverSessions:number;battleSessions:number;nestSessions:number;supportSessions:number;cardViews:number;packPreviews:number};
 rates?:{season:number;card:number;pack:number};
 topCards?:{dimension:string;count:number}[];
 topThemes?:{dimension:string;count:number}[];
 packMix?:{dimension:string;count:number}[];
 affiliateClicks?:{slug:string;count:number}[];
 insights?:string[];
};

function Bar({label,value,max}:{label:string;value:number;max:number}){const width=max?Math.max(3,Math.round(value/max*100)):0;return <div className="mind-bar"><div><span>{label}</span><strong>{value}</strong></div><i><b style={{width:width+'%'}}/></i></div>}

export default function NestMindInsights(){
 const [data,setData]=useState<Data|null>(null);
 useEffect(()=>{fetch('/api/analytics').then(r=>r.json()).then(setData).catch(()=>setData({enabled:false,insights:['Nest Mind analytics is temporarily unavailable.']}))},[]);
 if(!data)return <section className="panel"><h2>Nest Mind is reading the beta signals…</h2></section>;
 if(!data.enabled)return <section className="panel"><div className="eyebrow">NEST MIND · LEARNING ENGINE</div><h2>Measurement layer is waiting for its database gate.</h2><p>{data.insights?.[0]}</p></section>;
 const f=data.funnel!;const max=Math.max(f.sessions,1);
 return <section className="mind-board">
  <div className="section-head"><div><div className="eyebrow">NEST MIND · COLLECTOR SIGNALS</div><h2>Learn before we build more.</h2><p>Anonymous, first-party beta signals. No IP address, account ID, email address, or user-agent value is stored in this analytics layer.</p></div><span className="tag">30-DAY WINDOW</span></div>
  <div className="stats">
   <div className="stat"><Activity size={18}/><span className="muted">Beta sessions</span><strong>{f.sessions}</strong><span className="status">{f.sessions<25?'Early signal':'Growing sample'}</span></div>
   <div className="stat"><Eye size={18}/><span className="muted">Inspect a guardian</span><strong>{data.rates?.card||0}%</strong><span className="muted">{f.cardViews} total card views</span></div>
   <div className="stat"><Layers size={18}/><span className="muted">Preview a pack</span><strong>{data.rates?.pack||0}%</strong><span className="muted">{f.packPreviews} previews</span></div>
  </div>
  <div className="lower-grid">
   <article className="panel"><h2>Collector funnel</h2><Bar label="Visited CardNest" value={f.sessions} max={max}/><Bar label="Reached Season One" value={f.seasonSessions} max={max}/><Bar label="Inspected a guardian" value={f.cardSessions} max={max}/><Bar label="Previewed a pack" value={f.packSessions} max={max}/><Bar label="Visited My Nest" value={f.nestSessions} max={max}/></article>
   <article className="panel"><h2>Nest Mind recommendations</h2>{data.insights?.map((x,i)=><div className="mind-insight" key={i}><Sparkles size={17}/><p>{x}</p></div>)}<p className="disclaimer">Signals inform founder decisions. Nest Mind does not automatically change cards, prices, releases, payments, or production state.</p></article>
  </div>
  <div className="agent-list">
   <article className="panel"><h2>Theme interest</h2>{data.topThemes?.length?data.topThemes.map(x=><Bar key={x.dimension} label={x.dimension} value={Number(x.count)} max={Number(data.topThemes?.[0]?.count||1)}/>):<p>No Theme-selection data yet.</p>}</article>
   <article className="panel"><h2>Pack curiosity</h2>{data.packMix?.length?data.packMix.map(x=><Bar key={x.dimension} label={x.dimension} value={Number(x.count)} max={Number(data.packMix?.[0]?.count||1)}/>):<p>No pack-preview data yet.</p>}</article>
   <article className="panel"><h2>Guardians getting attention</h2>{data.topCards?.length?data.topCards.map(x=>{const c=seasonManifest.find(card=>card.id===x.dimension);return <Bar key={x.dimension} label={c?.name||x.dimension} value={Number(x.count)} max={Number(data.topCards?.[0]?.count||1)}/>}):<p>No guardian-view data yet.</p>}</article>
   <article className="panel"><h2>Partner-interest signals</h2>{data.affiliateClicks?.length?data.affiliateClicks.map(x=><Bar key={x.slug} label={x.slug} value={Number(x.count)} max={Number(data.affiliateClicks?.[0]?.count||1)}/>):<p>No approved-partner clicks yet.</p>}<p className="disclaimer">Affiliate interest is aggregate only and stays separate from personal collector profiles.</p></article>
  </div>
 </section>
}
