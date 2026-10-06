import {NextRequest} from 'next/server';
import commonMasterArt from '@/data/common-master-art.json';

export const runtime='nodejs';
export const dynamic='force-dynamic';

export async function GET(_request:NextRequest,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const source=(commonMasterArt as Record<string,string>)[id];
  if(!source)return new Response('Artwork not found',{status:404});

  try{
    const upstream=await fetch(source,{
      cache:'no-store',
      headers:{'User-Agent':'NestRune/1.0','Accept':'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'}
    });
    if(!upstream.ok)return new Response('Artwork unavailable',{status:upstream.status===404?404:502});

    const headers=new Headers();
    headers.set('Content-Type',upstream.headers.get('content-type')||'image/png');
    headers.set('Cache-Control','public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000');
    const length=upstream.headers.get('content-length');
    if(length)headers.set('Content-Length',length);
    const etag=upstream.headers.get('etag');
    if(etag)headers.set('ETag',etag);

    return new Response(upstream.body,{status:200,headers});
  }catch{
    return new Response('Artwork unavailable',{status:502});
  }
}
