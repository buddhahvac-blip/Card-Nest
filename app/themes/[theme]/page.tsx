import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {seasonOneThemes,seasonOneCardsForTheme,isSeasonOneTheme,type SeasonOneTheme} from '@/lib/season-one-view';
import {cardPath,slugify} from '@/lib/card-paths';

export function generateStaticParams(){return seasonOneThemes.map(theme=>({theme:slugify(theme)}))}

function resolveTheme(slug:string):SeasonOneTheme|undefined{
 const match=seasonOneThemes.find(theme=>slugify(theme)===slug);
 return match&&isSeasonOneTheme(match)?match:undefined;
}

export async function generateMetadata({params}:{params:Promise<{theme:string}>}):Promise<Metadata>{
 const {theme:slug}=await params;const theme=resolveTheme(slug);if(!theme)return {};
 return {title:`${theme} Theme Guardians`,description:`Explore ${theme} Theme guardians from NestRune Season One: The First Flight.`,alternates:{canonical:`/themes/${slug}`}};
}

export default async function ThemePage({params}:{params:Promise<{theme:string}>}){
 const {theme:slug}=await params;const theme=resolveTheme(slug);if(!theme)notFound();
 const cards=seasonOneCardsForTheme(theme);
 return <main className="shell">
  <Link className="brand" href="/">✧ Nest<span>Rune</span></Link>
  <div className="eyebrow">SEASON ONE · {theme.toUpperCase()} THEME</div>
  <h1 className="page-title">{theme} guardians</h1>
  <p className="intro">Explore every {theme} Theme guardian concept currently defined for The First Flight. Theme describes the visual world around a guardian, not its species or battle class.</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
   {cards.map(card=><Link key={card.id} className="outline" href={cardPath(card)}>CN1-{String(card.cardNumber).padStart(3,'0')} · {card.name} · {card.rarity}</Link>)}
  </div>
  <div className="actions" style={{marginTop:24}}><Link className="gold" href="/season-one">View all Season One</Link><Link className="outline" href="/">Return to NestRune</Link></div>
 </main>;
}
