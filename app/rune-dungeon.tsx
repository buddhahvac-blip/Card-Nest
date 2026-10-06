'use client';

import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {BatteryCharging,Check,Crown,LockKeyhole,PackageOpen,Sparkles,Swords} from 'lucide-react';
import NestBattles from './nest-battles';
import {RUNE_DUNGEON_FLOORS,RUNE_PACK_COSTS,type RuneRewardPack} from '@/lib/rune-dungeon';

type DungeonProgress={
 signedIn:boolean;
 highestCleared:number;
 unlockedFloor:number;
 runeEnergy:number;
 clears:{floor:number;energy_awarded:number;cleared_at:string}[];
 claims:{id:string;pack_id:string;energy_cost:number;entitlement_id:string;created_at:string}[];
 packCosts:typeof RUNE_PACK_COSTS;
};

const packNames:Record<RuneRewardPack,string>={
 hatchling:'Hatchling Pack',
 nest:'Nest Pack',
 guardian:'Guardian Pack',
 royal:'Royal Nest Pack'
};

export default function RuneDungeon(){
 const [progress,setProgress]=useState<DungeonProgress|null>(null);
 const [activeFloor,setActiveFloor]=useState<number|null>(null);
 const [loading,setLoading]=useState(true);
 const [message,setMessage]=useState('');
 const [claiming,setClaiming]=useState<RuneRewardPack|null>(null);

 async function load(){
  setLoading(true);
  try{
   const response=await fetch('/api/dungeon',{cache:'no-store'});
   const data=await response.json();
   if(!response.ok)throw Error(data.error||'Rune Dungeon could not be loaded.');
   setProgress(data);
  }catch(error){setMessage(error instanceof Error?error.message:'Rune Dungeon could not be loaded.')}
  finally{setLoading(false)}
 }

 useEffect(()=>{void load()},[]);

 async function recordClear(floor:number){
  setMessage('');
  try{
   const response=await fetch('/api/dungeon',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'clear',floor})});
   const data=await response.json();
   if(!response.ok)throw Error(data.error||'The clear could not be saved.');
   setProgress(current=>current?{...current,highestCleared:data.highestCleared,unlockedFloor:data.unlockedFloor,runeEnergy:data.runeEnergy,clears:current.clears.some(clear=>clear.floor===floor)?current.clears:[...current.clears,{floor,energy_awarded:data.reward,cleared_at:new Date().toISOString()}]}:current);
   setMessage(data.alreadyCleared?'Floor replay complete. Rune Energy is first-clear only.':'Floor '+floor+' clear saved · +'+data.reward+' Rune Energy.');
  }catch(error){setMessage(error instanceof Error?error.message:'The clear could not be saved.')}
 }

 async function claimPack(pack:RuneRewardPack){
  if(claiming)return;
  setClaiming(pack);setMessage('');
  try{
   const response=await fetch('/api/dungeon',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'claim',pack})});
   const data=await response.json();
   if(!response.ok)throw Error(data.error||'Reward pack could not be claimed.');
   setProgress(current=>current?{...current,runeEnergy:data.runeEnergy,claims:[{id:data.claimId,pack_id:pack,energy_cost:data.cost,entitlement_id:data.entitlementId,created_at:new Date().toISOString()},...current.claims]}:current);
   setMessage(packNames[pack]+' claimed. It is waiting unopened in My Nest.');
  }catch(error){setMessage(error instanceof Error?error.message:'Reward pack could not be claimed.')}
  finally{setClaiming(null)}
 }

 const cleared=useMemo(()=>new Set(progress?.clears.map(clear=>clear.floor)||[]),[progress]);

 if(activeFloor){
  const floor=RUNE_DUNGEON_FLOORS.find(entry=>entry.floor===activeFloor)!;
  return <section className="rune-dungeon-battle-shell">
   <div className="dungeon-battle-top"><button className="outline" onClick={()=>setActiveFloor(null)}>← Dungeon map</button><div><span className="eyebrow">RUNE DUNGEON · FLOOR {floor.floor}</span><strong>{floor.name}{floor.boss?' · BOSS':''}</strong></div><span className="rune-energy-chip"><BatteryCharging size={16}/>{progress?.runeEnergy||0}</span></div>
   <NestBattles dungeon={{...floor,rewardsEnabled:!!progress?.signedIn,onVictory:()=>{void recordClear(floor.floor)},onExit:()=>setActiveFloor(null)}}/>
   {message&&<p className="notice dungeon-notice">{message}</p>}
  </section>;
 }

 return <section className="rune-dungeon">
  <div className="dungeon-hero">
   <div><span className="eyebrow">NESTRUNE MISSIONS · PVE EXPEDITION</span><h1>Descend into the Rune Dungeon.</h1><p>Clear ten mission floors, gather account-bound Rune Energy, and defeat the Runeheart Boss. First clears unlock the next floor and award Energy that can be exchanged for free Founding Flight beta packs.</p><div className="battle-pill-row"><span>10 floors</span><span>Floor 10 boss</span><span>First-clear rewards</span><span>No paid Energy</span></div></div>
   <div className="dungeon-energy-vault"><Sparkles/><span>RUNE ENERGY</span><strong>{loading?'…':progress?.runeEnergy||0}</strong><small>{progress?.signedIn?'Saved to your account':'Sign in to save rewards'}</small></div>
  </div>

  {message&&<p className="notice dungeon-notice">{message}</p>}
  {!progress?.signedIn&&!loading&&<div className="dungeon-signin"><LockKeyhole/><div><strong>Play the first floor now. Sign in to bank rewards.</strong><p>Persistent clears, Rune Energy and pack claims are account-bound.</p></div><Link className="gold" href="/auth">Sign in</Link></div>}

  <div className="dungeon-section-head"><div><span className="eyebrow">THE TEN SEALS</span><h2>Rune Dungeon floors</h2></div><span>{progress?.highestCleared||0} / 10 cleared</span></div>

  <div className="dungeon-floor-grid">{RUNE_DUNGEON_FLOORS.map(floor=>{
   const isCleared=cleared.has(floor.floor);
   const unlocked=floor.floor===1||floor.floor<=(progress?.highestCleared||0)+1;
   return <article key={floor.floor} className={'dungeon-floor '+(floor.boss?'boss ':'')+(isCleared?'cleared ':'')+(!unlocked?'locked':'')}>
    <div className="dungeon-floor-number">{floor.boss?<Crown/>:String(floor.floor).padStart(2,'0')}</div>
    <div className="dungeon-floor-copy"><span>{floor.boss?'RUNEHEART BOSS':'FLOOR '+floor.floor}</span><h3>{floor.name}</h3><p>{floor.mission}</p><small><BatteryCharging size={13}/> First clear +{floor.energy} Rune Energy</small></div>
    <div className="dungeon-floor-state">{isCleared?<span className="cleared-mark"><Check/>Cleared</span>:unlocked?<button className={floor.boss?'gold':'outline'} onClick={()=>setActiveFloor(floor.floor)}><Swords size={15}/>{floor.boss?'Challenge Boss':'Enter'}</button>:<span><LockKeyhole size={15}/>Locked</span>}{isCleared&&<button className="outline" onClick={()=>setActiveFloor(floor.floor)}>Replay</button>}</div>
   </article>
  })}</div>

  <div className="dungeon-reward-vault">
   <div className="dungeon-section-head"><div><span className="eyebrow">RUNE VAULT</span><h2>Claim beta packs with Rune Energy</h2></div><span className="rune-energy-chip"><BatteryCharging size={16}/>{progress?.runeEnergy||0}</span></div>
   <p className="dungeon-vault-copy">Rune Energy is earned only from first dungeon clears. It cannot be purchased, transferred or exchanged for cash. Reward claims use the existing free beta pack pool and save an unopened entitlement to My Nest.</p>
   <div className="dungeon-pack-grid">{(Object.keys(RUNE_PACK_COSTS) as RuneRewardPack[]).map(pack=>{
    const cost=RUNE_PACK_COSTS[pack],enough=(progress?.runeEnergy||0)>=cost;
    return <article key={pack} className={'dungeon-pack-reward reward-'+pack}><PackageOpen/><span>{pack==='royal'?'PREMIUM REWARD':'DUNGEON REWARD'}</span><h3>{packNames[pack]}</h3><strong><BatteryCharging size={16}/>{cost} Rune Energy</strong><button className={pack==='royal'?'gold':'outline'} disabled={!progress?.signedIn||!enough||!!claiming} onClick={()=>claimPack(pack)}>{claiming===pack?'Claiming…':enough?'Claim pack':'Need '+(cost-(progress?.runeEnergy||0))+' more'}</button></article>
   })}</div>
   <div className="dungeon-vault-footer"><span>All 10 first clears award 240 Rune Energy total.</span><Link href="/"><PackageOpen size={15}/>Go to My Nest</Link></div>
  </div>

  <p className="disclaimer">Rune Dungeon beta rewards have no cash value and do not change card rarity, paid pack odds or commercial eligibility. Each floor awards Rune Energy once per account; replaying a cleared floor is for play only.</p>
 </section>;
}
