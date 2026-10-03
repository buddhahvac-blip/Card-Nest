import records from '../data/season-one-showcase.json';
import {seasonManifest} from './season-manifest';

export const showcaseArt=records;
export const showcaseFor=(id:string)=>records.find(x=>x.cardId===id);
export const showcaseCards=records.map(art=>({art,card:seasonManifest.find(c=>c.id===art.cardId)!}));
