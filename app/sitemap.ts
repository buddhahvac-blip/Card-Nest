import type {MetadataRoute} from 'next';
import {seasonManifest} from '@/lib/season-manifest';
import {cardPath,themePath} from '@/lib/card-paths';
import {siteUrl} from '@/lib/site';

export default function sitemap():MetadataRoute.Sitemap{
 const now=new Date();
 const items:MetadataRoute.Sitemap=[];
 const staticPaths=['/','/season-one','/guides','/about','/support','/feedback','/privacy','/terms','/refunds','/affiliate-disclosure','/founders'];
 const themes=['Ember','Tide','Bloom','Volt','Mystic','Shadow'];
 for(const path of staticPaths)items.push({url:new URL(path,siteUrl).toString(),lastModified:now,changeFrequency:path==='/'?'weekly':'monthly',priority:path==='/'?1:.65});
 for(const theme of themes)items.push({url:new URL(themePath(theme),siteUrl).toString(),lastModified:now,changeFrequency:'weekly',priority:.75});
 for(const card of seasonManifest)items.push({url:new URL(cardPath(card),siteUrl).toString(),lastModified:now,changeFrequency:'monthly',priority:card.artworkUrl ? 0.8 : 0.55});
 return items;
}
