'use client';
import PackStore from '../pack-store';
export default function ResponsiveReview(){return <main style={{padding:20,display:'flex',gap:30,alignItems:'flex-start'}}>{[390,320].map(width=><div key={width} style={{width,flexShrink:0}}><h1>{width}px storefront quality review</h1><PackStore busy={false} onPreview={()=>{}} onFree={()=>{}}/></div>)}</main>}
