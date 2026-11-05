import {RequestError} from './http';
import {seasonCard} from './season-manifest';
import {strikeDamage,abilityDamage,guardDamage} from './nest-battle-rules';
import {battleAbilityProfile,rarityAttackTuning} from './battle-ability-profile';

export const DUNGEON_ENGINE_VERSION='dungeon-server-v1';
export type DungeonAction='strike'|'ability'|'power'|'special'|'guard'|'swap';
export type CombatFighter={id:string;hp:number;maxHp:number;guard:number;energy:number;cooldown:number;specialCooldown:number;defenseCooldown:number};
export type ServerCombatState={engineVersion:typeof DUNGEON_ENGINE_VERSION;floor:number;player:CombatFighter[];enemy:CombatFighter[];playerActive:number;enemyActive:number;turn:number;result:'active'|'won'|'lost';enemyDamageMultiplier:number};
const card=(id:string)=>{const c=seasonCard(id);if(!c)throw new RequestError('Unknown combat character.',400);return c;};
const team=(ids:string[],factor:number):CombatFighter[]=>ids.map(id=>{const c=card(id);const maxHp=Math.max(1,Math.round(c.health*factor));return {id,hp:maxHp,maxHp,guard:0,energy:2,cooldown:0,specialCooldown:0,defenseCooldown:0};});
const down=(f:CombatFighter[])=>f.every(x=>x.hp<=0);
const living=(f:CombatFighter[],index:number)=>{for(let i=0;i<f.length;i++){const k=(index+i)%f.length;if(f[k].hp>0)return k;}return 0;};
const tick=(f:CombatFighter[])=>f.forEach(x=>{x.cooldown=Math.max(0,x.cooldown-1);x.specialCooldown=Math.max(0,x.specialCooldown-1);x.defenseCooldown=Math.max(0,x.defenseCooldown-1);});
function hit(target:CombatFighter,amount:number){const dealt=guardDamage(amount,target.guard);target.guard=dealt.guard;target.hp=Math.max(0,target.hp-dealt.damage);}
function action(team:CombatFighter[],ti:number,opponents:CombatFighter[],oi:number,kind:Exclude<DungeonAction,'swap'>,multiplier:number){
 const actor=team[ti],target=opponents[oi],c=card(actor.id),foe=card(target.id);
 const profile=battleAbilityProfile(c.rarity),tune=rarityAttackTuning(c.rarity);
 if(kind==='guard'){
  if(actor.defenseCooldown!==0||actor.energy<1)throw new RequestError('Guard is unavailable.',409);
  actor.energy--;actor.defenseCooldown=2;actor.guard+=Math.max(16,Math.round(tune.guard+c.defense*.28));return;
 }
 if((kind==='power'||kind==='special')&&profile==='high'){
  const special=kind==='special',cost=special?3:1;
  if(actor.energy<cost||(special?actor.specialCooldown:actor.cooldown)>0)throw new RequestError('Ability is unavailable.',409);
  actor.energy-=cost;if(special)actor.specialCooldown=4;else actor.cooldown=2;
  hit(target,Math.max(1,Math.round(abilityDamage(c,foe,special?tune.special:tune.power)*multiplier)));return;
 }
 if(kind==='ability'||kind==='special'){
  if(profile==='uncommon'||profile==='high')throw new RequestError('Ability is unavailable for this rarity.',409);
  const special=kind==='special',ability=special?c.abilitySecondary:c.abilityPrimary;
  const cost=Math.max(1,ability.energyCost||1);
  if(actor.energy<cost||(special?actor.specialCooldown:actor.cooldown)>0)throw new RequestError('Ability is unavailable.',409);
  actor.energy-=cost;if(special)actor.specialCooldown=Math.max(4,ability.cooldownTurns||4);else actor.cooldown=Math.max(1,ability.cooldownTurns||2);
  if(ability.effect==='deal_damage')hit(target,Math.max(1,Math.round(abilityDamage(c,foe,ability.amount||20)*multiplier)));
  else if(ability.effect==='gain_guard')actor.guard+=ability.amount||20;
  else if(ability.effect==='heal')actor.hp=Math.min(actor.maxHp,actor.hp+(ability.amount||20));
  // Speed-affecting skills require versioned speed state before activation.
  else throw new RequestError('This skill needs the next server engine version.',409);
  return;
 }
 if(kind!=='strike')throw new RequestError('Unsupported action.',409);
 actor.energy=Math.min(3,actor.energy+1);
 hit(target,Math.max(1,Math.round(strikeDamage(c,foe)*multiplier)));
}
export function createDungeonCombat(floor:number,playerIds:string[],enemyIds:string[],enemyHpMultiplier:number,enemyDamageMultiplier:number):ServerCombatState{
 if(!Number.isInteger(floor)||floor<1||floor>30||playerIds.length!==3||new Set(playerIds).size!==3||enemyIds.length!==3||new Set(enemyIds).size!==3||!Number.isFinite(enemyHpMultiplier)||enemyHpMultiplier<=0||enemyHpMultiplier>5||!Number.isFinite(enemyDamageMultiplier)||enemyDamageMultiplier<=0||enemyDamageMultiplier>5)throw new RequestError('Invalid battle setup.',400);
 return {engineVersion:DUNGEON_ENGINE_VERSION,floor,player:team(playerIds,1),enemy:team(enemyIds,enemyHpMultiplier),playerActive:0,enemyActive:0,turn:0,result:'active',enemyDamageMultiplier};
}
/** Pure transition. The caller must persist returned state under an exclusive attempt-row lock. */
export function applyDungeonTurn(previous:ServerCombatState,choice:DungeonAction,swapIndex?:number):ServerCombatState{
 if(previous.engineVersion!==DUNGEON_ENGINE_VERSION||previous.result!=='active'||previous.turn>=200)throw new RequestError('Battle is finished or incompatible.',409);
 const state:ServerCombatState=JSON.parse(JSON.stringify(previous));
 tick(state.player);tick(state.enemy);
 let pi=living(state.player,state.playerActive),ei=living(state.enemy,state.enemyActive);
 if(choice==='swap'){
  if(!Number.isInteger(swapIndex)||swapIndex!<0||swapIndex!>=3||swapIndex===pi||state.player[swapIndex!].hp<=0)throw new RequestError('Illegal swap.',409);
  pi=swapIndex!;
  action(state.enemy,ei,state.player,pi,'strike',state.enemyDamageMultiplier);
 }else {
  const p=card(state.player[pi].id),e=card(state.enemy[ei].id);
  if(p.speed>=e.speed){
   action(state.player,pi,state.enemy,ei,choice,1);
   if(!down(state.enemy)&&state.enemy[ei].hp>0)action(state.enemy,ei,state.player,pi,'strike',state.enemyDamageMultiplier);
  }else{
   action(state.enemy,ei,state.player,pi,'strike',state.enemyDamageMultiplier);
   if(!down(state.player)&&state.player[pi].hp>0)action(state.player,pi,state.enemy,ei,choice,1);
  }
 }
 state.playerActive=living(state.player,pi);state.enemyActive=living(state.enemy,ei);
 state.turn++;
 state.result=down(state.enemy)?'won':down(state.player)?'lost':'active';
 return state;
}
