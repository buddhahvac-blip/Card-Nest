export const NEST_BATTLE_RULES_VERSION = 'nest-battles-alpha-2-specials';

export const CLASS_GUIDE: Record<string,{label:string;purpose:string}> = {
  Scout:{label:'Scout',purpose:'Acts quickly and changes turn order.'},
  Striker:{label:'Striker',purpose:'Pressures the rival with direct damage.'},
  Vanguard:{label:'Vanguard',purpose:'Absorbs pressure and protects momentum.'},
  Support:{label:'Support',purpose:'Restores health and keeps a team in the fight.'},
  Warden:{label:'Warden',purpose:'Builds Guard and creates safer turns.'},
  Disruptor:{label:'Disruptor',purpose:'Slows rivals and breaks their timing.'},
};

export function affinityMultiplier(attackerTheme:string,defender:{weakness:string;resistance:string}){
  if(attackerTheme===defender.weakness)return 1.25;
  if(attackerTheme===defender.resistance)return 0.8;
  return 1;
}

export function strikeDamage(
  attacker:{attack:number;theme:string},
  defender:{defense:number;weakness:string;resistance:string}
){
  const base=Math.max(6,Math.round(attacker.attack*0.55-defender.defense*0.18));
  return Math.max(4,Math.round(base*affinityMultiplier(attacker.theme,defender)));
}

export function abilityDamage(
  attacker:{attack:number;theme:string},
  defender:{defense:number;weakness:string;resistance:string},
  amount:number
){
  const base=Math.max(8,Math.round(attacker.attack*0.25+amount-defender.defense*0.08));
  return Math.max(6,Math.round(base*affinityMultiplier(attacker.theme,defender)));
}

export function guardDamage(incoming:number,guard:number){
  const absorbed=Math.min(incoming,guard);
  return {damage:incoming-absorbed,guard:guard-absorbed,absorbed};
}
