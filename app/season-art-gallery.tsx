'use client';
import {useState} from 'react';
import Link from 'next/link';
import {showcaseCards} from '@/lib/showcase';
import {cardPath} from '@/lib/card-paths';
import ArtInspect from './art-inspect';

export default function SeasonArtGallery(){
 const [rarity,setRarity]=useState('all');const [sort,setSort]=useState('legendary');
 const rank:Record<string,number>={rare:1,epic:2,legendary:3};
 const cards=showcaseCards.filter(({card,art})=>art.reviewStatus==='founder-approved'&&(rarity==='all'||card.rarity===rarity)).sort((a,b)=>sort==='number'?a.card.cardNumber-b.card.cardNumber:(rank[b.card.rarity]||0)-(rank[a.card.rarity]||0)||a.card.cardNumber-b.card.cardNumber);
 return <section className="approved-art-gallery" aria-labelledby="approved-art-title"><span className="eyebrow">APPROVED SHOWCASE ART</span><h2 id="approved-art-title">Six windows into the First Flight.</h2><p>Look closer. Find the guardian whose world feels like yours.</p><div className="actions"><button className={rarity==='legendary'?'gold':'outline'} aria-pressed={rarity==='legendary'} onClick={()=>setRarity(rarity==='legendary'?'all':'legendary')}>Legendary only</button><label>Rarity <select aria-label="Showcase rarity" value={rarity} onChange={e=>setRarity(e.target.value)}><option value="all">All approved art</option><option value="legendary">Legendary</option><option value="epic">Epic</option><option value="rare">Rare</option></select></label><label>Sort <select aria-label="Sort showcase" value={sort} onChange={e=>setSort(e.target.value)}><option value="legendary">Legendary first</option><option value="number">Card number</option></select></label><span aria-live="polite">{cards.length} artworks</span></div><div className="showcase-grid">{cards.map(({card})=><article className="showcase-entry" key={card.id}><ArtInspect cardId={card.id}/><Link className="index-inspect" href={cardPath(card)}>Lore & profile · {card.name} ↗</Link></article>)}</div></section>;
}
