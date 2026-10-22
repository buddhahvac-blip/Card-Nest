import Link from 'next/link';
const items=[
['Prismatic Evolutions ETB','Featured','Request'],
['Destined Rivals ETB','Featured','Confirm stock'],
['Surging Sparks ETB','Featured','Confirm stock'],
['30th Celebration ETB','Featured','Confirm stock'],
['Pokémon 151 ETB','Rare sealed','Request'],
['Evolving Skies ETB','Rare sealed','Request'],
['Hidden Fates ETB','Rare sealed','Request'],
['Crown Zenith ETB','Rare sealed','Request'],
['PSA / CGC graded cards','Graded cards','Inquire'],
['Raw Pokémon singles','Raw singles','Inquire']
];
export default function CollectorCatalog(){return <main style={{minHeight:'100vh',background:'#101c2c',color:'#f8efd8',padding:'32px 5%',fontFamily:'system-ui'}}>
<nav><Link href="/" style={{color:'#e9c786'}}>✧ NestRune · Enter the game ↗</Link></nav>
<header style={{textAlign:'center',padding:'70px 0 45px'}}><p>SHOP THE NEST · HAWAIʻI</p><h1 style={{fontSize:'clamp(36px,6vw,64px)'}}>A World Worth Collecting</h1><p>Sealed Pokémon collections, graded cards, raw singles, and collector requests.</p><p>Catalog showcase only. Stock and prices must be confirmed before purchase.</p></header>
<section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:20,maxWidth:1250,margin:'auto'}}>{items.map(([name,category,status],i)=><article key={name} style={{background:'#1c3042',border:'1px solid #4c6070',borderRadius:16,overflow:'hidden'}}><div style={{height:155,background:i%2?'linear-gradient(140deg,#243e5d,#554567)':'linear-gradient(140deg,#245b58,#24334e)',display:'grid',placeItems:'center',textAlign:'center',color:'#f5d795',letterSpacing:2}}>✧ NESTRUNE<br/>COLLECTOR SHOWCASE</div><div style={{padding:20}}><small>{category}</small><h2 style={{fontSize:20,minHeight:55}}>{name}</h2><p style={{color:'#f5d795'}}>{status==='Request'?'Request this product':status==='Confirm stock'?'Availability to confirm':'Inventory inquiry'}</p><a style={{color:'#f5d795'}} href={'mailto:cardnestsupport@gmail.com?subject='+encodeURIComponent('NestRune inquiry: '+name)}>Ask about availability ↗</a></div></article>)}</section>
<section style={{maxWidth:1200,margin:'60px auto',padding:30,border:'1px solid #8b7857',borderRadius:16}}><h2>Sell or consign your collection</h2><p>Have sealed products, slabs, or singles? Ask NestRune about consignment opportunities.</p><a style={{color:'#f5d795'}} href="mailto:cardnestsupport@gmail.com?subject=Consignment%20Inquiry">Contact us ↗</a></section>
<footer style={{fontSize:13,color:'#b5c2ce'}}>NestRune is independent and is not affiliated with Nintendo, Pokémon, or The Pokémon Company. Display graphics are NestRune originals, not official product packaging.</footer></main>}