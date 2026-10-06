import type {MetadataRoute} from 'next';
import {searchIndexingApproved,siteUrl} from '@/lib/site';

export default function robots():MetadataRoute.Robots{
 if(!searchIndexingApproved)return {
  rules:[{userAgent:'*',disallow:'/'}],
  sitemap:new URL('/sitemap.xml',siteUrl).toString(),
  host:siteUrl.origin
 };
 return {
  rules:[{userAgent:'*',allow:'/',disallow:['/api/','/admin/','/auth/','/studio']}],
  sitemap:new URL('/sitemap.xml',siteUrl).toString(),
  host:siteUrl.origin
 };
}
