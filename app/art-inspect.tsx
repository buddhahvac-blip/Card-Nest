'use client';
import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {Dialog,DialogTrigger,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {seasonCard} from '@/lib/season-manifest';
import {showcaseFor} from '@/lib/showcase';
import {cardPath} from '@/lib/card-paths';
import ShowcaseCard from './showcase-card';

export default function ArtInspect({cardId,large=false}:{cardId:string;large?:boolean}){
 const [zoom,setZoom]=useState(false);
 const card=seasonCard(cardId)!;const art=showcaseFor(cardId);if(!art)return null;
 return <Dialog onOpenChange={()=>setZoom(false)}><DialogTrigger asChild><button className="art-inspect-trigger" aria-label={`Zoom artwork: ${card.name}`}><ShowcaseCard card={card} large={large}/><span className="zoom-hint">Inspect artwork ↗</span></button></DialogTrigger><DialogContent className="art-zoom-dialog"><DialogTitle>{card.name} · CN1-{String(card.cardNumber).padStart(3,'0')}</DialogTitle><DialogDescription>Founder-approved artwork · {card.theme} · {card.battleClass} · Unreleased</DialogDescription><div className="actions"><button className="outline" aria-pressed={zoom} onClick={()=>setZoom(!zoom)}>{zoom?'Fit artwork':'View native detail'}</button><Link className="outline" href={cardPath(card)}>Lore & battle profile ↗</Link></div><div className={`art-zoom-scroll ${zoom?'native':''}`} tabIndex={0} aria-label="Artwork viewer; scroll to explore native detail"><Image src={art.artworkUrl} width={art.width} height={art.height} quality={95} unoptimized={zoom} sizes="(max-width: 700px) 90vw, 900px" alt={`${card.name} in ${card.habitat}`} style={zoom?{width:art.width,maxWidth:'none'}:undefined}/></div></DialogContent></Dialog>;
}
