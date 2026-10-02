import guides from '@/data/collector-guides.json';
import {notFound} from 'next/navigation';
import Link from 'next/link';

export function generateStaticParams(){return guides.map(g=>({slug:g.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const guide=guides.find(g=>g.slug===slug);return guide?{title:guide.title+' — CardNest',description:guide.summary}:{}}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const guide=guides.find(g=>g.slug===slug);if(!guide)notFound();return <main className="shell"><div className="eyebrow">CARDNEST COLLECTOR GUIDE · {guide.published}</div><h1 className="page-title">{guide.title}</h1><p className="intro">{guide.summary}</p><section className="panel">{guide.paragraphs.map((p,i)=><p key={i}>{p}</p>)}</section><p className="disclaimer">Educational information only. Verify current marketplace policies, prices, availability, grading standards, and seller terms before purchasing.</p><Link className="outline" href="/guides">← All collector guides</Link></main>}