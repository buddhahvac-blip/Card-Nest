import type {MetadataRoute} from 'next';
import {seasonManifest} from '@/lib/season-manifest';
import {cardPath,themePath} from '@/lib/card-paths';
import {siteUrl} from '@/lib/site';

export default function sitemap():MetadataRoute.Sitemap{
 const now=new Date();
 const staticPaths=['/','/season-one','/guides','/about','/support','/feedback','/privacy','/terms','/refunds','/affiliate-disclosure'];
 const themes=['Ember','Tide','Bloom','Volt','Mystic','Shadow'];
 return [
  ...staticPaths.map(path=>({url:new URL(path,siteUrl).toString(),lastModified:now,changeFrequency:path==='/'?'weekly':'monthly' as const,priority:path==='/'?1:.65})),
  ...themes.map(theme=>({url:new URL(themePath(theme),siteUrl).toString(),lastModified:now,changeFrequency:'weekly' as const,priority:.75})),
  ...seasonManifest.map(card=>({url:new URL(cardPath(card),siteUrl).toString(),lastModified:now,changeFrequency:'monthly' as const,priority:card.artworkUrl ? .8 : .55}))
 ];
}
