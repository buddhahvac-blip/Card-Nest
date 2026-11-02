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
                <img src={'/one-piece-collectibles/illustrations/'+encodeURIComponent(item.sku)}
                  alt={item.name+' — AI-created illustration; not a photograph of this item'} width={700} height={500} loading="lazy" />
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
