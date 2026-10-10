import {guardDamage,strikeDamage} from './nest-battle-rules';

/** Pure combat primitives: reusable by server and client without browser state. */
export type CombatantStats={
 id:string;health:number;attack:number;defense:number;speed:number;
 theme:string;weakness:string;resistance:string;
};
export type CombatFighter={
 id:string;hp:number;maxHp:number;guard:number;speedDelta:number;
 cooldown:number;specialCooldown:number;defenseCooldown:number;energy:number;
};
export type CombatTeam=[CombatFighter,CombatFighter,CombatFighter];
export type CombatAction={type:'strike'|'guard'};
export type CombatState={
 player:CombatTeam;rival:CombatTeam;
 playerActive:number;rivalActive:number;turn:number;
 outcome:'active'|'won'|'lost';
};
export function createCombatTeam(cards:readonly CombatantStats[],hpMultiplier=1):CombatTeam{
 if(cards.length!==3||new Set(cards.map(card=>card.id)).size!==3)throw Error('Expected three unique Guardians');
 if(!Number.isFinite(hpMultiplier)||hpMultiplier<=0)throw Error('Invalid HP multiplier');
 return cards.map(card=>{
  if(!Number.isFinite(card.health)||card.health<=0)throw Error('Invalid Guardian health');
  const maxHp=Math.max(1,Math.round(card.health*hpMultiplier));
  return {id:card.id,hp:maxHp,maxHp,guard:0,speedDelta:0,cooldown:0,specialCooldown:0,defenseCooldown:0,energy:2};
 }) as CombatTeam;
}
export function createCombatState(player:readonly CombatantStats[],rival:readonly CombatantStats[],rivalHpMultiplier:number):CombatState{
 return {player:createCombatTeam(player),rival:createCombatTeam(rival,rivalHpMultiplier),playerActive:0,rivalActive:0,turn:0,outcome:'active'};
}
function living(team:CombatTeam){return team.some(f=>f.hp>0)}
function nextLiving(team:CombatTeam,index:number){
 for(let n=0;n<team.length;n++){const i=(index+n)%team.length;if(team[i].hp>0)return i}
 return index;
}
function tick(team:CombatTeam):CombatTeam{
 return team.map(f=>({...f,cooldown:Math.max(0,f.cooldown-1),specialCooldown:Math.max(0,f.specialCooldown-1),defenseCooldown:Math.max(0,f.defenseCooldown-1)})) as CombatTeam;
}
function performStrike(attacker:CombatFighter,target:CombatFighter,source:CombatantStats,defender:CombatantStats,damageMultiplier=1){
 attacker.energy=Math.min(3,attacker.energy+1);
 const raw=Math.max(1,Math.round(strikeDamage(source,defender)*damageMultiplier));
 const hit=guardDamage(raw,target.guard);
 target.hp=Math.max(0,target.hp-hit.damage);target.guard=hit.guard;
 return hit.damage;
}
function performGuard(fighter:CombatFighter,defense:number,guardBase:number){
 if(fighter.energy<1||fighter.defenseCooldown!==0)throw Error('Guard is not ready');
 fighter.energy--;fighter.defenseCooldown=2;
 fighter.guard+=Math.max(16,Math.round(guardBase+defense*.28));
}
export function advanceBasicCombatTurn(
 prior:CombatState,
 action:CombatAction,
 cards:Readonly<Record<string,CombatantStats>>,
 rivalDamageMultiplier:number
):CombatState{
 if(prior.outcome!=='active')throw Error('Battle already finished');
 if(!Number.isInteger(prior.turn)||prior.turn<0||prior.turn>=200)throw Error('Invalid turn number');
 if(!Number.isFinite(rivalDamageMultiplier)||rivalDamageMultiplier<=0)throw Error('Invalid damage modifier');
 const p=tick(prior.player),r=tick(prior.rival);
 let pi=nextLiving(p,prior.playerActive),ri=nextLiving(r,prior.rivalActive);
 const player=p[pi],enemy=r[ri];
 if(!player||!enemy||player.hp<=0||enemy.hp<=0)throw Error('Invalid live combatants');
 const pc=cards[player.id],ec=cards[enemy.id];
 if(!pc||!ec)throw Error('Unknown combatant');
 // Only basic actions are supported by this initial pure server-side slice.
 // It must not be used to authorize rewards until every ability and swap is ported.
 if(action.type!=='strike'&&action.type!=='guard')throw Error('Unsupported combat action');
 if(action.type==='guard'&&(player.energy<1||player.defenseCooldown!==0))throw Error('Guard is unavailable');
 const playerFirst=pc.speed+player.speedDelta>=ec.speed+enemy.speedDelta;
 player.speedDelta=0;enemy.speedDelta=0;
 const playerMove=()=>action.type==='guard'?performGuard(player,pc.defense,22):performStrike(player,enemy,pc,ec);
 const enemyMove=()=>performStrike(enemy,player,ec,pc,rivalDamageMultiplier);
 if(playerFirst){playerMove();if(enemy.hp>0)enemyMove()}
 else {enemyMove();if(player.hp>0)playerMove()}
 pi=nextLiving(p,pi);ri=nextLiving(r,ri);
 const outcome=!living(r)?'won':!living(p)?'lost':'active';
 return {player:p,rival:r,playerActive:pi,rivalActive:ri,turn:prior.turn+1,outcome};
}
