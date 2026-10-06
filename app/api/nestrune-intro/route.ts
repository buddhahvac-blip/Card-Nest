import {NextRequest} from 'next/server';

const SOURCE='https://cdn.openart.ai/openart-uploads/production/attachment-transfers/96fcf5eb06b053081fd6542aaa0416b026035e80615bb55f0babc7a1d5bb2994.mp4';

export const runtime='nodejs';
export const dynamic='force-dynamic';

export async function GET(request:NextRequest){
  const range=request.headers.get('range');
  const headers=new Headers();
  if(range) headers.set('Range',range);
  headers.set('User-Agent','NestRune/1.0');
  const upstream=await fetch(SOURCE,{headers,cache:'no-store'});
  if(!upstream.ok && upstream.status!==206){
    return new Response('NestRune cinematic unavailable',{status:502});
  }
  const responseHeaders=new Headers();
  responseHeaders.set('Content-Type',upstream.headers.get('content-type')||'video/mp4');
  responseHeaders.set('Accept-Ranges',upstream.headers.get('accept-ranges')||'bytes');
  responseHeaders.set('Cache-Control','public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
  for(const key of ['content-length','content-range','etag','last-modified']){
    const value=upstream.headers.get(key);
    if(value) responseHeaders.set(key,value);
  }
  return new Response(upstream.body,{status:upstream.status===206?206:200,headers:responseHeaders});
}
