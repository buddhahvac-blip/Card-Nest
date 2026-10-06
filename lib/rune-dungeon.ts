export type RuneDungeonFloor={
 floor:number;
 name:string;
 mission:string;
 enemyIds:string[];
 energy:number;
 hpMultiplier:number;
 damageMultiplier:number;
 boss?:boolean;
};

export const RUNE_DUNGEON_FLOORS:RuneDungeonFloor[]=[
 {floor:1,name:'Garden Gate',mission:'Break the Ember sentries guarding the first rune door.',enemyIds:['tidefin-003','voltbeak-005','reserved-009'],energy:10,hpMultiplier:.85,damageMultiplier:.85},
 {floor:2,name:'Moss Hall',mission:'Cross the overgrown hall and outlast its defensive flock.',enemyIds:['emberwing-002','reserved-008','bloomtail-004'],energy:15,hpMultiplier:.9,damageMultiplier:.9},
 {floor:3,name:'Storm Gallery',mission:'Read the affinity cycle before the storm flock strikes.',enemyIds:['mindfeather-006','sproutling-001','shadowclaw-007'],energy:15,hpMultiplier:1,damageMultiplier:.95},
 {floor:4,name:'Kiln Bridge',mission:'Push through a faster Ember formation without losing your anchor.',enemyIds:['reserved-009','reserved-010','reserved-011'],energy:20,hpMultiplier:1.05,damageMultiplier:1},
 {floor:5,name:'Flare Vault',mission:'Survive disruption and build Energy for a decisive Special.',enemyIds:['reserved-012','reserved-013','reserved-014'],energy:20,hpMultiplier:1.1,damageMultiplier:1.05},
 {floor:6,name:'Warden Forge',mission:'Crack a heavy Guard line before the forge overwhelms your team.',enemyIds:['reserved-015','reserved-016','reserved-017'],energy:20,hpMultiplier:1.15,damageMultiplier:1.08},
 {floor:7,name:'Scoria Run',mission:'Beat a balanced rival squad that can punish slow swaps.',enemyIds:['reserved-018','reserved-019','reserved-020'],energy:25,hpMultiplier:1.22,damageMultiplier:1.12},
 {floor:8,name:'Saffron Chamber',mission:'Control a mixed support line and protect your strongest finisher.',enemyIds:['reserved-021','reserved-012','reserved-010'],energy:25,hpMultiplier:1.3,damageMultiplier:1.18},
 {floor:9,name:'Crown Stair',mission:'Climb the final stair against an elite formation with no easy matchup.',enemyIds:['reserved-013','reserved-017','reserved-021'],energy:30,hpMultiplier:1.4,damageMultiplier:1.22},
 {floor:10,name:'Runeheart Sanctum',mission:'Defeat the Runeheart guardians and seal the dungeon core.',enemyIds:['reserved-012','reserved-015','reserved-020'],energy:60,hpMultiplier:1.65,damageMultiplier:1.35,boss:true}
];

export const RUNE_PACK_COSTS={
 hatchling:20,
 nest:50,
 guardian:90,
 royal:140
} as const;

export type RuneRewardPack=keyof typeof RUNE_PACK_COSTS;

export function runeFloor(floor:number){
 return RUNE_DUNGEON_FLOORS.find(entry=>entry.floor===floor);
}

export function runeEnergyForFloor(floor:number){
 return runeFloor(floor)?.energy??0;
}

export function runePackCost(pack:string){
 return RUNE_PACK_COSTS[pack as RuneRewardPack]??0;
}

export const RUNE_DUNGEON_TOTAL_ENERGY=RUNE_DUNGEON_FLOORS.reduce((sum,floor)=>sum+floor.energy,0);
