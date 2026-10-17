import Link from 'next/link';
import {redirect} from 'next/navigation';
import {studioOwner} from '@/lib/studio-auth';
import {physicalEtbs,totalInventoryCostCents,individualGrossMarginCents,fullCollectionRegularCents,approvedFullCollectionBundleCents} from '@/lib/physical-catalog';

export const dynamic='force-dynamic';
const money=(cents:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);

export default async function PhysicalInventoryDashboard(){
  const owner=await studioOwner();
  if(!owner)redirect('/auth');
  const units=physicalEtbs.reduce((sum,item)=>sum+item.quantity,0);
  return <main className="shell" style={{maxWidth:1100,paddingTop:42}}>
    <Link href="/" className="brand">✧ NestRune</Link>
    <p className="eyebrow" style={{marginTop:28}}>Founder only · physical inventory</p>
    <h1 className="page-title">Pokémon Shop Dashboard</h1>
    <p className="intro">Private inventory cost and pricing snapshot. These figures are estimates at asking prices, not completed sales or realized profits. Physical checkout is not yet enabled.</p>
    <div className="stats">
      <section className="stat"><span>Reported sealed boxes</span><strong>{units}</strong><span>Stock not yet reconciled to sales</span></section>
      <section className="stat"><span>Total acquisition cost</span><strong>{money(totalInventoryCostCents)}</strong><span>Includes purchase taxes and fees reported by owner</span></section>
      <section className="stat"><span>Potential gross profit</span><strong>{money(individualGrossMarginCents)}</strong><span>Before payment fees, packaging, postage, refunds and other costs</span></section>
    </div>
    <section className="panel" style={{overflowX:'auto'}}>
      <h2>Inventory and price margins</h2>
      <table style={{width:'100%',borderCollapse:'collapse',marginTop:20,textAlign:'left',minWidth:680}}>
        <thead><tr>{['ETB','Reported qty','Cost each','Asking each','Gross profit each','Gross margin'].map(h=><th key={h} scope="col" style={{padding:'12px 8px',borderBottom:'1px solid #65736e'}}>{h}</th>)}</tr></thead>
        <tbody>{physicalEtbs.map(item=>{
          const profit=item.priceCents-item.costCents;
          return <tr key={item.id}>
            <th scope="row" style={{padding:'13px 8px',borderBottom:'1px solid #405550'}}>{item.name}</th>
            <td style={{padding:8}}>{item.quantity}</td><td style={{padding:8}}>{money(item.costCents)}</td>
            <td style={{padding:8}}>{money(item.priceCents)}</td><td style={{padding:8}}>{money(profit)}</td>
            <td style={{padding:8}}>{(100*profit/item.priceCents).toFixed(1)}%</td>
          </tr>;
        })}</tbody>
      </table>
    </section>
    <section className="panel" style={{marginTop:20}}>
      <h2>Collection bundle review</h2>
      <p>Individual listing total: <strong>{money(fullCollectionRegularCents)}</strong></p>
      <p>Owner-selected whole-collection asking price: <strong>{money(approvedFullCollectionBundleCents)}</strong></p>
      <p>Difference: <strong>{money(approvedFullCollectionBundleCents-fullCollectionRegularCents)} higher</strong> than buying individually. Do not advertise as a discount.</p>
      <p>Potential bundle gross profit before selling expenses: <strong>{money(approvedFullCollectionBundleCents-totalInventoryCostCents)}</strong>.</p>
    </section>
    <section className="notice" style={{marginTop:24}}>
      <strong>Sales tracking not connected.</strong> Completed sales: unavailable (not zero). Inventory quantities are manually reported, not automatically decremented. A secure order ledger, fulfillment records, verified carrier rates, and refund accounting must be added before this dashboard can report realized profit or live stock.
    </section>
    <Link className="outline" href="/shop">View customer shop preview</Link>
  </main>;
}
