import type {MetadataRoute} from 'next';
import {hasSeasonArtwork,seasonManifest} from '@/lib/season-manifest';
import {cardPath,themePath} from '@/lib/card-paths';
import {siteUrl} from '@/lib/site';

export default function sitemap():MetadataRoute.Sitemap{
 const now=new Date();
 const items:MetadataRoute.Sitemap=[];
 const staticPaths=[
  ['/',1,'daily'],
  ['/join',.95,'weekly'],
  ['/digital-card-game',.95,'weekly'],
  ['/season-one',.9,'weekly'],
  ['/play',.9,'weekly'],
  ['/rune-dungeon',.9,'weekly'],
  ['/guides',.7,'weekly'],
  ['/about',.65,'monthly'],
  ['/showcase',.6,'weekly'],
  ['/founders',.55,'monthly']
 ] as const;
 const themes=['Ember','Tide','Bloom','Volt','Mystic','Shadow'];
 for(const [path,priority,changeFrequency] of staticPaths)items.push({
  url:new URL(path,siteUrl).toString(),lastModified:now,changeFrequency,priority
 });
 for(const theme of themes)items.push({
  url:new URL(themePath(theme),siteUrl).toString(),lastModified:now,changeFrequency:'weekly',priority:.72
 });
 for(const card of seasonManifest.filter(hasSeasonArtwork))items.push({
  url:new URL(cardPath(card),siteUrl).toString(),lastModified:now,changeFrequency:'monthly',priority:.55
 });
 return items;
}
