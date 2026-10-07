'use client';
import {useMemo,useState} from 'react';
import {Search,Check,Sparkles,ArrowRight,Crown} from 'lucide-react';
import {seasonManifest,artProgress,hasSeasonArtwork,hasApprovedShowcaseArt} from '@/lib/season-manifest';
import {GuardianCard} from './cards';
import LegendaryFlight from './legendary-flight';
import {Progress} from '@/components/ui/progress';
import ThemeEmblem from './theme-emblem';

const themes=['Ember','Tide','Bloom','Volt','Mystic','Shadow'];
const rarityWeight:Record<string,number>={common:1,uncommon:2,rare:3,epic:4,ultra:5,legendary:6};

export default function SeasonIndex({data,onInspect,onOpen}:{data:any;onInspect:(id:string)=>void;onOpen:()=>void}) {
 const [query,setQuery]=useState('');
 const [theme,setTheme]=useState('all');
 const [rarity,setRarity]=useState('all');
 const [show,setShow]=useState('illustrated');
 const [sortMode,setSortMode]=useState('showcase');
 const [page,setPage]=useState(0);
 const owned=useMemo(()=>new Set<string>((data?.cards||[]).map((x:any)=>x.card)),[data]);
 const progress=artProgress();
 const illustratedCommons=useMemo(()=>seasonManifest.filter(c=>c.rarity==='common'&&hasSeasonArtwork(c)).sort((a,b)=>a.cardNumber-b.cardNumber),[]);
 const featuredCommons=illustratedCommons.slice(0,8);
 const currentCommonRun=useMemo(()=>seasonManifest.filter(c=>c.cardNumber>=21&&c.cardNumber<=31).sort((a,b)=>a.cardNumber-b.cardNumber),[]);
 const defaultHighlightedIds=new Set([
   ...featuredCommons.map(c=>c.id),
   ...currentCommonRun.map(c=>c.id),
   ...seasonManifest.filter(c=>c.rarity==='legendary'&&hasApprovedShowcaseArt(c)).slice(0,1).map(c=>c.id)
 ]);
 const suppressDefaultDuplicates=query===''&&theme==='all'&&rarity==='all'&&show==='illustrated'&&sortMode==='showcase';

 const filteredBase=seasonManifest.filter(c=>
   (!suppressDefaultDuplicates||!defaultHighlightedIds.has(c.id))&&
   (theme==='all'||c.theme===theme)&&
   (rarity==='all'||c.rarity===rarity)&&
   (show==='all'||(show==='owned'?owned.has(c.id):show==='illustrated'?hasSeasonArtwork(c):show==='approved'?hasApprovedShowcaseArt(c):!owned.has(c.id)))&&
   ((c.name+' '+c.theme+' '+c.creatureType+' '+String(c.cardNumber).padStart(3,'0')).toLowerCase().includes(query.toLowerCase()))
 );
 const filtered=[...filteredBase].sort((a,b)=>{
   if(sortMode==='number')return a.cardNumber-b.cardNumber;
   if(sortMode==='rarity')return (rarityWeight[b.rarity]||0)-(rarityWeight[a.rarity]||0)||Number(hasSeasonArtwork(b))-Number(hasSeasonArtwork(a))||a.cardNumber-b.cardNumber;
   const artDelta=Number(hasApprovedShowcaseArt(b))*2+Number(hasSeasonArtwork(b))-Number(hasApprovedShowcaseArt(a))*2-Number(hasSeasonArtwork(a));
   return artDelta||(rarityWeight[b.rarity]||0)-(rarityWeight[a.rarity]||0)||a.cardNumber-b.cardNumber;
 });
 const pages=Math.max(1,Math.ceil(filtered.length/24));
 const currentPage=Math.min(page,pages-1);
 const resetPage=()=>setPage(0);
 const showIllustrated=()=>{setShow('illustrated');setRarity('all');setSortMode('showcase');resetPage()};
 const showLegendary=()=>{setShow('all');setRarity('legendary');setSortMode('showcase');resetPage()};
 const showCommons=()=>{setShow('illustrated');setRarity('common');setSortMode('number');resetPage()};
 const showAll=()=>{setShow('all');setRarity('all');setSortMode('showcase');resetPage()};

 return <>
  <div className="eyebrow">THE FIRST FLIGHT · 369 STORIES TO DISCOVER</div>
  <div className="index-heading">
   <div><h1 className="page-title">A world worth knowing.</h1><p className="intro">Start with the guardians that already have artwork, meet the Legendary standouts, then dive into the complete 369-card Season One field guide.</p></div>
   <div className="season-seal"><strong>01</strong><span>SEASON</span></div>
  </div>

  <section className="collection-progress">
   <div><span className="eyebrow">YOUR SEASON COLLECTION</span><h2>{owned.size} of 369 guardians</h2><p>{data?'Every saved copy has a home in My Nest.':'Sign in to see your saved collection.'} {progress.illustrated} illustrated concepts · {progress.complete} production-complete.</p></div>
   <div><Progress value={owned.size/369*100} aria-label="Season collection completion"/><span>{Math.round(owned.size/369*100)}% collected</span></div>
   <button className="gold" onClick={onOpen}>Explore packs <ArrowRight size={16}/></button>
  </section>

  <section className="season-showcase" aria-labelledby="showcase-title">
   <div className="showcase-heading">
    <div><span className="eyebrow">SEASON ONE SHOWCASE</span><h2 id="showcase-title">See the wonder before the archive.</h2><p>The illustrated guardians lead the experience now. Higher rarities get room to breathe, while unreleased cards remain clearly marked as review concepts.</p></div>
    <div className="showcase-heading-actions">
     <button className="gold" onClick={showIllustrated}><Sparkles size={16}/>See all {progress.illustrated} illustrated</button>
     <button className="outline" onClick={showLegendary}><Crown size={16}/>Browse all 20 Legendary</button>
    </div>
   </div>

   <LegendaryFlight/>

   {!!illustratedCommons.length&&<section className="common-flight-showcase" aria-labelledby="common-flight-title">
    <div className="common-flight-heading">
     <div>
      <span className="eyebrow">COMMON FLIGHT · FEATURED GUARDIANS</span>
      <h2 id="common-flight-title">The adventure starts with the Commons.</h2>
      <p>A focused look at a few Common guardians from The First Flight. Browse the full illustrated roster below when you want to explore every card.</p>
     </div>
     <button className="outline" onClick={showCommons}>Browse illustrated Commons <ArrowRight size={16}/></button>
    </div>
    <div className="common-flight-grid">
     {featuredCommons.map((c,i)=><article className={'common-flight-card theme-'+c.theme.toLowerCase()} key={c.id}>
      <button className="common-flight-art" onClick={()=>onInspect(c.id)} aria-label={'Inspect '+c.name}>
       <GuardianCard id={c.id} eager={i<4}/>
       <span className="common-flight-sheen" aria-hidden="true"/>
      </button>
      <div className="common-flight-meta">
       <span>CN1 · {String(c.cardNumber).padStart(3,'0')}</span>
       <span>{c.theme} · {c.battleClass}</span>
      </div>
      <h3>{c.name}</h3>
      <p>{c.description}</p>
      <button className="index-inspect" onClick={()=>onInspect(c.id)}>Inspect card & story ↗</button>
     </article>)}
    </div>
   </section>}

   <section className="common-flight-showcase current-common-run" aria-labelledby="current-common-run-title">
    <div className="common-flight-heading">
     <div>
      <span className="eyebrow">CURRENT COMMON RUN · CN1-021—031</span>
      <h2 id="current-common-run-title">Meet the next eleven Commons.</h2>
      <p>Cards 021–040 are now part of the live Season One gallery. Finished artwork appears when approved; cards still in art production use the official NestRune card back so the full run stays visible in order.</p>
     </div>
    </div>
    <div className="common-flight-grid">
     {currentCommonRun.map((c,i)=><article className={'common-flight-card theme-'+c.theme.toLowerCase()} key={'current-run-'+c.id}>
      <button className="common-flight-art" onClick={()=>onInspect(c.id)} aria-label={'Inspect '+c.name}>
       <GuardianCard id={c.id} eager={i<3}/>
       <span className="common-flight-sheen" aria-hidden="true"/>
      </button>
      <div className="common-flight-meta">
       <span>CN1 · {String(c.cardNumber).padStart(3,'0')}</span>
       <span>{c.theme} · {c.battleClass}</span>
      </div>
      <h3>{c.name}</h3>
      <p>{c.description}</p>
      <button className="index-inspect" onClick={()=>onInspect(c.id)}>Explore story & battle profile ↗</button>
     </article>)}
    </div>
   </section>

  </section>

  <div className="gallery-shortcuts" role="group" aria-label="Season One gallery views">
   <button className={show==='illustrated'&&rarity==='all'?'gold':'outline'} onClick={showIllustrated}><Sparkles size={16}/>Illustrated <strong>{progress.illustrated}</strong></button>
   <button className={rarity==='legendary'?'gold':'outline'} onClick={showLegendary}><Crown size={16}/>Legendary <strong>20</strong></button>
   <button className={show==='illustrated'&&rarity==='common'?'gold':'outline'} onClick={showCommons}><Sparkles size={16}/>Illustrated Commons</button>
   <button className={show==='all'&&rarity==='all'?'gold':'outline'} onClick={showAll}>All Season One <strong>369</strong></button>
  </div>

  <div className="clan-tabs" role="group" aria-label="Filter theme">{['all',...themes].map(t=><button key={t} className={theme===t?'gold':'outline'} aria-pressed={theme===t} onClick={()=>{setTheme(t);resetPage()}}>{t==='all'?'All themes':t+' Theme'}<small>{t==='all'?369:seasonManifest.filter(x=>x.theme===t).length}</small></button>)}</div>

  <div className="index-filters">
   <label className="index-search"><Search size={18}/><input aria-label="Search Season One" value={query} onChange={e=>{setQuery(e.target.value);resetPage()}} placeholder="Name, number, or creature…"/></label>
   <select aria-label="Filter rarity" value={rarity} onChange={e=>{setRarity(e.target.value);resetPage()}}>{['all','common','uncommon','rare','epic','ultra','legendary'].map(r=><option key={r} value={r}>{r==='all'?'All rarities':r}</option>)}</select>
   <select aria-label="Filter collection" value={show} onChange={e=>{setShow(e.target.value);resetPage()}}><option value="all">All guardians</option><option value="owned">In My Nest</option><option value="missing">Missing</option><option value="illustrated">Illustrated cards</option><option value="approved">Approved showcase artwork</option></select>
   <select aria-label="Sort Season One" value={sortMode} onChange={e=>{setSortMode(e.target.value);resetPage()}}><option value="showcase">Showcase first</option><option value="rarity">Highest rarity first</option><option value="number">Card number</option></select>
   <span aria-live="polite">{filtered.length} cards</span>
  </div>

  <div className="gallery-section-head archive-heading"><div><span className="eyebrow">FIELD GUIDE</span><h2>{rarity==='legendary'?'The Legendary roster':rarity==='common'&&show==='illustrated'?'Common Flight showcase':show==='illustrated'?'Illustrated Season One':show==='approved'?'Approved showcase artwork':'Explore all 369 guardians'}</h2></div><span>{filtered.length} matching cards</span></div>

  <div className="season-grid">{filtered.slice(currentPage*24,(currentPage+1)*24).map(c=><article className={'index-card '+(hasSeasonArtwork(c)?'has-art ':'')+(c.rarity==='legendary'?'legendary-index-card':'')} key={c.id}>
   <div className="index-card-top"><span style={{display:'inline-flex',alignItems:'center',gap:8}}><ThemeEmblem theme={c.theme} size={24} label={false}/>CN1 · {String(c.cardNumber).padStart(3,'0')} / 369</span><span className={owned.has(c.id)?'owned-label':hasSeasonArtwork(c)?'illustrated-label':'missing-label'}>{owned.has(c.id)?<><Check size={14}/> Owned</>:hasSeasonArtwork(c)?<><Sparkles size={13}/> Illustrated</>:c.releaseStatus==='preview'?'Free preview':'Unreleased'}</span></div>
   <button aria-label={'Inspect '+c.name} onClick={()=>onInspect(c.id)}><GuardianCard id={c.id}/></button>
   <div className="index-card-title-row"><h2>{c.name}</h2><span className={'rarity-token rarity-'+c.rarity}>{c.rarity}</span></div>
   <p>Theme: {c.theme} · {c.battleClass}</p>
   <p className="card-story">{c.description}</p>
   <button className="index-inspect" onClick={()=>onInspect(c.id)}>Explore story & battle profile ↗</button>
  </article>)}</div>

  {!filtered.length&&<section className="panel"><Sparkles/><h2>No guardians match those filters.</h2><button className="outline" onClick={()=>{setQuery('');setTheme('all');setRarity('all');setShow('illustrated');setSortMode('showcase');resetPage()}}>Reset filters</button></section>}
  <div className="actions index-pagination"><button className="outline" disabled={currentPage===0} onClick={()=>setPage(currentPage-1)}>Previous</button><span>Page {currentPage+1} of {pages}</span><button className="outline" disabled={currentPage+1>=pages} onClick={()=>setPage(currentPage+1)}>Next</button></div>
  <div className="notice">Season One remains a review gallery. Illustrated and founder-approved showcase artwork is unreleased and cannot appear in paid packs. The 369 canonical IDs remain unchanged, and V3 battle profiles are still unplaytested concepts.</div>
 </>;
}
