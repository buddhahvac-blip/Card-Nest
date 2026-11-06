import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {currentUser} from '@/lib/auth/server';
import {database} from '@/lib/postgres';
import {summarizePhysicalStock} from '@/lib/physical-stock';
import InventoryTable,{type InventoryItem} from './inventory-table';
import StockAdjustmentForm from './stock-adjustment-form';
import ProductIntake from './product-intake';

export const runtime='nodejs';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Store Operations | NestRune',robots:{index:false,follow:false}};

type StockRow={
  sku:string;title:string;category:string;product_type:string;status:string;listing_verified:boolean;
  on_hand:number;reserved:number;low_stock_threshold:number;
  unit_price_cents:number|null;unit_cost_cents:number|null;
};
type OrderRow={payment_status:string;fulfillment_status:string;source:string;total:number};
type MovementRow={sku:string;title:string;delta:number;reason:string;source:string;external_id:string;occurred_hst:string};
type SummaryRow={paid_total_cents:string;paid_count:number};

async function loadDashboard(){
  const {rows:[schema]}=await database().query<{products:boolean;orders:boolean}>(`
    SELECT to_regclass('cardnest_v1.physical_products') IS NOT NULL AS products,
           to_regclass('cardnest_v1.physical_orders') IS NOT NULL AS orders`);
  if(!schema?.products||!schema?.orders)return {
    configured:false as const,inventory:[] as StockRow[],orders:[] as OrderRow[],
    movements:[] as MovementRow[],summary:{paid_total_cents:'0',paid_count:0} as SummaryRow
  };
  const [stockResult,orderResult,historyResult,summaryResult]=await Promise.all([
    database().query<StockRow>(`SELECT p.sku,p.title,p.category,p.product_type,p.status,p.listing_verified,
      p.unit_price_cents,p.unit_cost_cents,
      COALESCE(s.on_hand,0)::int AS on_hand,COALESCE(s.reserved,0)::int AS reserved,
      p.low_stock_threshold FROM cardnest_v1.physical_products p
      LEFT JOIN cardnest_v1.physical_stock s ON s.sku=p.sku
      ORDER BY p.category,p.title LIMIT 500`),
    database().query<OrderRow>(`SELECT payment_status,fulfillment_status,source,COUNT(*)::int AS total
      FROM cardnest_v1.physical_orders GROUP BY payment_status,fulfillment_status,source
      ORDER BY payment_status,fulfillment_status,source`),
    database().query<MovementRow>(`SELECT m.sku,p.title,m.delta,m.reason,m.source,m.external_id,
      to_char(m.created_at AT TIME ZONE 'Pacific/Honolulu','YYYY-MM-DD HH24:MI') AS occurred_hst
      FROM cardnest_v1.physical_stock_movements m
      JOIN cardnest_v1.physical_products p ON p.sku=m.sku
      ORDER BY m.created_at DESC LIMIT 30`),
    database().query<SummaryRow>(`SELECT
      COALESCE(SUM(subtotal_cents+shipping_cents+tax_cents) FILTER (WHERE payment_status='paid'),0)::text AS paid_total_cents,
      COUNT(*) FILTER (WHERE payment_status='paid')::int AS paid_count
      FROM cardnest_v1.physical_orders`)
  ]);
  return {configured:true as const,inventory:stockResult.rows,orders:orderResult.rows,
    movements:historyResult.rows,summary:summaryResult.rows[0]};
}

const shell={maxWidth:1260,margin:'0 auto',padding:'36px clamp(15px,3vw,36px) 70px'} as const;
const tile={border:'1px solid #477774',borderRadius:16,padding:20,background:'#092c33'} as const;
function dollars(cents:number){return new Intl.NumberFormat('en-US',{currency:'USD',style:'currency'}).format(cents/100)}
export default async function StoreOperations(){
  const user=await currentUser();
  if(!user||user.role!=='admin')notFound();
  const data=await loadDashboard();
  const stocks:InventoryItem[]=data.inventory.map(p=>({
    ...p,...summarizePhysicalStock({onHand:p.on_hand,reserved:p.reserved,lowStockThreshold:p.low_stock_threshold})
  }));
  const unitsOnHand=stocks.reduce((n,p)=>n+p.on_hand,0);
  const available=stocks.reduce((n,p)=>n+p.available,0);
  const low=stocks.filter(p=>p.isLow).length;
  const pending=data.orders.filter(o=>o.payment_status==='paid'&&!['shipped','delivered','cancelled','returned'].includes(o.fulfillment_status)).reduce((n,o)=>n+o.total,0);
  const unverified=stocks.filter(p=>!p.listing_verified||p.unit_price_cents===null).length;
  return <main style={{minHeight:'100vh',background:'linear-gradient(155deg,#041b22,#0b3440)',color:'#f5eddb',fontFamily:'Arial,Helvetica,sans-serif'}}>
    <div style={shell}>
      <div style={{fontSize:12,letterSpacing:2,color:'#d8b46d',fontWeight:700}}>NESTRUNE · OWNER OPERATIONS</div>
      <h1 style={{fontSize:'clamp(30px,5vw,48px)',margin:'12px 0'}}>Store command center</h1>
      <p style={{color:'#bdd3d0',lineHeight:1.6,maxWidth:850}}>Private Pokémon and One Piece inventory, order and movement records. Digital Guardian gameplay and purchases stay separate from this physical store dashboard.</p>
      <p role="status" style={{padding:16,border:'1px solid #b98a48',borderRadius:12,background:'#3b3123',lineHeight:1.6}}>
        <strong>Physical checkout: disabled.</strong> {data.configured?
          'Dedicated stock records are available. Product verification, secure checkout, payment reconciliation and shipping tests must pass before launch.':
          'Physical inventory tables have not been migrated. The indicators below are unavailable, not zero inventory.'}
      </p>
      <section aria-label="Store metrics" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:12,marginTop:22}}>
        <div style={tile}><small style={{color:'#b6cdc9'}}>Tracked SKUs</small><h2 style={{fontSize:33,margin:'8px 0'}}>{data.configured?stocks.length:'—'}</h2></div>
        <div style={tile}><small style={{color:'#b6cdc9'}}>On hand</small><h2 style={{fontSize:33,margin:'8px 0'}}>{data.configured?unitsOnHand:'—'}</h2></div>
        <div style={tile}><small style={{color:'#b6cdc9'}}>Available after holds</small><h2 style={{fontSize:33,margin:'8px 0'}}>{data.configured?available:'—'}</h2></div>
        <div style={tile}><small style={{color:'#b6cdc9'}}>Low / sold-out SKUs</small><h2 style={{fontSize:33,margin:'8px 0'}}>{data.configured?low:'—'}</h2></div>
        <div style={tile}><small style={{color:'#b6cdc9'}}>Unverified / unpriced SKUs</small><h2 style={{fontSize:33,margin:'8px 0'}}>{data.configured?unverified:'—'}</h2></div>
        <div style={tile}><small style={{color:'#b6cdc9'}}>Paid orders to fulfill</small><h2 style={{fontSize:33,margin:'8px 0'}}>{data.configured?pending:'—'}</h2></div>
        <div style={tile}><small style={{color:'#b6cdc9'}}>Recorded paid order value*</small><h2 style={{fontSize:33,margin:'8px 0'}}>{data.configured?dollars(Number(data.summary.paid_total_cents)):'—'}</h2></div>
      </section>
      <p style={{color:'#a8c4c0',fontSize:12,margin:'10px 0 24px'}}>*Tracked physical orders only. Includes tax and shipping, excludes external marketplace revenue and payment fees. Not net profit.</p>
      {data.configured&&stocks.length>0&&low>0&&<aside style={{...tile,borderColor:'#b98a48',background:'#372e24',marginBottom:20}}>
        <strong style={{color:'#f6d298'}}>Attention: {low} SKU{low===1?'':'s'} low or sold out</strong>
        <p style={{marginBottom:0,color:'#e2d7c3'}}>Restock or update the low-stock threshold after verifying your physical count.</p>
      </aside>}
      {data.configured?<InventoryTable items={stocks}/>:<section style={tile}>
        <h2 style={{marginTop:0}}>Inventory not connected yet</h2>
        <p style={{color:'#bdd3d0'}}>The protected operations interface is built, but the review-only physical-commerce migration and verified SKU import have not been applied. No live stock is being altered.</p>
      </section>}
      {data.configured&&<ProductIntake/>}
      {data.configured&&<StockAdjustmentForm products={stocks.map(p=>({sku:p.sku,title:p.title,available:p.available}))}/>}
      <section aria-labelledby="order-overview" style={{...tile,marginTop:22}}>
        <h2 id="order-overview" style={{fontSize:24,marginTop:0}}>Order and fulfillment overview</h2>
        <p style={{color:'#bdd3d0'}}>Summary of physical order records only; digital pack purchases and standalone marketplace activity are excluded.</p>
        {data.orders.length===0?<p style={{color:'#e9d298'}}>No physical orders have been recorded in this database.</p>:
          <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13,textAlign:'left'}}>
            <thead><tr>{['Channel','Payment','Fulfillment','Orders'].map(h=><th key={h} scope="col" style={{padding:11,borderBottom:'1px solid #5b8681'}}>{h}</th>)}</tr></thead>
            <tbody>{data.orders.map((o,i)=><tr key={i}>
              <td style={{padding:11,borderBottom:'1px solid #295454'}}>{o.source}</td>
              <td style={{padding:11,borderBottom:'1px solid #295454'}}>{o.payment_status}</td>
              <td style={{padding:11,borderBottom:'1px solid #295454'}}>{o.fulfillment_status}</td>
              <td style={{padding:11,borderBottom:'1px solid #295454'}}>{o.total}</td>
            </tr>)}</tbody>
          </table></div>}
      </section>
      <section aria-labelledby="movement-history" style={{...tile,marginTop:18}}>
        <h2 id="movement-history" style={{fontSize:24,marginTop:0}}>Recent inventory movements</h2>
        <p style={{color:'#bdd3d0'}}>Last 30 logged changes, with references to prevent duplicate deductions. Timestamps use Hawaiʻi Standard Time.</p>
        {data.movements.length===0?<p style={{color:'#e9d298'}}>No audited physical stock movements recorded yet.</p>:
          <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13,textAlign:'left'}}>
            <thead><tr>{['HST','Product','Movement','Units','Source','Reference'].map(h=><th key={h} scope="col" style={{padding:11,borderBottom:'1px solid #5b8681'}}>{h}</th>)}</tr></thead>
            <tbody>{data.movements.map((m,i)=><tr key={i}>
              <td style={{padding:11,borderBottom:'1px solid #295454',whiteSpace:'nowrap'}}>{m.occurred_hst}</td>
              <td style={{padding:11,borderBottom:'1px solid #295454'}}>{m.title}<div style={{color:'#a9c5c1'}}>{m.sku}</div></td>
              <td style={{padding:11,borderBottom:'1px solid #295454'}}>{m.reason.replaceAll('_',' ')}</td>
              <td style={{padding:11,borderBottom:'1px solid #295454',color:m.delta<0?'#ffc0a7':'#b9edc6'}}>{m.delta>0?'+':''}{m.delta}</td>
              <td style={{padding:11,borderBottom:'1px solid #295454'}}>{m.source}</td>
              <td style={{padding:11,borderBottom:'1px solid #295454',overflowWrap:'anywhere'}}>{m.external_id}</td>
            </tr>)}</tbody>
          </table></div>}
      </section>
      <section style={{...tile,marginTop:18}}>
        <h2 style={{fontSize:23,marginTop:0}}>Release operations</h2>
        <p style={{color:'#c7d9d4',lineHeight:1.7}}>Still required: verify exact product identities, photos and selling prices; review and apply the physical-stock migration; import counted inventory; test checkout with Stripe test mode, warehouse stock reservations, shipping and taxes; and confirm webhook settlement. Until then the public collectible pages stay inquiry-only.</p>
        <p style={{color:'#c7d9d4',marginBottom:0}}>Inventory adjustments above become available only after verified SKUs exist. All changes require admin login, a unique reference, and a server-verified stock transaction.</p>
      </section>
    </div>
  </main>;
}
