'use client';
import Image from 'next/image';
import {Flame,Droplets,Leaf,Zap,Sparkles,Moon,Wind,Swords,Shield,ShieldCheck,HeartPulse,CircleDashed} from 'lucide-react';
import type {SeasonCard} from '@/lib/season-manifest';
import {showcaseFor} from '@/lib/showcase';

const themeIcons={Ember:Flame,Tide:Droplets,Bloom:Leaf,Volt:Zap,Mystic:Sparkles,Shadow:Moon};
const classIcons={Scout:Wind,Striker:Swords,Vanguard:Shield,Warden:ShieldCheck,Support:HeartPulse,Disruptor:CircleDashed};
export default function ShowcaseCard({card,large=false}:{card:SeasonCard;large?:boolean}){
 const art=showcaseFor(card.id);if(!art)return null;
 const Theme=themeIcons[card.theme as keyof typeof themeIcons];const Class=classIcons[card.battleClass as keyof typeof classIcons];
 return <div className={`showcase-card rarity-${card.rarity}`}>
  <div className="showcase-card-meta"><span>CN1-{String(card.cardNumber).padStart(3,'0')}</span><span>{card.rarity}</span></div>
  <div className="showcase-illustration"><Image src={art.artworkUrl} quality={95} width={art.width} height={art.height} sizes={large?'(max-width: 700px) 90vw, 520px':'(max-width: 600px) 88vw, (max-width: 1000px) 42vw, 360px'} alt={`${card.name}, ${card.creatureType} in ${card.habitat}; founder-approved source artwork`}/></div>
  <div className="showcase-badges"><span title={`Theme icon: ${card.themeIconKey}`}><Theme size={15}/>{card.theme} Theme</span><span title={`Class icon: ${card.battleClassIconKey}`}><Class size={15}/>{card.battleClass}</span></div>
  <div className="showcase-card-copy"><h3>{card.name}</h3><p>{card.habitat}</p><dl>{[['HP',card.health],['ATK',card.attack],['DEF',card.defense],['SPD',card.speed]].map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><small>THE FIRST FLIGHT · APPROVED ART</small></div>
 </div>;
}
