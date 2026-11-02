'use client';

import {useState} from 'react';

type Item = {name:string;quantity:number;detail:string;sku:string};
type Group = {id:'sealed'|'boosters'|'graded';title:string;items:Item[];description:string};
type Filter = 'all'|'sealed'|'boosters'|'graded';

function inquiry(name:string){
  return 'mailto:cardnestsupport@gmail.com?subject='+
    encodeURIComponent('NestRune One Piece collectible inquiry: '+name)+
    '&body='+encodeURIComponent('Hello NestRune, please confirm current availability, exact item photos, condition, price, shipping from Hawaiʻi, taxes and terms for '+name+'.');
}
function total(items:Item[]){return items.reduce((sum,item)=>sum+item.quantity,0);}

const spriteRows: Record<string, {columns:number; index:number; row:number}> = {
  'OP-ILL-KID-KILLER':{columns:3,index:0,row:0},
  'OP-ILL-RAYLEIGH-SHAKUYAKU':{columns:3,index:1,row:0},
  'OP-ST-34':{columns:3,index:2,row:0},
  'OP-16-EN':{columns:6,index:0,row:1},
  'EB-04-JP':{columns:6,index:1,row:1},
  'OP-15-JP':{columns:6,index:2,row:1},
  'OP-09-JP':{columns:6,index:3,row:1},
  'OP-17-JP':{columns:6,index:4,row:1},
  'OPC-01-JP':{columns:6,index:5,row:1},
  'OP-SLAB-BACCARAT':{columns:5,index:0,row:2},
  'OP-SLAB-CAMIE':{columns:5,index:1,row:2},
  'OP-SLAB-DON':{columns:5,index:2,row:2},
  'OP-SLAB-BELLMERE':{columns:5,index:3,row:2},
  'OP-SLAB-TEACH':{columns:5,index:4,row:2}
};
function spriteStyle(sku:string):React.CSSProperties {
  const p=spriteRows[sku];
  if(!p)return {};
  return {
    backgroundImage:"url('/one-piece-collectibles/draft-products.webp')",
    backgroundSize:(p.columns*100)+'% 300%',
    backgroundPosition:(p.index*100/(p.columns-1))+'% '+(p.row*50)+'%',
    backgroundRepeat:'no-repeat'
  };
}

export default function OnePieceCatalog({groups}:{groups:Group[]}){
  const [filter,setFilter]=useState<Filter>('all');
  const all=groups.reduce((sum,group)=>sum+total(group.items),0);
  const tabs:{id:Filter;label:string;count:number}[]=[
    {id:'all',label:'All Items',count:all},
    {id:'sealed',label:'Sealed Products',count:total(groups[0].items)},
    {id:'boosters',label:'Booster Packs',count:total(groups[1].items)},
    {id:'graded',label:'Graded Cards',count:total(groups[2].items)}
  ];
  return <>
    <nav className="op-filters" aria-label="Filter One Piece products">
      {tabs.map(tab=><button type="button" key={tab.id} className={filter===tab.id?'op-filter selected':'op-filter'} aria-pressed={filter===tab.id} onClick={()=>setFilter(tab.id)}>{tab.label} <span>({tab.count})</span></button>)}
    </nav>
    <div id="catalog" className="op-catalog">
      {groups.filter(group=>filter==='all'||filter===group.id).map(group=>
        <section className={'op-collection op-collection-'+group.id} id={group.id} key={group.id} aria-label={group.title}>
          <div className="op-section-heading">
            <span className="op-heading-symbol" aria-hidden="true">{group.id==='sealed'?'♧':group.id==='boosters'?'▧':'◇'}</span>
            <h2>{group.title} <span>({total(group.items)})</span></h2>
            <div className="op-heading-line"/>
          </div>
          <p className="op-section-description">{group.description}</p>
          <div className={'op-products op-products-'+group.id}>
            {group.items.map(item=><article className="op-product" key={item.sku}>
              <div className="op-product-image">
                <div className="op-sprite-art" style={spriteStyle(item.sku)}
                  role="img" aria-label={item.name+' — AI-drafted product illustration, not an actual item photo or verified packaging'} />
                <span className="op-image-tag">AI illustration</span>
              </div>
              <div className="op-product-copy">
                <h3>{item.name}</h3>
                <p>{item.detail}</p>
                <span className="op-quantity">Qty: {item.quantity}</span>
                {group.id==='sealed'?<a className="op-inquiry" href={inquiry(item.name)}>Inquiry Only ↗</a>:
                  <a className="op-inquiry op-inquiry-small" href={inquiry(item.name)}>Request Details ↗</a>}
              </div>
            </article>)}
          </div>
        </section>
      )}
    </div>
    <div className="op-catalog-summary">
      <span><strong>{all}</strong> identified items</span>
      <span>Approximately 26 raw cards being cataloged — not listed</span>
      <a href={inquiry('general One Piece inventory')}>Inquiry Only · Not Currently for Sale ↗</a>
    </div>
  </>;
}
