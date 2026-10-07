export type BattleAbilityProfile='uncommon'|'high'|'standard';

export function battleAbilityProfile(rarity:string):BattleAbilityProfile{
 const value=String(rarity||'').toLowerCase();
 if(value==='uncommon')return 'uncommon';
 if(value==='rare'||value==='epic'||value==='legendary')return 'high';
 return 'standard';
}

export function rarityAttackTuning(rarity:string){
 const value=String(rarity||'').toLowerCase();
 if(value==='legendary')return {power:34,special:58,guard:30};
 if(value==='epic')return {power:30,special:50,guard:28};
 if(value==='rare')return {power:26,special:44,guard:25};
 if(value==='uncommon')return {power:0,special:0,guard:20};
 return {power:22,special:38,guard:22};
}
