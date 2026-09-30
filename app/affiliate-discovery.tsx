'use client';
import {useEffect,useState} from 'react';
import {ExternalLink} from 'lucide-react';

type Partner={slug:string;partner:'tcgplayer'|'ebay';label:string;category:'Pokemon'|'Magic';description:string;active:boolean};
export default function AffiliateDiscovery(){
 const [data,setData]=useState<{disclosure:string;partners:Partner[]}|null>(null);
 useEffect(()=>{fetch('/api/affiliate').then(r=>r.json()).then(setData).catch(()=>{})},[]);
 if(!data)return null;
 const groups=['Pokemon','Magic'] as const;
 return <section style={{marginTop:28}}>
  <div className="section-head"><div><div className="eyebrow">PARTNER SHOPPING · THIRD-PARTY CARDS</div><h2>Shop established card marketplaces.</h2><p>CardNest originals remain separate from third-party franchises and marketplace inventory.</p></div></div>
  <div className="notice"><strong>Affiliate disclosure:</strong> {data.disclosure} Partner links do not change CardNest reviews, artwork, or recommendations.</div>
  <div className="discover-grid">{groups.map(category=><article className="panel" key={category}>
   <h2>{category==='Pokemon'?'Pokémon':'Magic: The Gathering'}</h2>
   <p>Browse third-party listings from approved marketplace partners. CardNest does not manufacture, authenticate, fulfill, or warrant these external listings.</p>
   <div className="actions">{data.partners.filter(p=>p.category===category).map(p=>p.active
    ?<a key={p.slug} className="outline" href={'/go/'+p.slug} target="_blank" rel="sponsored noopener noreferrer">{p.label} <ExternalLink size={15}/></a>
    :<span key={p.slug} className="tag">{p.partner==='tcgplayer'?'TCGplayer':'eBay'} partner link pending approval</span>)}</div>
  </article>)}</div>
  <p className="disclaimer">External marketplace prices, availability, authenticity services, shipping, returns, and seller terms are controlled by the marketplace and seller—not CardNest.</p>
 </section>
}
