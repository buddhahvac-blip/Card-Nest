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
 coverArt:string;
 tagline:string;
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
 worldBoss?:boolean;
};

export const RUNE_DUNGEON_WORLDS:RuneDungeonWorld[]=[
 {
  id:'verdant',
  name:'Thornveil Wilds',
  subtitle:'World I · The Rootbound Wilds',
  description:'Ten missions through ancient rootways, drowned ruins and rune-choked groves where Bloom, Tide and Mystic guardians stalk the mist.',
  floorRange:[1,10],
  themes:['Bloom','Tide','Mystic'],
  landscape:'Rootbound Ruins and Mist Gardens',
  musicKey:'verdant',
  musicTitle:'Fairy Battles',
  coverArt:'/art/dungeons/thornveil-wilds.svg',
  tagline:'The roots remember every trespass.'
 },
 {
  id:'emberstorm',
  name:'Cindermaw Crucible',
  subtitle:'World II · The Infernal Forge',
  description:'Ten missions across molten bridges, obsidian keeps and storm-charged rune forges where Ember and Volt guardians hunt without mercy.',
  floorRange:[11,20],
  themes:['Ember','Volt'],
  landscape:'Obsidian Forges and Magma Chasms',
  musicKey:'emberstorm',
  musicTitle:'Hope (Orchestral battle music)',
  coverArt:'/art/dungeons/cindermaw-crucible.svg',
  tagline:'Only the strongest survive the fire.'
 },
 {
  id:'eclipse',
  name:'Dreadmoon Runeheart',
  subtitle:'World III · The Veiled Crown',
  description:'Ten elite missions beneath a broken moon, through floating ruins and rune-scarred halls where Shadow, Mystic and Ember guardians defend the final Runeheart.',
  floorRange:[21,30],
  themes:['Shadow','Mystic','Ember'],
  landscape:'Dreadmoon Citadel and Floating Ruins',
  musicKey:'eclipse',
  musicTitle:'Heavy Boss Battle 2',
  coverArt:'/art/dungeons/dreadmoon-runeheart.svg',
  tagline:'Beyond the veil, the Runeheart waits.'
 }
];

export const RUNE_DUNGEON_FLOORS:RuneDungeonFloor[]=[
 {floor:1,world:'verdant',name:'Garden Gate',mission:'Break the Bloom sentries guarding the first living rune door.',enemyIds:['emberwing-002','bloomtail-004','sproutling-001'],energy:10,hpMultiplier:0.58,damageMultiplier:0.46},
 {floor:2,world:'verdant',name:'Waterroot Terrace',mission:'Cross the waterfall roots while Tide and Mystic guardians bend the tempo.',enemyIds:['bloomtail-004','sproutling-001','emberwing-002'],energy:15,hpMultiplier:0.67,damageMultiplier:0.53},
 {floor:3,world:'verdant',name:'Canopy Trail',mission:'Push through a moving canopy where Bloom defenders rotate in and out.',enemyIds:['bloomtail-004','reserved-009','sproutling-001'],energy:15,hpMultiplier:0.76,damageMultiplier:0.61},
 {floor:4,world:'verdant',name:'Mosslight Crossing',mission:'Survive a defensive grove built around healing and Guard pressure.',enemyIds:['reserved-010','bloomtail-004','reserved-012'],energy:20,hpMultiplier:0.86,damageMultiplier:0.7},
 {floor:5,world:'verdant',name:'Petal Maze',mission:'Find the open lane through a maze of roots, mist and quick Mystic counters.',enemyIds:['sproutling-001','reserved-013','bloomtail-004'],energy:20,hpMultiplier:0.96,damageMultiplier:0.8},
 {floor:6,world:'verdant',name:'Tidebloom Falls',mission:'Fight beside the great falls against a mixed Tide and Bloom formation.',enemyIds:['reserved-014','bloomtail-004','sproutling-001'],energy:20,hpMultiplier:1.06,damageMultiplier:0.91},
 {floor:7,world:'verdant',name:'Sunleaf Rise',mission:'Climb the radiant grove while elite sentries accelerate every turn.',enemyIds:['reserved-015','reserved-016','bloomtail-004'],energy:25,hpMultiplier:1.17,damageMultiplier:1.02},
 {floor:8,world:'verdant',name:'Oracle Roots',mission:'Break a Mystic control line beneath the oldest living runes.',enemyIds:['sproutling-001','reserved-017','reserved-018'],energy:25,hpMultiplier:1.28,damageMultiplier:1.13},
 {floor:9,world:'verdant',name:'Crown Canopy',mission:'Defeat the final Skywild formation before the sovereign chamber opens.',enemyIds:['reserved-020','bloomtail-004','sproutling-001'],energy:30,hpMultiplier:1.4,damageMultiplier:1.24},
 {floor:10,world:'verdant',name:'Canopy Sovereigns',mission:'Face Rare Deepstream Oarfish and Orchidhelm Guardian in the Skywild world-boss arena.',enemyIds:['reserved-108','reserved-168','sproutling-001'],energy:60,hpMultiplier:1.55,damageMultiplier:1.36,worldBoss:true},

 {floor:11,world:'emberstorm',name:'Kiln Bridge',mission:'Push through Ember sentries on a bridge above the rune furnaces.',enemyIds:['reserved-009','reserved-010','mindfeather-006'],energy:10,hpMultiplier:0.64,damageMultiplier:0.52},
 {floor:12,world:'emberstorm',name:'Flare Vault',mission:'Survive aggressive Ember pressure and build Energy for a decisive Special.',enemyIds:['reserved-012','reserved-013','reserved-014'],energy:15,hpMultiplier:0.73,damageMultiplier:0.59},
 {floor:13,world:'emberstorm',name:'Ashcoil Pass',mission:'Cross a smoke-filled pass guarded by fast Volt strikers.',enemyIds:['mindfeather-006','reserved-015','reserved-016'],energy:15,hpMultiplier:0.82,damageMultiplier:0.67},
 {floor:14,world:'emberstorm',name:'Cinder Lift',mission:'Ride the forge lift while waves of Ember guardians attack from both sides.',enemyIds:['reserved-017','reserved-018','reserved-020'],energy:20,hpMultiplier:0.92,damageMultiplier:0.76},
 {floor:15,world:'emberstorm',name:'Volt Furnace',mission:'Defeat a speed-focused Volt formation inside the charged furnace hall.',enemyIds:['mindfeather-006','reserved-020','reserved-021'],energy:20,hpMultiplier:1.02,damageMultiplier:0.86},
 {floor:16,world:'emberstorm',name:'Warden Forge',mission:'Crack a heavy Guard line inside the molten forge.',enemyIds:['reserved-015','reserved-016','reserved-017'],energy:20,hpMultiplier:1.12,damageMultiplier:0.97},
 {floor:17,world:'emberstorm',name:'Thunder Chain',mission:'Survive linked lightning attacks across a collapsing chain bridge.',enemyIds:['mindfeather-006','reserved-018','reserved-020'],energy:25,hpMultiplier:1.23,damageMultiplier:1.08},
 {floor:18,world:'emberstorm',name:'Magma Crown',mission:'Fight an elite Ember formation at the summit of the Crucible.',enemyIds:['reserved-012','reserved-014','reserved-017'],energy:25,hpMultiplier:1.34,damageMultiplier:1.19},
 {floor:19,world:'emberstorm',name:'Storm Gate',mission:'Break the final storm seal before the world-boss arena opens.',enemyIds:['mindfeather-006','reserved-020','reserved-021'],energy:30,hpMultiplier:1.46,damageMultiplier:1.3},
 {floor:20,world:'emberstorm',name:'Stormwarden Apex',mission:'Challenge Rare Roadwarden Caracara and elite Crucible guardians at the volcanic summit.',enemyIds:['reserved-229','reserved-018','reserved-020'],energy:60,hpMultiplier:1.61,damageMultiplier:1.42,worldBoss:true},

 {floor:21,world:'eclipse',name:'Moonveil Gate',mission:'Enter the Eclipse world and fight through Shadow and Mystic control.',enemyIds:['shadowclaw-007','sproutling-001','reserved-021'],energy:10,hpMultiplier:0.7,damageMultiplier:0.58},
 {floor:22,world:'eclipse',name:'Whisper Hall',mission:'Survive a deceptive Shadow formation inside the silent rune halls.',enemyIds:['shadowclaw-007','reserved-017','sproutling-001'],energy:15,hpMultiplier:0.79,damageMultiplier:0.65},
 {floor:23,world:'eclipse',name:'Astral Steps',mission:'Climb the star-lit stair while Mystic guardians control the battlefield.',enemyIds:['sproutling-001','reserved-020','shadowclaw-007'],energy:15,hpMultiplier:0.88,damageMultiplier:0.73},
 {floor:24,world:'eclipse',name:'Void Garden',mission:'Fight a mixed Shadow and Ember squad among floating black runes.',enemyIds:['shadowclaw-007','reserved-014','reserved-021'],energy:20,hpMultiplier:0.98,damageMultiplier:0.82},
 {floor:25,world:'eclipse',name:'Nightglass Vault',mission:'Break a fortified Mystic defense before the vault seals completely.',enemyIds:['sproutling-001','reserved-016','reserved-020'],energy:20,hpMultiplier:1.08,damageMultiplier:0.92},
 {floor:26,world:'eclipse',name:'Eclipse Bridge',mission:'Cross the void bridge under constant Shadow pressure.',enemyIds:['shadowclaw-007','reserved-017','reserved-018'],energy:20,hpMultiplier:1.18,damageMultiplier:1.03},
 {floor:27,world:'eclipse',name:'Crown of Echoes',mission:'Climb the final rune stair against an elite mixed-theme formation.',enemyIds:['shadowclaw-007','sproutling-001','reserved-017'],energy:25,hpMultiplier:1.29,damageMultiplier:1.14},
 {floor:28,world:'eclipse',name:'Serpent Archive',mission:'Defeat the archive sentries guarding the old constellation records.',enemyIds:['reserved-299','shadowclaw-007','sproutling-001'],energy:25,hpMultiplier:1.4,damageMultiplier:1.25},
 {floor:29,world:'eclipse',name:'Runeheart Threshold',mission:'Survive the final elite formation before the Runeheart opens.',enemyIds:['reserved-359','reserved-229','shadowclaw-007'],energy:30,hpMultiplier:1.52,damageMultiplier:1.36},
 {floor:30,world:'eclipse',name:'Runeheart Sanctum',mission:'Defeat Epic Constellation Keeper Serpent and Velvet Coil Serpent, with Rare Roadwarden Caracara guarding the Runeheart core.',enemyIds:['reserved-299','reserved-359','reserved-229'],energy:60,hpMultiplier:1.67,damageMultiplier:1.48,boss:true}
];

export const RUNE_PACK_COSTS={
 hatchling:100,
 nest:220,
 guardian:400
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

export function worldFloorNumber(floor:number){
 return ((floor-1)%10)+1;
}

export const RUNE_DUNGEON_TOTAL_ENERGY=RUNE_DUNGEON_FLOORS.reduce((sum,floor)=>sum+floor.energy,0);

// Each world is an independent campaign. Never authorize from highestCleared:
// floor 21 can be cleared before floor 1, and must not unlock floors 2–20.
export function isRuneFloorUnlocked(floor:number,cleared:ReadonlySet<number>){
 const entry=runeFloor(floor);
 if(!entry)return false;
 if(cleared.has(floor))return true; // Existing clears remain replayable.
 const first=runeWorld(entry.world).floorRange[0];
 for(let previous=first;previous<floor;previous++){
  if(!cleared.has(previous))return false;
 }
 return true;
}

export function runeUnlockedFloors(cleared:ReadonlySet<number>){
 return RUNE_DUNGEON_FLOORS.filter(entry=>isRuneFloorUnlocked(entry.floor,cleared)).map(entry=>entry.floor);
}


export type DungeonRotationCard={id:string;theme:string;rarity:string};

function stableHash(value:string){
 let h=2166136261;
 for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619)}
 return h>>>0;
}

function etDateKey(date:Date){
 return new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
}

/** Rotation changes once daily at 3:00 AM America/New_York. */
export function dungeonRotationKey(now=new Date()){
 const hour=Number(new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'2-digit',hourCycle:'h23'}).format(now));
 return etDateKey(hour<3?new Date(now.getTime()-24*60*60*1000):now);
}

function rotate<T>(items:T[],offset:number){
 if(!items.length)return items;
 const n=offset%items.length;
 return [...items.slice(n),...items.slice(0,n)];
}

/**
 * Only cards supplied here are allowed into the dynamic enemy roster.
 * Callers must pass cards that have approved shipped art or have passed the live
 * integration gate. This prevents concept-only records from appearing in combat.
 */
export function dungeonEnemyRotations(cards:readonly DungeonRotationCard[],key=dungeonRotationKey()){
 const unique=[...new Map(cards.map(card=>[card.id,card])).values()];
 const result:Record<string,string[]>={};
 for(const floor of RUNE_DUNGEON_FLOORS){
  const world=runeWorld(floor.world);
  const themed=unique.filter(card=>world.themes.includes(card.theme));
  const level=worldFloorNumber(floor.floor);
  // Start with Common/Uncommon enemies. Introduce stronger rarity pools gradually.
  const allowed=level<=3?['common','uncommon']:level<=6?['common','uncommon','rare']:level<=8?['uncommon','rare','epic']:level===9?['rare','epic','legendary']:['rare','epic','ultra','legendary'];
  const eligible=themed.filter(card=>allowed.includes(card.rarity.toLowerCase()));
  const fallback=unique.filter(card=>allowed.includes(card.rarity.toLowerCase()));
  const base=eligible.length>=3?eligible:fallback.length>=3?fallback:themed.length>=3?themed:unique;
  const ordered=[...base].sort((a,b)=>stableHash(key+':'+floor.floor+':'+a.id)-stableHash(key+':'+floor.floor+':'+b.id));
  const chosen=rotate(ordered,stableHash(key+':offset:'+floor.floor)).slice(0,3).map(card=>card.id);
  result[String(floor.floor)]=chosen.length===3?chosen:floor.enemyIds;
 }
 return result;
}
