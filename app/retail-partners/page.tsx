import type {Metadata} from 'next';
import PartnerOrder from './partner-order';
export const metadata:Metadata={title:'Retail Partners',robots:{index:false,follow:true}};
export default function Page(){return <main style={{maxWidth:1100,margin:'auto',padding:'20px 16px 60px',color:'#f5e9d1'}}><a href="/" style={{color:'#edc781'}}>← NestRune home</a><h1 style={{fontSize:'clamp(28px,6vw,48px)',margin:'24px 0 8px'}}>Retail Partners</h1><p>Pokémon &amp; One Piece • Big Island, Hawaiʻi</p><PartnerOrder/></main>}
