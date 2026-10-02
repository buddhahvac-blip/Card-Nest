'use client';
import {useEffect,useState} from 'react';
import {ExternalLink} from 'lucide-react';

type Partner={
 slug:string;
 partner:'tcgplayer'|'ebay'|'amazon'|'target'|'walmart'|'fanatics'|'vaultx'|'psa';
 label:string;
 category:'Pokemon'|'Magic'|'Supplies'|'Sports'|'Grading';
 description:string;
 active:boolean;
 url:string|null;
};

const partnerNames:Record<Partner['partner'],string>={
 tcgplayer:'TCGplayer',ebay:'eBay',amazon:'Amazon',target:'Target',walmart:'Walmart',fanatics:'Fanatics',vaultx:'Vault X',psa:'PSA'
};

export default function AffiliateDiscovery(){
 const [data,setData]=useState<{disclosure:string;amazonDisclosure:string|null;partners:Partner[]}|null>(null);
 useEffect(()=>{fetch('/api/affiliate').then(r=>r.json()).then(setData).catch(()=>{})},[]);
 if(!data)return null;
 const groups=['Pokemon','Magic','Supplies','Sports','Grading'] as const;
 function track(slug:string){fetch('/api/affiliate/click',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug}),keepalive:true}).catch(()=>{})}
 return <section style={{marginTop:28}}>
  <div className="section-head"><div><div className="eyebrow">PARTNER SHOPPING · THIRD-PARTY COLLECTIBLES</div><h2>Shop approved collector partners.</h2><p>CardNest originals remain separate from third-party franchises, marketplaces, retailers, and grading services.</p></div></div>
  <div className="notice"><strong>Affiliate disclosure:</strong> {data.disclosure} Partner commissions do not change CardNest reviews, artwork, or recommendations.{data.amazonDisclosure&&<><br/><strong>{data.amazonDisclosure}</strong></>}</div>
  <div className="discover-grid">{groups.map(category=><article className="panel" key={category}>
   <h2>{category==='Pokemon'?'Pokémon':category==='Magic'?'Magic: The Gathering':category==='Supplies'?'Protect your collection':category==='Sports'?'Sports collectibles':'Grading & authentication'}</h2>
   <p>{category==='Grading'?'Explore approved third-party grading services.':'Browse approved third-party products and listings. CardNest is not the seller of record.'}</p>
   <div className="actions">{data.partners.filter(p=>p.category===category).map(p=>p.active&&p.url
    ?<a key={p.slug} className="outline" href={p.url} target="_blank" rel="sponsored noopener noreferrer" onClick={()=>track(p.slug)}>{p.label} · paid link <ExternalLink size={15}/></a>
    :<span key={p.slug} className="tag">{partnerNames[p.partner]} pending approval</span>)}</div>
  </article>)}</div>
  <p className="disclaimer">External prices, availability, authentication programs, shipping, returns, product claims and seller terms are controlled by the destination partner or seller—not CardNest. Affiliate links open the partner directly; CardNest does not place an affiliate checkout inside its own payment flow.</p>
 </section>
}
