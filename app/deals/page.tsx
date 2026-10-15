import Link from 'next/link';
import type {Metadata} from 'next';
import AffiliateDiscovery from '../affiliate-discovery';

export const metadata:Metadata={
 title:'Pokémon & TCG Partner Shopping',
 description:'Find approved third-party trading-card shopping partners through NestRune. All paid partner links are disclosed.',
 alternates:{canonical:'/deals'}
};

export default function DealsPage(){
 return <main className="shell" style={{paddingTop:32,paddingBottom:48}}>
  <div className="eyebrow">COLLECTOR DISCOVERY · APPROVED PARTNER LINKS</div>
  <h1 className="page-title">Pokémon & trading-card shopping</h1>
  <p className="intro">Explore third-party collector marketplaces and retailers. NestRune may earn a commission from qualifying purchases through labeled partner links, at no extra cost to you. Verify prices, shipping, condition, and availability with the seller before buying.</p>
  <div className="actions">
   <Link className="outline" href="/">Explore NestRune originals</Link>
   <Link className="outline" href="/guides">Read collector guides</Link>
   <Link className="outline" href="/affiliate-disclosure">How affiliate links work</Link>
  </div>
  <AffiliateDiscovery/>
  <p className="disclaimer" style={{marginTop:16}}>NestRune is independent of Pokémon, The Pokémon Company, Nintendo, and all third-party retailers listed above. Partner approval is required before any affiliate link is active. No product price or discount is guaranteed by this page.</p>
 </main>;
}
