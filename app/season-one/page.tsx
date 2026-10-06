import type {Metadata} from 'next';
import Link from 'next/link';
import {seasonManifest,artProgress,hasSeasonArtwork} from '@/lib/season-manifest';
import LegendaryFlight from '@/app/legendary-flight';
import SeasonArtGallery from '@/app/season-art-gallery';
import {cardPath,themePath} from '@/lib/card-paths';
import ThemeEmblem from '@/app/theme-emblem';

export const metadata:Metadata={
 title:'Season One: The First Flight',
 description:'Explore all 369 NestRune Season One guardian concepts across Ember, Tide, Bloom, Volt, Mystic, and Shadow.',
 alternates:{canonical:'/season-one'}
};

export default function SeasonOnePage(){
 const progress=artProgress();
 const themes=['Ember','Tide','Bloom','Volt','Mystic','Shadow'];
 return <main className="shell">
  <Link className="brand" href="/">✧ Nest<span>Rune</span></Link>
  <div className="eyebrow">SEASON ONE · THE FIRST FLIGHT</div>
  <h1 className="page-title">369 guardians. Six Themes. One world taking flight.</h1>
  <p className="intro">Explore illustrated guardians and the full Season One roster. The six featured artworks are founder-approved; cards remain unreleased and battle profiles are still being developed.</p>
  <section className="stats">
   <div className="stat"><span className="muted">Season One</span><strong>{progress.total}</strong><span className="status">planned guardians</span></div>
   <div className="stat"><span className="muted">Illustrated cards</span><strong>{progress.illustrated}</strong><span className="muted">including approved showcase art</span></div>
   <div className="stat"><span className="muted">Paid eligible</span><strong>{progress.released}</strong><span className="muted">commerce remains closed</span></div>
  </section>
  <LegendaryFlight/>
  <SeasonArtGallery/>
  <section className="panel">
   <h2>Explore by Theme</h2>
   <div className="actions">{themes.map(theme=><Link className="outline" href={themePath(theme)} key={theme}>{theme} Theme</Link>)}</div>
  </section>
  <section className="panel">
   <h2>Season One visual collector index</h2>
   <p>Browse every guardian by Theme. Illustrated cards show their artwork; unreleased art slots remain clearly marked.</p>
   <div style={{display:'grid',gap:24}}>
    {themes.map(theme=>{
     const cards=seasonManifest.filter(card=>card.theme===theme).sort((a,b)=>a.cardNumber-b.cardNumber);
     return <section key={theme} style={{border:'1px solid rgba(255,255,255,.08)',borderRadius:20,padding:18,background:'rgba(255,255,255,.018)'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:16,flexWrap:'wrap'}}>
       <div style={{display:'flex',alignItems:'center',gap:10}}>
        <ThemeEmblem theme={theme} size={32}/>
        <span className="muted">{cards.length} guardians</span>
       </div>
       <Link className="outline" href={themePath(theme)}>Open {theme} Theme</Link>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12}}>
       {cards.map(card=>{
        const imageSrc=card.thumbnailUrl||card.avatarUrl||card.artworkUrl||card.fullCardUrl||null;
        const illustrated=hasSeasonArtwork(card)&&!!imageSrc;
        return <Link key={card.id} href={cardPath(card)} style={{display:'block',textDecoration:'none',color:'inherit',border:'1px solid rgba(255,255,255,.08)',borderRadius:14,padding:9,background:'rgba(255,255,255,.025)'}}>
         <div style={{position:'relative',width:'100%',aspectRatio:'3 / 4',borderRadius:10,overflow:'hidden',background:'rgba(255,255,255,.035)',marginBottom:9}}>
          {illustrated
           ? <img src={imageSrc!} alt={card.name} loading="lazy" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
           : <div style={{width:'100%',height:'100%',display:'grid',placeItems:'center',padding:12,textAlign:'center',fontSize:12,opacity:.58}}>Artwork coming soon</div>}
         </div>
         <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:5}}>
          <ThemeEmblem theme={card.theme} size={20} label={false}/>
          <span style={{fontSize:11,opacity:.78}}>CN1-{String(card.cardNumber).padStart(3,'0')}</span>
         </div>
         <strong style={{display:'block',fontSize:14,lineHeight:1.25,marginBottom:4}}>{card.name}</strong>
         <span style={{display:'block',fontSize:11,opacity:.68,textTransform:'capitalize'}}>{card.battleClass} · {card.rarity}</span>
        </Link>
       })}
      </div>
     </section>
    })}
   </div>
  </section>
 </main>;
}
