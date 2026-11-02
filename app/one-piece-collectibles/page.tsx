import Link from 'next/link';
import type {Metadata} from 'next';

// Physical collectibles only. Do not mix with NestRune digital-game inventory.
// Counts are the owner's reported in-hand inventory on November 2, 2026.
// Unsorted raw cards and shipments are intentionally not offered.
export const metadata:Metadata={
  title:'One Piece Collectibles | NestRune',
  description:'Browse NestRune’s reported in-hand One Piece sealed products, loose boosters, and graded cards from Hawaiʻi. Inquiry only; no checkout or payments.',
  alternates:{canonical:'/one-piece-collectibles'},
  openGraph:{title:'NestRune One Piece Collectibles',description:'Sealed One Piece TCG, booster packs and graded cards. Contact us for availability; listing art is AI-designed and actual condition photographs are provided on request.',url:'/one-piece-collectibles'}
};

type Item={name:string;quantity:number;detail:string;sku:string};
const sealed:Item[]=[
  {name:'Kid / Killer Illustration Box',quantity:1,detail:'Sealed illustration box',sku:'OP-ILL-KID-KILLER'},
  {name:'Rayleigh / Shakuyaku Illustration Box',quantity:1,detail:'Sealed illustration box',sku:'OP-ILL-RAYLEIGH-SHAKUYAKU'},
  {name:'Charlotte Katakuri Starter Deck',quantity:1,detail:'ST-34 · Starter deck',sku:'OP-ST-34'}
];
const packs:Item[]=[
  {name:'OP-16 Booster Pack',quantity:2,detail:'English · 12-card packs',sku:'OP-16-EN'},
  {name:'EB-04 Booster Pack',quantity:1,detail:'Japanese',sku:'EB-04-JP'},
  {name:'OP-15 Booster Pack',quantity:1,detail:'Japanese',sku:'OP-15-JP'},
  {name:'OP-09 Booster Pack',quantity:1,detail:'Japanese',sku:'OP-09-JP'},
  {name:'OP-17 Booster Pack',quantity:3,detail:'Japanese',sku:'OP-17-JP'},
  {name:'Carddass OPC-01 Booster Pack',quantity:8,detail:'Japanese · Carddass OPC-01 (not OP-01)',sku:'OPC-01-JP'}
];
const graded:Item[]=[
  {name:'Baccarat',quantity:1,detail:'Crown · Gem 10',sku:'OP-SLAB-BACCARAT'},
  {name:'Camie',quantity:1,detail:'Crown · Gem 10',sku:'OP-SLAB-CAMIE'},
  {name:'DON!! Card',quantity:1,detail:'Crown · Gem Mint 9.5',sku:'OP-SLAB-DON'},
  {name:'Bell-mère',quantity:1,detail:'Crown · Gem Mint 9.5',sku:'OP-SLAB-BELLMERE'},
  {name:'Marshall D. Teach',quantity:1,detail:'Crown · Mint 9',sku:'OP-SLAB-TEACH'}
];

const sum=(items:Item[])=>items.reduce((n,item)=>n+item.quantity,0);
const inquiry=(name:string)=>'mailto:cardnestsupport@gmail.com?subject='+encodeURIComponent('NestRune One Piece collectible inquiry: '+name)+'&body='+encodeURIComponent('Hello NestRune, please confirm in-hand availability, the exact item photos, condition, price, shipping from Hawaiʻi, taxes and payment terms for '+name+'.');

function Group({title,items,note}:{title:string;items:Item[];note:string}){
  return <section className="op-group">
    <div className="op-group-title"><div><h2>{title}</h2><p>{note}</p></div><span>{sum(items)} ITEMS REPORTED</span></div>
    <div className="op-grid">{items.map(item=><article className="op-card" key={item.sku}>
      <div className="op-photo"><img src={"/one-piece-collectibles/illustrations/"+encodeURIComponent(item.sku)} alt={item.name+" — original AI-designed illustrative preview, not an actual item photo"} width={700} height={500} loading="lazy"/><small>AI-ILLUSTRATED PREVIEW · NOT ACTUAL ITEM PHOTO</small></div>
      <div className="op-card-details"><p className="op-sku">{item.sku}</p><h3>{item.name}</h3><p>{item.detail}</p>
      <div className="op-availability"><strong>Qty {item.quantity} reported</strong><span>Confirm before ordering</span></div>
      <a href={inquiry(item.name)}>REQUEST DETAILS ↗</a></div>
    </article>)}</div>
  </section>
}

export default function OnePieceCollectibles(){
  return <main className="op-site"><div className="op-shell">
    <header className="op-header"><Link href="/" className="op-logo">✧ <span>NESTRUNE<small>A WORLD WORTH COLLECTING</small></span></Link>
      <nav aria-label="Collectibles"><Link href="/pokemon-collectibles">Pokémon</Link><span aria-current="page">One Piece</span></nav></header>
    <section className="op-hero"><div><div className="op-eyebrow">NESTRUNE / PHYSICAL COLLECTIBLES</div><h1>ONE PIECE<br/><em>COLLECTIBLES</em></h1>
      <p>Sealed products, Japanese and English booster packs, and graded cards. Carefully tracked from Hawaiʻi. These listings feature original AI-designed product illustrations rather than item photographs. All requests are inquiry-only while we confirm actual photographs, condition, and selling details.</p>
      <a href="#catalog" className="op-primary">EXPLORE THE COLLECTION ↓</a></div>
      <div className="op-stat"><strong>{sum(sealed)+sum(packs)+sum(graded)}</strong><span>IDENTIFIED IN-HAND UNITS</span><p>Plus approximately 26 unsorted raw cards, not offered for sale.</p></div></section>
    <div className="op-notice">Inventory is owner-reported as of November 2, 2026 and not guaranteed. All product pictures on this page are AI-designed illustrations, NOT actual item photographs, accurate packaging reproductions, or evidence of condition. Request real photos, prices, shipping, taxes, and terms before any sale. Checkout and payments are disabled.</div>
    <div id="catalog"><Group title="Sealed Collectibles" items={sealed} note="Three boxed or deck products."/>
      <Group title="Loose Booster Packs" items={packs} note="Six pack types, sixteen individual packs. All pictures are AI-designed conceptual artwork; actual pack photos available on request."/>
      <Group title="Graded Cards" items={graded} note="Five individually graded One Piece cards. Grades follow the reported Crown labels."/></div>
    <section className="op-pending"><h2>Still being cataloged</h2><p>Approximately <strong>26 One Piece raw cards</strong> are held out of the public product catalog until individually identified. Unsorted Pokémon raw cards and incoming shipments are also excluded. Product pictures are never counted as extra units.</p></section>
    <section className="op-bottom"><h2>Looking for something specific?</h2><p>Contact NestRune to request actual item photos, verified inventory and condition, pricing, and shipping from Hawaiʻi. The graphics above are AI illustrations. No payment is collected on this page.</p><a href={inquiry('general One Piece inventory')}>CONTACT THE NEST ↗</a></section>
    <footer><Link href="/pokemon-collectibles">Pokémon collectibles</Link><Link href="/">NestRune digital world</Link><span>NestRune is an independent collector shop and is not affiliated with or endorsed by Bandai or the One Piece rights holders.</span></footer>
  </div><style>{`
    .op-site{min-height:100vh;color:#f6eee0;background:radial-gradient(ellipse at 85% 0%,#123c40,#071d26 48%,#081820 100%);font-family:Arial,Helvetica,sans-serif}
    .op-site *{box-sizing:border-box}.op-shell{width:min(1170px,100%);margin:auto;padding:20px clamp(16px,4vw,52px) 60px}
    .op-header{display:flex;align-items:center;justify-content:space-between;gap:20px;border-bottom:1px solid #56817c55;padding:11px 0 25px}
    .op-logo{display:flex;align-items:center;gap:12px;text-decoration:none;color:#f3d897;font-size:29px;font-weight:850;letter-spacing:2px}.op-logo span{color:#f8f3e5}.op-logo small{display:block;font-size:9px;font-weight:400;color:#c7ad7d;letter-spacing:2px;margin-top:4px}
    .op-header nav{display:flex;align-items:center;gap:16px;font-size:12px;text-transform:uppercase;letter-spacing:1px}.op-header nav a{color:#afcecd;text-decoration:none}.op-header nav span{color:#f6d27d}
    .op-hero{display:grid;grid-template-columns:1.35fr .65fr;align-items:center;gap:38px;padding:60px 0}
    .op-eyebrow{font-size:11px;letter-spacing:3px;color:#e5c77d}.op-hero h1{font-size:clamp(43px,7vw,79px);letter-spacing:.01em;line-height:.97;margin:16px 0 22px}.op-hero em{font-style:normal;color:#d4b16c}
    .op-hero p{color:#c0d3d1;line-height:1.7;max-width:630px}.op-primary{display:inline-block;background:#dfbf7e;color:#09282c;border-radius:9px;padding:14px 19px;text-decoration:none;font-size:12px;font-weight:850;letter-spacing:1px;margin-top:14px}
    .op-stat{border:1px solid #c8a76d87;border-radius:22px;background:linear-gradient(150deg,#153c40,#0a222a);padding:30px;text-align:center}.op-stat strong{display:block;color:#e4c583;font-size:88px}.op-stat span{font-size:10px;letter-spacing:2px}.op-stat p{font-size:13px}
    .op-notice{border-left:3px solid #ddbb75;padding:14px 18px;background:#18333a;font-size:12px;line-height:1.7;color:#d0dfdb}
    .op-group{margin:44px 0 50px}.op-group-title{display:flex;justify-content:space-between;align-items:center;gap:15px;padding-bottom:16px;border-bottom:1px solid #54777466}
    .op-group-title h2{font-size:25px;margin:0}.op-group-title p{color:#a8c0bc;font-size:13px}.op-group-title>span{font-size:10px;letter-spacing:1px;color:#ecd198;white-space:nowrap}
    .op-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:19px}.op-card{border:1px solid #385a5e;border-radius:16px;overflow:hidden;background:#102c34}
    .op-photo{position:relative;background:radial-gradient(circle at center,#284a48,#0d2830);overflow:hidden;text-align:center}.op-photo img{display:block;width:100%;height:auto;aspect-ratio:7/5;object-fit:cover}.op-photo small{position:absolute;bottom:0;left:0;right:0;padding:8px 5px;background:#031a20e8;color:#ffe4aa;font-size:8px;letter-spacing:.7px;font-weight:800}
    .op-card-details{padding:19px}.op-card h3{font-size:17px;margin:9px 0;line-height:1.3}.op-card-details>p:not(.op-sku){font-size:12px;color:#bbcdca}.op-sku{font-size:9px!important;letter-spacing:1px;color:#d9bb81!important}
    .op-availability{border-top:1px solid #476366;padding-top:13px;margin-top:18px;display:flex;justify-content:space-between;gap:10px;align-items:center}.op-availability strong{color:#e7c78c;font-size:12px}.op-availability span{color:#a4bdb8;font-size:10px;text-align:right}
    .op-card a{display:block;border-radius:8px;margin-top:15px;padding:12px;background:#dabc7d;text-align:center;text-decoration:none;color:#08262a;font-weight:800;font-size:11px;letter-spacing:1px}
    .op-pending{padding:26px;border:1px solid #526e6a;border-radius:16px;background:#0e2930}.op-pending h2{margin:0 0 10px}.op-pending p{font-size:13px;line-height:1.8;color:#c2d1cd}
    .op-bottom{text-align:center;padding:52px 20px}.op-bottom h2{font-size:29px}.op-bottom p{line-height:1.7;color:#b9ceca}.op-bottom a{display:inline-block;color:#0b292d;background:#e6c783;text-decoration:none;padding:13px 22px;border-radius:9px;font-size:12px;font-weight:800;margin-top:10px}
    .op-site footer{border-top:1px solid #58777455;display:flex;flex-wrap:wrap;gap:14px;padding-top:23px;color:#9eb8b3;font-size:11px;line-height:1.6}.op-site footer a{color:#e3c47e}.op-site footer span{flex-basis:100%}
    @media(max-width:750px){.op-hero{grid-template-columns:1fr;padding:34px 0;gap:20px}.op-stat strong{font-size:55px}.op-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.op-stat{padding:16px}}
    @media(max-width:490px){.op-grid{grid-template-columns:1fr}.op-group-title{align-items:flex-start;flex-direction:column}.op-header{flex-wrap:wrap}.op-hero h1{font-size:47px}.op-photo img{aspect-ratio:7/5}}
  `}</style></main>
}
