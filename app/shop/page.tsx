import type {Metadata} from 'next';
import Link from 'next/link';
import {physicalEtbs,fourAnniversaryBundleCents,fullCollectionRegularCents,approvedFullCollectionBundleCents} from '@/lib/physical-catalog';

export const metadata:Metadata={title:'Pokémon Sealed Shop',description:'Explore NestRune sealed Pokémon Elite Trainer Boxes and collection bundles. Availability and checkout pending confirmation.'};
const usd=(cents:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(cents/100);
export default function PokemonShop(){
  return <main style={{maxWidth:1160,margin:'0 auto',padding:'32px 5% 80px',color:'#f7f0df'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:20,flexWrap:'wrap',marginBottom:42}}>
      <Link href="/" style={{fontSize:25,fontFamily:'Georgia,serif',fontWeight:700}}>NestRune</Link>
      <Link href="/" style={{color:'#e9c483'}}>← Back to the game</Link>
    </div>
    <p className="eyebrow">NestRune · Physical Pokémon collectibles</p>
    <h1 style={{fontSize:'clamp(36px,6vw,64px)',margin:'12px 0 18px',fontFamily:'Georgia,serif'}}>The Sealed Collection</h1>
    <p style={{maxWidth:730,lineHeight:1.7,color:'#cad7d3'}}>Explore our current sealed ETB lineup. Local pickup from the Big Island of Hawaiʻi and future nationwide shipping. This is a preview catalog: stock, product editions and checkout must be verified before orders open.</p>
    <section style={{marginTop:36,padding:28,border:'1px solid #d7b875',borderRadius:18,background:'linear-gradient(120deg,#254b47,#172c34)'}}>
      <p className="eyebrow">Collector bundle promotion · preview</p>
      <h2 style={{fontSize:34,margin:'12px 0'}}>Take the whole collection</h2>
      <p style={{lineHeight:1.7}}>All eight ETBs: five 30th Anniversary, one Destined Rivals, one Prismatic Evolutions and one Surging Sparks.</p>
      <p style={{marginTop:14,fontSize:22}}><strong>Individual listing total: {usd(fullCollectionRegularCents)}</strong></p>
      <p style={{color:'#f2d597',marginTop:10}}>Owner-selected bundle price: {usd(approvedFullCollectionBundleCents)} · Save {usd(fullCollectionRegularCents-approvedFullCollectionBundleCents)}. Offer not yet available for purchase: the estimated acquisition cost is approximately $1,500; final profit still depends on payment fees, shipping, packaging and taxes.</p>
      <p style={{marginTop:10,fontSize:13,color:'#cbd8d1'}}>No orders or reservations are accepted through this preview. Shipping and taxes, if applicable, are additional.</p>
    </section>
    <h2 style={{fontSize:32,margin:'46px 0 22px'}}>Current ETB lineup</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:18}}>
      {physicalEtbs.map(item=><article key={item.id} style={{padding:23,border:'1px solid #47615c',borderRadius:16,background:'#152d32',minHeight:230}}>
        <p style={{fontSize:12,letterSpacing:1.5,color:'#e9c483',textTransform:'uppercase'}}>Pokémon · Elite Trainer Box</p>
        <h3 style={{fontSize:24,margin:'18px 0 10px',fontFamily:'Georgia,serif'}}>{item.name}</h3>
        <p style={{color:'#b8c8c3',fontSize:14}}>{item.detail}</p>
        <p style={{fontSize:26,fontWeight:700,margin:'22px 0 6px'}}>{usd(item.priceCents)}</p>
        <p style={{color:'#c7d0cc',fontSize:13}}>Reported stock: {item.quantity} · pending verification</p>
      </article>)}
    </div>
    <section style={{marginTop:30,padding:25,border:'1px solid #47615c',borderRadius:16}}>
      <h2 style={{fontSize:26}}>30th Anniversary bundle</h2>
      <p style={{marginTop:10,lineHeight:1.7}}>Four 30th Anniversary ETBs for <strong>{usd(fourAnniversaryBundleCents)}</strong> (versus {usd(4*20000)} individually). Offer shown for planning only; availability must be confirmed before purchase.</p>
    </section>
    <p style={{fontSize:13,color:'#a9bbb7',lineHeight:1.7,marginTop:30}}>NestRune is an independent reseller and is not affiliated with or endorsed by Pokémon, Nintendo, Creatures or Game Freak. Product photos will be added after matching the exact box editions. Digital NestRune packs are separate from physical Pokémon merchandise.</p>
  </main>;
}
