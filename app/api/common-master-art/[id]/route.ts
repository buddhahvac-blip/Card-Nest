import {NextResponse} from 'next/server';

const remoteMasters: Record<string,{url:string;fallback:string}> = {
  "sproutling-001": {
    "url": "https://cdn.openart.ai/openart-uploads/production/attachment-transfers/60d19c5b7da02a8a2486dd574d45935bf40a153da137e01a5ba61c62759a6036.png",
    "fallback": "/cards/season-01/001/full-card.jpg"
  },
  "emberwing-002": {
    "url": "https://cdn.openart.ai/openart-uploads/production/attachment-transfers/c0fccc8453be3f00ad3508db3193a44aaec491ddd2d95449e3a89fdcca904688.png",
    "fallback": "/cards/season-01/002/full-card.jpg"
  },
  "tidefin-003": {
    "url": "https://cdn.openart.ai/openart-uploads/production/attachment-transfers/925808f7040084d43f68aca931356e68686a69b4b1cbdb0132e9d71e2da248b8.png",
    "fallback": "/cards/season-01/003/full-card.jpg"
  },
  "bloomtail-004": {
    "url": "https://cdn.openart.ai/openart-uploads/production/attachment-transfers/20fdd2acc21021b3accdbea1ea70eca5179c9fba36fd3c03150378cf30b197a7.png",
    "fallback": "/cards/season-01/004/full-card.jpg"
  },
  "voltbeak-005": {
    "url": "https://cdn.openart.ai/openart-uploads/production/attachment-transfers/bc49e5c57d20637ea7982cd5b901c1da73a7fb717f987d0990160bbc418efdee.png",
    "fallback": "/cards/season-01/005/full-card.jpg"
  },
  "mindfeather-006": {
    "url": "https://cdn.openart.ai/openart-uploads/production/attachment-transfers/dd71216f30034bf1a802e55a3b895e43b619cf5129b8d671e6f271d71015f104.png",
    "fallback": "/cards/season-01/006/full-card.jpg"
  },
  "shadowclaw-007": {
    "url": "https://cdn.openart.ai/openart-uploads/production/attachment-transfers/72e82c2a262370514f1c8e4cc933f5cbc7aa6c45e3950733e8cdb64932e1b1bf.png",
    "fallback": "/cards/season-01/007/full-card.jpg"
  },
  "reserved-008": {
    "url": "https://cdn.openart.ai/openart-uploads/production/attachment-transfers/5ededa7ae4c7cc0449a12f2de082a7d19e43714ff3a45050f20bc532c1fbe4f3.png",
    "fallback": "/cards/season-01/008/full-card.jpg"
  },
  "reserved-009": {
    "url": "https://cdn.openart.ai/openart-uploads/production/attachment-transfers/f153bcec8562e2c5596102b18baa0f90b8c981a90a49db98ed6d4fdcc2f57e82.png",
    "fallback": "/cards/season-01/009/full-card.jpg"
  },
  "reserved-010": {
    "url": "https://cdn.openart.ai/openart-uploads/production/attachment-transfers/0f16bad4dff373d3de84e84bfc581b601368327a665e4f9f53a9d41d846851cf.png",
    "fallback": "/cards/season-01/010/full-card.jpg"
  }
};

export const runtime='nodejs';

export async function GET(req:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const asset=remoteMasters[id];
  if(!asset)return new NextResponse('Not found',{status:404});
  try{
    const upstream=await fetch(asset.url,{cache:'force-cache',headers:{'User-Agent':'CardNest/1.0'}});
    const type=upstream.headers.get('content-type')||'';
    if(!upstream.ok||!type.startsWith('image/'))throw new Error('master fetch failed');
    const bytes=await upstream.arrayBuffer();
    return new NextResponse(bytes,{status:200,headers:{
      'Content-Type':type,
      'Cache-Control':'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
      'X-Content-Type-Options':'nosniff'
    }});
  }catch{
    return NextResponse.redirect(new URL(asset.fallback,req.url),307);
  }
}
