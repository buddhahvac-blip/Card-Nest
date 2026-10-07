export type RuneWorldId='verdant'|'emberstorm'|'eclipse';

export type RuneDungeonWorld={
 id:RuneWorldId;
 name:string;
 subtitle:string;
 description:string;
 floorRange:[number,number];
 themes:string[];
 landscape:string;
 musicKey:RuneWorldId;
 musicTitle:string;
};

export type RuneDungeonFloor={
 floor:number;
 world:RuneWorldId;
 name:string;
 mission:string;
 enemyIds:string[];
 energy:number;
 hpMultiplier:number;
 damageMultiplier:number;
 boss?:boolean;
};

export const RUNE_DUNGEON_WORLDS:RuneDungeonWorld[]=[
 {
  id:'verdant',
  name:'Verdant Skywilds',
  subtitle:'World I · The Living Canopy',
  description:'Floating gardens, glowing roots and waterfall paths where Bloom, Tide and Mystic guardians control the field.',
  floorRange:[1,3],
  themes:['Bloom','Tide','Mystic'],
  landscape:'Enchanted Garden of Lands',
  musicKey:'verdant',
  musicTitle:'Fairy Battles'
 },
 {
  id:'emberstorm',
  name:'Emberstorm Crucible',
  subtitle:'World II · The Burning Heights',
  description:'Storm-lit volcanic bridges and rune forges ruled by Ember and Volt guardians with faster, harder pressure.',
  floorRange:[4,7],
  themes:['Ember','Volt'],
  landscape:'Ashen Peaks and Rune Forges',
  musicKey:'emberstorm',
  musicTitle:'Hope (Orchestral battle music)'
 },
 {
  id:'eclipse',
  name:'Eclipse Runeheart',
  subtitle:'World III · The Shadow Crown',
  description:'A moonlit void citadel where Shadow and Mystic energy mix with elite Ember guardians before the Runeheart Boss.',
  floorRange:[8,10],
  themes:['Shadow','Mystic','Ember'],
  landscape:'Moonlit Runeheart Citadel',
  musicKey:'eclipse',
  musicTitle:'Heavy Boss Battle 2'
 }
];

export const RUNE_DUNGEON_FLOORS:RuneDungeonFloor[]=[
 {floor:1,world:'verdant',name:'Garden Gate',mission:'Break the Bloom sentries guarding the first living rune door.',enemyIds:['emberwing-002','bloomtail-004','sproutling-001'],energy:10,hpMultiplier:.85,damageMultiplier:.85},
 {floor:2,world:'verdant',name:'Waterroot Terrace',mission:'Cross the waterfall roots while Tide and Mystic guardians bend the tempo.',enemyIds:['bloomtail-004','sproutling-001','emberwing-002'],energy:15,hpMultiplier:.9,damageMultiplier:.9},
 {floor:3,world:'verdant',name:'Canopy Sovereigns',mission:'Face the first world bosses: Rare Deepstream Oarfish and Orchidhelm Guardian, backed by a Mystic sentinel.',enemyIds:['reserved-108','reserved-168','sproutling-001'],energy:15,hpMultiplier:1.08,damageMultiplier:1.0,boss:true},

 {floor:4,world:'emberstorm',name:'Kiln Bridge',mission:'Push through Ember sentries on a bridge above the rune furnaces.',enemyIds:['reserved-009','reserved-010','mindfeather-006'],energy:20,hpMultiplier:1.05,damageMultiplier:1},
 {floor:5,world:'emberstorm',name:'Flare Vault',mission:'Survive aggressive Ember pressure and build Energy for a decisive Special.',enemyIds:['reserved-012','reserved-013','reserved-014'],energy:20,hpMultiplier:1.1,damageMultiplier:1.05},
 {floor:6,world:'emberstorm',name:'Warden Forge',mission:'Crack a heavy Guard line inside the molten forge.',enemyIds:['reserved-015','reserved-016','reserved-017'],energy:20,hpMultiplier:1.15,damageMultiplier:1.08},
 {floor:7,world:'emberstorm',name:'Stormwarden Apex',mission:'Challenge Rare Roadwarden Caracara and a pair of elite Crucible guardians at the volcanic summit.',enemyIds:['reserved-229','reserved-018','reserved-020'],energy:25,hpMultiplier:1.3,damageMultiplier:1.16,boss:true},

 {floor:8,world:'eclipse',name:'Moonveil Chamber',mission:'Enter the Eclipse world and fight through Shadow and Mystic control.',enemyIds:['shadowclaw-007','sproutling-001','reserved-021'],energy:25,hpMultiplier:1.3,damageMultiplier:1.18},
 {floor:9,world:'eclipse',name:'Crown of Echoes',mission:'Climb the final rune stair against an elite mixed-theme formation.',enemyIds:['shadowclaw-007','sproutling-001','reserved-017'],energy:30,hpMultiplier:1.4,damageMultiplier:1.22},
 {floor:10,world:'eclipse',name:'Runeheart Sanctum',mission:'Defeat the Epic Constellation Keeper Serpent and Velvet Coil Serpent, with a Rare Roadwarden Caracara guarding the Runeheart core.',enemyIds:['reserved-299','reserved-359','reserved-229'],energy:60,hpMultiplier:1.65,damageMultiplier:1.35,boss:true}
];

export const RUNE_PACK_COSTS={
 hatchling:20,
 nest:50,
 guardian:90,
 royal:140
} as const;

export type RuneRewardPack=keyof typeof RUNE_PACK_COSTS;

export function runeWorld(id:RuneWorldId){
 return RUNE_DUNGEON_WORLDS.find(world=>world.id===id)!;
}

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
