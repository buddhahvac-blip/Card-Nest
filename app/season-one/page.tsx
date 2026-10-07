import type {Metadata} from 'next';
import Link from 'next/link';
import {seasonManifest,artProgress} from '@/lib/season-manifest';
import LegendaryFlight from '@/app/legendary-flight';
import SeasonArtGallery from '@/app/season-art-gallery';
import SeasonThemeBrowser from '@/app/season-theme-browser';
import ThemeEmblem from '@/app/theme-emblem';

export const metadata:Metadata={
 title:'Season One: The First Flight',
 description:'Meet NestRune Season One: 369 original fantasy Guardians across six Themes. Explore featured artwork, browse Guardians by Theme, and join the free beta.',
 alternates:{canonical:'/season-one'},
 openGraph:{
  title:'NestRune Season One — The First Flight',
  description:'Discover original fantasy Guardians across Ember, Tide, Bloom, Volt, Mystic, and Shadow. Explore the art and join the free NestRune beta.',
  url:'/season-one',
  type:'website'
 }
};

const themeCopy:Record<string,string>={
 Ember:'Heat, courage, volcanic ridges and Guardians built to endure.',
 Tide:'Flow, patience and creatures shaped by rivers, reefs and open water.',
 Bloom:'Growth, healing and living sanctuaries filled with wild magic.',
 Volt:'Speed, sparks and high-energy Guardians from storm-lit lands.',
 Mystic:'Stars, runes and celestial Guardians tied to ancient mysteries.',
 Shadow:'Moonlit ruins, stealth and Guardians that thrive beyond the light.'
};

export default function SeasonOnePage(){
 const progress=artProgress();
 const themes=['Ember','Tide','Bloom','Volt','Mystic','Shadow'];
 return <main className="shell season-one-page">
  <Link className="brand" href="/">✧ Nest<span>Rune</span></Link>

  <section className="season-one-hero">
   <div>
    <span className="eyebrow">SEASON ONE · THE FIRST FLIGHT</span>
    <h1>Meet the Guardians before you battle them.</h1>
    <p>Season One introduces 369 original Guardians across six fantasy Themes. Start with the strongest artwork, discover a Theme that fits you, then explore the roster twelve cards at a time.</p>
    <div className="actions">
     <Link className="gold" href="/join?ref=season-one">Join the free beta</Link>
     <Link className="outline" href="/play">Try Nest Battles</Link>
    </div>
   </div>
   <div className="season-one-numbers" aria-label="Season One overview">
    <div><strong>{progress.total}</strong><span>Guardians</span></div>
    <div><strong>6</strong><span>Themes</span></div>
    <div><strong>{progress.illustrated}</strong><span>Illustrated</span></div>
   </div>
  </section>

  <section className="season-theme-intro" aria-labelledby="season-theme-intro-title">
   <div className="season-section-heading">
    <span className="eyebrow">CHOOSE YOUR WORLD</span>
    <h2 id="season-theme-intro-title">Six Themes. Six different ways into NestRune.</h2>
    <p>You do not need to study all 369 cards. Pick a Theme first, then explore its Guardians in numerical order.</p>
   </div>
   <div className="season-theme-cards">
    {themes.map(theme=><Link href={'/themes/'+theme.toLowerCase()} className={'season-theme-card theme-'+theme.toLowerCase()} key={theme}>
     <ThemeEmblem theme={theme} size={34} label={false}/>
     <div><strong>{theme}</strong><p>{themeCopy[theme]}</p><small>{seasonManifest.filter(card=>card.theme===theme).length} Guardians</small></div>
    </Link>)}
   </div>
  </section>

  <LegendaryFlight/>
  <SeasonArtGallery/>
  <SeasonThemeBrowser/>

  <section className="season-one-cta">
   <div><span className="eyebrow">FOUNDING FLIGHT BETA</span><h2>Found a Guardian you like?</h2><p>Create a free beta account, open your first pack, build My Nest and take your Guardians into battle.</p></div>
   <div className="actions"><Link className="gold" href="/join?ref=season-one-bottom">Join the free beta</Link><Link className="outline" href="/rune-dungeon">Enter Rune Dungeon</Link></div>
  </section>

  <p className="season-one-review-note">Season One is still in development. Artwork, balance and release status may change before commercial launch.</p>
 </main>;
}
