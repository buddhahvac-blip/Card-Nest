import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {currentUser} from '@/lib/auth/server';
import {database} from '@/lib/postgres';
import {summarizePhysicalStock} from '@/lib/physical-stock';

export const runtime='nodejs';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Store Operations | NestRune',robots:{index:false,follow:false}};

type StockRow={
  sku:string;title:string;category:string;product_type:string;status:string;
  on_hand:number;reserved:number;low_stock_threshold:number;
};
type OrderRow={payment_status:string;fulfillment_status:string;total:number};

async function loadDashboard(){
  const {rows:[schema]}=await database().query<{products:boolean;orders:boolean}>(`
    SELECT to_regclass('cardnest_v1.physical_products') IS NOT NULL AS products,
           to_regclass('cardnest_v1.physical_orders') IS NOT NULL AS orders`);
  if(!schema?.products||!schema?.orders)return {configured:false as const,inventory:[] as StockRow[],orders:[] as OrderRow[]};
  const [stockResult,orderResult]=await Promise.all([
    database().query<StockRow>(`SELECT p.sku,p.title,p.category,p.product_type,p.status,
      COALESCE(s.on_hand,0)::int AS on_hand,COALESCE(s.reserved,0)::int AS reserved,
      p.low_stock_threshold FROM cardnest_v1.physical_products p
      LEFT JOIN cardnest_v1.physical_stock s ON s.sku=p.sku ORDER BY p.category,p.title LIMIT 200`),
    database().query<OrderRow>(`SELECT payment_status,fulfillment_status,COUNT(*)::int AS total
      FROM cardnest_v1.physical_orders GROUP BY payment_status,fulfillment_status ORDER BY payment_status,fulfillment_status`)
  ]);
  return {configured:true as const,inventory:stockResult.rows,orders:orderResult.rows};
}

const shell={maxWidth:1200,margin:'0 auto',padding:'36px 22px 70px'} as const;
const tile={border:'1px solid #477774',borderRadius:16,padding:20,background:'#092c33'} as const;
export default async function StoreOperations(){
  const user=await currentUser();
  if(!user||user.role!=='admin')notFound();
  const data=await loadDashboard();
  const stocks=data.inventory.map(p=>({...p,...summarizePhysicalStock({onHand:p.on_hand,reserved:p.reserved,lowStockThreshold:p.low_stock_threshold})}));
  const totalOnHand=stocks.reduce((n,p)=>n+p.on_hand,0);
  const totalAvailable=stocks.reduce((n,p)=>n+p.available,0);
  const low=stocks.filter(p=>p.isLow).length;
  const pending=data.orders.filter(o=>o.payment_status==='paid'&&!['shipped','delivered','cancelled','returned'].includes(o.fulfillment_status)).reduce((n,o)=>n+o.total,0);
  return <main style={{minHeight:'100vh',background:'linear-gradient(155deg,#041b22,#0b3440)',color:'#f5eddb',fontFamily:'Arial,Helvetica,sans-serif'}}>
    <div style={shell}>
      <div style={{fontSize:12,letterSpacing:2,color:'#d8b46d',fontWeight:700}}>NESTRUNE · OWNER OPERATIONS</div>
      <h1 style={{fontSize:'clamp(30px,5vw,48px)',margin:'12px 0'}}>Store command center</h1>
      <p style={{color:'#bdd3d0',lineHeight:1.6,maxWidth:800}}>Private overview for physical Pokémon and One Piece stock. Digital Guardian inventory is separate. Physical checkout remains disabled while release gates are tested.</p>
      <p style={{padding:14,border:'1px solid #b98a48',borderRadius:12,background:'#3b3123',lineHeight:1.5}}>
        <strong>Launch gate: closed.</strong> {data.configured?'The physical inventory schema is available; catalog import, secure checkout and order reconciliation still need verification.':'The physical inventory migration has not been applied. Do not interpret the zeros below as confirmed inventory.'}
      </p>
      <section aria-label="Store metrics" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,marginTop:22}}>
        <div style={tile}><small style={{color:'#b6cdc9'}}>Products loaded</small><h2 style={{fontSize:35,margin:'8px 0'}}>{data.configured?stocks.length:'—'}</h2></div>
        <div style={tile}><small style={{color:'#b6cdc9'}}>Physical units on hand</small><h2 style={{fontSize:35,margin:'8px 0'}}>{data.configured?totalOnHand:'—'}</h2></div>
        <div style={tile}><small style={{color:'#b6cdc9'}}>Available after reservations</small><h2 style={{fontSize:35,margin:'8px 0'}}>{data.configured?totalAvailable:'—'}</h2></div>
        <div style={tile}><small style={{color:'#b6cdc9'}}>Low / sold-out SKUs</small><h2 style={{fontSize:35,margin:'8px 0'}}>{data.configured?low:'—'}</h2></div>
        <div style={tile}><small style={{color:'#b6cdc9'}}>Paid orders awaiting fulfillment</small><h2 style={{fontSize:35,margin:'8px 0'}}>{data.configured?pending:'—'}</h2></div>
      </section>
      <section style={{...tile,marginTop:22}}>
        <h2 style={{fontSize:24,marginTop:0}}>Physical catalog and availability</h2>
        <p style={{color:'#b6cdc9'}}>Stock values come exclusively from the physical database schema, never from storefront illustrations or code constants.</p>
        {stocks.length===0?<p style={{padding:'16px 0',color:'#ead399'}}>No verified physical SKUs loaded yet. Confirm product variants and import counts before enabling any sales.</p>:
          <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',textAlign:'left',fontSize:14}}>
            <thead><tr>{['SKU / Product','Category','Status','On hand','Reserved','Available','Stock alert'].map(h=><th key={h} style={{padding:'12px 10px',borderBottom:'1px solid #6b8a83'}}>{h}</th>)}</tr></thead>
            <tbody>{stocks.map(p=><tr key={p.sku}>
              <td style={{padding:'12px 10px',borderBottom:'1px solid #2a5352'}}><strong>{p.title}</strong><div style={{color:'#a6c4c2',fontSize:11}}>{p.sku}</div></td>
              <td style={{padding:'12px 10px',borderBottom:'1px solid #2a5352'}}>{p.category}</td>
              <td style={{padding:'12px 10px',borderBottom:'1px solid #2a5352'}}>{p.status}</td>
              <td style={{padding:'12px 10px',borderBottom:'1px solid #2a5352'}}>{p.on_hand}</td>
              <td style={{padding:'12px 10px',borderBottom:'1px solid #2a5352'}}>{p.reserved}</td>
              <td style={{padding:'12px 10px',borderBottom:'1px solid #2a5352'}}>{p.available}</td>
              <td style={{padding:'12px 10px',borderBottom:'1px solid #2a5352',color:p.isLow?'#f2c477':'#b8e2c0'}}>{p.isSoldOut?'Sold out':p.isLow?'Low':'OK'}</td>
            </tr>)}</tbody>
          </table></div>}
      </section>
      <section style={{...tile,marginTop:18}}>
        <h2 style={{fontSize:23,marginTop:0}}>Release operations</h2>
        <p style={{color:'#c7d9d4',lineHeight:1.7}}>Before processing purchases: approve SKU photos and prices, apply and review the physical-store migration, import verified quantities, implement Stripe test-mode checkout with atomic stock reservation, validate shipping and tax estimates, and test webhook reconciliation. External livestream sales must be deducted through an audited stock adjustment.</p>
        <p style={{color:'#c7d9d4',marginBottom:0}}>This is a read-only first version. Editing stock, refunds, payments and order fulfillment are intentionally not exposed without complete authorization and audit checks.</p>
      </section>
    </div>
  </main>;
}
