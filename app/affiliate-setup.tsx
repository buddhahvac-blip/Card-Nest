'use client';
import programs from '@/data/affiliate-programs.json';
import {ExternalLink,Clock,ShieldCheck} from 'lucide-react';

export default function AffiliateSetup(){
 return <section>
  <div className="eyebrow">FOUNDER WORKSPACE · AFFILIATE APPLICATIONS</div>
  <h1 className="page-title">Affiliate setup</h1>
  <p className="intro">Apply from the official program pages below. Approval and NestRune activation are two separate steps: a partner must accept NestRune first, then the exact network-generated links are added to protected deployment settings.</p>
  <div className="notice"><strong>Do not paste passwords, tax IDs, bank details, or affiliate-network credentials into GitHub or chat.</strong> After approval, only the generated public affiliate links or non-secret partner IDs should be added to NestRune.</div>
  <div className="agent-list">{programs.programs.map(p=><article className="panel" key={p.id}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><span className="tag">{p.network}</span><span className="tag">{p.status.replaceAll('-',' ').toUpperCase()}</span></div>
    <h2>{p.name}</h2>
    <p><strong>Best use:</strong> {p.fit}</p>
    <p><Clock size={15} style={{display:'inline',verticalAlign:'-2px'}}/> <strong>Approval timing:</strong> {p.officialTiming}</p>
    <p className="disclaimer">{p.planningBuffer}</p>
    <p>{p.notes}</p>
    <a className="gold" href={p.applicationUrl} target="_blank" rel="noopener noreferrer">Open official application <ExternalLink size={15}/></a>
  </article>)}</div>
  <section className="panel" style={{marginTop:24}}>
    <ShieldCheck size={22}/>
    <h2>What happens after approval</h2>
    <p>Send only the approved public tracking links or partner-generated product links. NestRune will validate partner domains, show the required commission disclosure, keep third-party products separate from NestRune originals, and activate only the approved partner.</p>
  </section>
 </section>
}
