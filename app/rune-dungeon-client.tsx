'use client';

import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {BatteryCharging,Check,Crown,LockKeyhole,PackageOpen,Sparkles,Swords} from 'lucide-react';
import NestBattles from './nest-battles';
import {RUNE_DUNGEON_FLOORS,RUNE_DUNGEON_WORLDS,RUNE_PACK_COSTS,runeWorld,worldFloorNumber,type RuneRewardPack,type RuneWorldId} from '@/lib/rune-dungeon';

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
 guardian:'Guardian Pack'
};

export default function RuneDungeon(){
 const [progress,setProgress]=useState<DungeonProgress|null>(null);
 const [activeFloor,setActiveFloor]=useState<number|null>(null);
 const [loading,setLoading]=useState(true);
 const [message,setMessage]=useState('');
 const [claiming,setClaiming]=useState<RuneRewardPack|null>(null);
 const [attemptId,setAttemptId]=useState<string|null>(null);
 const [selectedWorld,setSelectedWorld]=useState<RuneWorldId>('verdant');

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
  if(progress?.clears.some(clear=>clear.floor===floor)){setMessage('Floor replay complete. Rune Energy is first-clear only.');return}
  setMessage('');
  try{
   const response=await fetch('/api/dungeon',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'clear',floor,attempt:attemptId||undefined})});
   const data=await response.json();
   if(!response.ok)throw Error(data.error||'The clear could not be saved.');
   setProgress(current=>current?{...current,highestCleared:data.highestCleared,unlockedFloor:data.unlockedFloor,runeEnergy:data.runeEnergy,clears:current.clears.some(clear=>clear.floor===floor)?current.clears:[...current.clears,{floor,energy_awarded:data.reward,cleared_at:new Date().toISOString()}]}:current);
   setAttemptId(null);
   setMessage(data.alreadyCleared?'Floor replay complete. Rune Energy is first-clear only.':'Floor '+floor+' clear saved · +'+data.reward+' Rune Energy.');
  }catch(error){setMessage(error instanceof Error?error.message:'The clear could not be saved.')}
 }

 async function startFloor(floor:number){
  setMessage('');
  if(!progress?.signedIn){setAttemptId(null);setActiveFloor(floor);return}
  try{
   const response=await fetch('/api/dungeon',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'start',floor})});
   const data=await response.json();
   if(!response.ok)throw Error(data.error||'The Dungeon floor could not be started.');
   setAttemptId(data.attemptId);
   setActiveFloor(floor);
  }catch(error){setMessage(error instanceof Error?error.message:'The Dungeon floor could not be started.')}
 }

 async function recordLoss(floor:number){
  if(!progress?.signedIn||!attemptId){setAttemptId(null);return}
  try{
   const response=await fetch('/api/dungeon',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'loss',floor,attempt:attemptId})});
   const data=await response.json();
   if(!response.ok)throw Error(data.error||'The loss could not be recorded.');
   setProgress(current=>current?{...current,runeEnergy:data.runeEnergy,highestCleared:data.highestCleared}:current);
   setAttemptId(null);
   setMessage('Battle lost · 0 Rune Energy awarded.');
  }catch(error){setMessage(error instanceof Error?error.message:'The loss could not be recorded.')}
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
 const selectedWorldData=runeWorld(selectedWorld);
 const selectedFloors=RUNE_DUNGEON_FLOORS.filter(floor=>floor.world===selectedWorld);

 if(activeFloor){
  const floor=RUNE_DUNGEON_FLOORS.find(entry=>entry.floor===activeFloor)!;
  const world=runeWorld(floor.world);
  return <section className={'rune-dungeon-battle-shell world-'+world.id}>
   <div className="dungeon-battle-top"><button className="outline" onClick={()=>{setAttemptId(null);setActiveFloor(null)}}>← Dungeon map</button><div><span className="eyebrow">{world.subtitle} · LEVEL {worldFloorNumber(floor.floor)}</span><strong>{floor.name}{(floor.boss||floor.worldBoss)?' · BOSS':''}</strong><small>{world.name} · {world.themes.join(' / ')}</small></div><span className="rune-energy-chip"><BatteryCharging size={16}/>{progress?.runeEnergy||0}</span></div>
   <NestBattles dungeon={{...floor,worldName:world.name,worldThemes:world.themes,musicKey:world.musicKey,rewardsEnabled:!!progress?.signedIn,onVictory:()=>{void recordClear(floor.floor)},onDefeat:()=>{void recordLoss(floor.floor)},onExit:()=>{setAttemptId(null);setActiveFloor(null)}}}/>
   {message&&<p className="notice dungeon-notice">{message}</p>}
  </section>;
 }

 return <section className="rune-dungeon">
  <div className="dungeon-hero">
   <div><span className="eyebrow">NESTRUNE MISSIONS · 3 RUNE WORLDS</span><h1>Choose your Rune World.</h1><p>Rune Dungeon V2 now has three full ten-level campaigns. Each world has its own landscape, Theme mix, music, enemy formations and boss encounter. Clear all 30 levels to conquer the Runeheart.</p><div className="battle-pill-row"><span>3 worlds</span><span>30 levels</span><span>3 boss arenas</span><span>720 total first-clear Energy</span></div></div>
   <div className="dungeon-energy-vault"><Sparkles/><span>RUNE ENERGY</span><strong>{loading?'…':progress?.runeEnergy||0}</strong><small>{progress?.signedIn?'Saved to your account':'Sign in to save rewards'}</small></div>
  </div>

  {message&&<p className="notice dungeon-notice">{message}</p>}
  {!progress?.signedIn&&!loading&&<div className="dungeon-signin"><LockKeyhole/><div><strong>Play the first level now. Sign in to bank rewards.</strong><p>Persistent clears, Rune Energy and pack claims are account-bound.</p></div><Link className="gold" href="/auth">Sign in</Link></div>}

  <div className="dungeon-section-head"><div><span className="eyebrow">CHOOSE A RUNE WORLD</span><h2>Three worlds. Ten levels each.</h2></div><span>{progress?.highestCleared||0} / 30 cleared</span></div>

  <div className="dungeon-world-picker">{RUNE_DUNGEON_WORLDS.map(world=>{
   const worldFloors=RUNE_DUNGEON_FLOORS.filter(f=>f.world===world.id);
   const clearedCount=worldFloors.filter(f=>cleared.has(f.floor)).length;
   const firstFloor=world.floorRange[0];
   const worldUnlocked=firstFloor===1||firstFloor<=(progress?.highestCleared||0)+1;
   return <button key={world.id} type="button" className={'dungeon-world-choice world-'+world.id+(selectedWorld===world.id?' selected':'')+(!worldUnlocked?' locked':'')} onClick={()=>setSelectedWorld(world.id)}>
    <span className="eyebrow">{world.subtitle}</span><strong>{world.name}</strong><small>{world.landscape}</small><em>{clearedCount}/10 cleared · {worldUnlocked?'Available':'Progress to unlock'}</em>
   </button>
  })}</div>

  <section className={'dungeon-world world-'+selectedWorld+((selectedWorldData.floorRange[0]>(progress?.highestCleared||0)+1)?' locked':'')}>
   <div className="dungeon-world-banner"><div><span className="eyebrow">{selectedWorldData.subtitle}</span><h2>{selectedWorldData.name}</h2><p>{selectedWorldData.description}</p></div><div className="dungeon-world-meta"><span>{selectedWorldData.landscape}</span><strong>{selectedWorldData.themes.join(' · ')}</strong><small>♪ {selectedWorldData.musicTitle}</small></div></div>
   <div className="dungeon-floor-grid">{selectedFloors.map(floor=>{
    const isCleared=cleared.has(floor.floor);
    const unlocked=floor.floor===1||floor.floor<=(progress?.highestCleared||0)+1;
    const localLevel=worldFloorNumber(floor.floor);
    return <article key={floor.floor} className={'dungeon-floor '+((floor.boss||floor.worldBoss)?'boss ':'')+(isCleared?'cleared ':'')+(!unlocked?'locked':'')}>
     <div className="dungeon-floor-number">{(floor.boss||floor.worldBoss)?<Crown/>:String(localLevel).padStart(2,'0')}</div>
     <div className="dungeon-floor-copy"><span>{(floor.boss||floor.worldBoss)?(floor.boss?'RUNEHEART FINAL BOSS':'WORLD BOSS'):'LEVEL '+localLevel}</span><h3>{floor.name}</h3><p>{floor.mission}</p><small><BatteryCharging size={13}/> First clear +{floor.energy} Rune Energy</small></div>
     <div className="dungeon-floor-state">{isCleared?<span className="cleared-mark"><Check/>Cleared</span>:unlocked?<button className={(floor.boss||floor.worldBoss)?'gold':'outline'} onClick={()=>{void startFloor(floor.floor)}}><Swords size={15}/>{(floor.boss||floor.worldBoss)?'Challenge Boss':'Enter'}</button>:<span><LockKeyhole size={15}/>Locked</span>}{isCleared&&<button className="outline" onClick={()=>{void startFloor(floor.floor)}}>Replay</button>}</div>
    </article>
   })}</div>
  </section>

  <div className="dungeon-reward-vault">
   <div className="dungeon-section-head"><div><span className="eyebrow">RUNE VAULT</span><h2>Claim beta packs with Rune Energy</h2></div><span className="rune-energy-chip"><BatteryCharging size={16}/>{progress?.runeEnergy||0}</span></div>
   <p className="dungeon-vault-copy">Rune Energy is earned only from first dungeon clears. Save 100 Energy for a Hatchling Pack, 220 for a Nest Pack, or 400 for a Guardian Pack. Royal Nest Packs are premium purchase-only and cannot be claimed with Rune Energy.</p>
   <div className="dungeon-pack-grid">{(Object.keys(RUNE_PACK_COSTS) as RuneRewardPack[]).map(pack=>{
    const cost=RUNE_PACK_COSTS[pack],enough=(progress?.runeEnergy||0)>=cost;
    return <article key={pack} className={'dungeon-pack-reward reward-'+pack}><PackageOpen/><span>DUNGEON REWARD</span><h3>{packNames[pack]}</h3><strong><BatteryCharging size={16}/>{cost} Rune Energy</strong><button className="outline" disabled={!progress?.signedIn||!enough||!!claiming} onClick={()=>claimPack(pack)}>{claiming===pack?'Claiming…':enough?'Claim pack':'Need '+(cost-(progress?.runeEnergy||0))+' more'}</button></article>
   })}<article className="dungeon-pack-reward reward-royal"><PackageOpen/><span>PREMIUM PURCHASE ONLY</span><h3>Royal Nest Pack</h3><strong>No Rune Energy redemption</strong><Link className="gold" href="/#packs">Go to Pack Store</Link></article></div>
   <div className="dungeon-vault-footer"><span>Each Rune World awards 240 first-clear Energy · all three worlds award 720 total.</span><Link href="/#My%20Nest"><PackageOpen size={15}/>Go to My Nest</Link></div>
  </div>

  <p className="disclaimer">Rune Dungeon beta rewards have no cash value and do not change card rarity, paid pack odds or commercial eligibility. Each floor awards Rune Energy once per account; replaying a cleared floor is for play only.</p>
 </section>;
}
