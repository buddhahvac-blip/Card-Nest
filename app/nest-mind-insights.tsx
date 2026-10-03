'use client';
import {useEffect,useState} from 'react';
import {Activity,Eye,Heart,Layers,MessageCircle,Share2,Sparkles} from 'lucide-react';
import {seasonManifest} from '@/lib/season-manifest';

type CountRow={dimension:string;count:number};
type Data={
 enabled:boolean;
 setup?:string;
 funnel?:{
  sessions:number;seasonSessions:number;cardSessions:number;packSessions:number;discoverSessions:number;battleSessions:number;nestSessions:number;supportSessions:number;
  showcaseSessions:number;livingSessions:number;albumSessions:number;battleAfterSaveSessions:number;favoriteSessions:number;wishlistSessions:number;shareSessions:number;feedbackSessions:number;cardViews:number;packPreviews:number;favoriteActions:number;wishlistActions:number;shareActions:number
 };
 rates?:{season:number;card:number;pack:number;favorite:number;wishlist:number;share:number;feedback:number};
 topCards?:CountRow[];topThemes?:CountRow[];packMix?:CountRow[];topFavorites?:CountRow[];topWishlist?:CountRow[];topShares?:CountRow[];rarityInterest?:Record<string,Record<string,number>>;themeEngagement?:Record<string,Record<string,number>>;measurementNote?:string;
 affiliateClicks?:{slug:string;count:number}[];
 feedback?:{returnReasons?:string[];responses:number;priorities:CountRow[];intent:CountRow[]};
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
   <div className="stat"><Heart size={18}/><span className="muted">Favorite a guardian</span><strong>{data.rates?.favorite||0}%</strong><span className="muted">{f.favoriteActions} favorite actions</span></div>
   <div className="stat"><Layers size={18}/><span className="muted">Preview a pack</span><strong>{data.rates?.pack||0}%</strong><span className="muted">{f.packPreviews} previews</span></div>
   <div className="stat"><Share2 size={18}/><span className="muted">Share a guardian</span><strong>{data.rates?.share||0}%</strong><span className="muted">{f.shareActions} share actions</span></div>
   <div className="stat"><MessageCircle size={18}/><span className="muted">Submit feedback</span><strong>{data.rates?.feedback||0}%</strong><span className="muted">{data.feedback?.responses||0} responses</span></div>
  </div>
  <div className="lower-grid">
   <article className="panel"><h2>Session reach</h2><p className="disclaimer">Sessions are not unique people; these stages can happen in any order.</p><Bar label="Reached art showcase" value={f.showcaseSessions||0} max={max}/><Bar label="Entered Living World" value={f.livingSessions||0} max={max}/><Bar label="Explored an album" value={f.albumSessions||0} max={max}/><Bar label="Battle after saving a guardian" value={f.battleAfterSaveSessions||0} max={max}/><Bar label="Visited CardNest" value={f.sessions} max={max}/><Bar label="Reached Season One" value={f.seasonSessions} max={max}/><Bar label="Inspected a guardian" value={f.cardSessions} max={max}/><Bar label="Favorited a guardian" value={f.favoriteSessions} max={max}/><Bar label="Added to wishlist" value={f.wishlistSessions} max={max}/><Bar label="Previewed a pack" value={f.packSessions} max={max}/><Bar label="Shared a guardian" value={f.shareSessions} max={max}/><Bar label="Sent feedback" value={f.feedbackSessions} max={max}/><Bar label="Visited My Nest" value={f.nestSessions} max={max}/></article>
   <article className="panel"><h2>Nest Mind recommendations</h2>{data.insights?.map((x,i)=><div className="mind-insight" key={i}><Sparkles size={17}/><p>{x}</p></div>)}<p className="disclaimer">Signals inform founder decisions. Nest Mind does not automatically change cards, prices, releases, payments, or production state.</p></article>
  </div>
  <div className="agent-list">
   <article className="panel"><h2>Theme interest</h2>{data.topThemes?.length?data.topThemes.map(x=><Bar key={x.dimension} label={x.dimension} value={Number(x.count)} max={Number(data.topThemes?.[0]?.count||1)}/>):<p>No Theme-selection data yet.</p>}</article>
   <article className="panel"><h2>Pack curiosity</h2>{data.packMix?.length?data.packMix.map(x=><Bar key={x.dimension} label={x.dimension} value={Number(x.count)} max={Number(data.packMix?.[0]?.count||1)}/>):<p>No pack-preview data yet.</p>}</article>
   <article className="panel"><h2>Guardians getting attention</h2>{data.topCards?.length?data.topCards.map(x=>{const card=seasonManifest.find(c=>c.id===x.dimension);return <Bar key={x.dimension} label={card?.name||x.dimension} value={Number(x.count)} max={Number(data.topCards?.[0]?.count||1)}/>}):<p>No guardian-view data yet.</p>}</article>
   <article className="panel"><h2>Guardians collectors save</h2>{data.topFavorites?.length?data.topFavorites.map(x=>{const card=seasonManifest.find(c=>c.id===x.dimension);return <Bar key={x.dimension} label={card?.name||x.dimension} value={Number(x.count)} max={Number(data.topFavorites?.[0]?.count||1)}/>}):<p>No favorite signals yet.</p>}</article>
   <article className="panel"><h2>What beta testers want next</h2>{data.feedback?.priorities?.length?data.feedback.priorities.map(x=><Bar key={x.dimension} label={x.dimension} value={Number(x.count)} max={Number(data.feedback?.priorities?.[0]?.count||1)}/>):<p>No beta feedback yet.</p>}<p className="disclaimer">Use these answers together with written return reasons; do not treat a small sample as a final roadmap decision.</p></article>
   <article className="panel"><h2>Would they collect?</h2>{data.feedback?.intent?.length?data.feedback.intent.map(x=><Bar key={x.dimension} label={x.dimension} value={Number(x.count)} max={Number(data.feedback?.intent?.[0]?.count||1)}/>):<p>No collector-intent responses yet.</p>}</article>
   <article className="panel"><h2>Partner-interest signals</h2>{data.affiliateClicks?.length?data.affiliateClicks.map(x=><Bar key={x.slug} label={x.slug} value={Number(x.count)} max={Number(data.affiliateClicks?.[0]?.count||1)}/>):<p>No approved-partner clicks yet.</p>}<p className="disclaimer">Affiliate interest is aggregate only and stays separate from personal collector profiles.</p></article>
   {([['Wishlist additions',data.topWishlist],['Share actions',data.topShares]] as const).map(([title,rows])=><article className="panel" key={title}><h2>{title}</h2>{rows?.length?rows.map(x=><Bar key={x.dimension} label={seasonManifest.find(c=>c.id===x.dimension)?.name||x.dimension} value={Number(x.count)} max={Number(rows[0].count)||1}/>):<p>No signals yet.</p>}</article>)}
   <article className="panel"><h2>Rarity presentation interest</h2>{Object.entries(data.rarityInterest||{}).map(([rarity,counts])=><p key={rarity}>{rarity}: {counts['card-view']||0} views · {counts.favorite||0} Favorite actions · {counts['wishlist-add']||0} Wishlist additions</p>)}<p className="disclaimer">Raw totals depend on exposure and roster size. They do not prove that one rarity is preferred.</p></article>
   <article className="panel"><h2>Theme engagement</h2>{Object.entries(data.themeEngagement||{}).map(([theme,counts])=><p key={theme}>{theme}: {counts['card-view']||0} views · {counts.favorite||0} Favorite actions · {counts['share-card']||0} share actions</p>)}</article>
   <article className="panel"><h2>Reasons to return</h2>{data.feedback?.returnReasons?.length?data.feedback.returnReasons.map((reason,i)=><p key={i}>{reason}</p>):<p>No written feedback yet.</p>}<p className="disclaimer">Founder-only feedback. Do not send these texts to external models or contact respondents automatically.</p></article>
  </div><p className="disclaimer">{data.measurementNote}</p>
 </section>
}
