import {createHash} from 'node:crypto';
import {z} from 'zod';
import {seasonManifest} from './season-manifest';
import taxonomy from '../data/cardnest-taxonomy.json';
import {interests} from './nestforge-interests';

export const interest=z.enum(interests);
const uuid=z.string().uuid();
const id=z.string().uuid();
const note=z.string().trim().min(20).max(1200);
export const command=z.discriminatedUnion('action',[
 z.strictObject({action:z.literal('idea'),interests:z.array(interest).min(1).max(4).refine(a=>new Set(a).size===a.length),requestKey:uuid}),
 z.strictObject({action:z.literal('variation'),id,requestKey:uuid}),
 z.strictObject({action:z.literal('generate-art'),id,confirm:trueSchema(),requestKey:uuid}),
 z.strictObject({action:z.literal('oversee'),id}),
 z.strictObject({action:z.literal('approve'),id,note,rightsChecked:trueSchema(),visualChecked:trueSchema(),mobileChecked:trueSchema(),originalityChecked:trueSchema(),themeChecked:trueSchema(),qualityChecked:trueSchema()}),
 z.strictObject({action:z.literal('reject'),id,note}),
 z.strictObject({action:z.literal('promote'),id,confirm:z.literal('PROMOTE REVIEWED ASSET')})
]);
function trueSchema(){return z.literal(true)}
export const interestCommand=z.strictObject({interest,shareAggregate:z.literal(true)});
export type ConceptProfile={conceptId:string;nameCandidate:string;creatureType:string;theme:string;battleClassCandidate:string;personality:string;habitat:string;silhouette:string;colorDirection:string;animationIdea:string;packUseCandidate:boolean;cardUseCandidate:boolean;viewerUseCandidate:boolean;interestSignals:string[];generationPrompt:string;generationModel:string|null;createdAt:string;reviewStatus:string;overseerResults:null|{distinctIdentity:boolean;cardnestContinuity:boolean;creativeGrowth:boolean;notes:string[]};founderApproval:null|string;productionAssetUrl:null|string};
const anatomy=['orbital crest','lantern tail','folded sail wings','stone-petal mantle','spiral whiskers','floating shell crown','frond-like ears','ribbon fins','prismatic shoulder feathers','curved reed horns','seed-shaped arm plates','two-tiered feather fan'];
const bodies=['long-legged glider','compact burrower','round-bodied wader','lithe climber','small hovering bird','armored river crawler','plume-backed mammal','four-winged moth'];
const places:Record<string,string>={Bloom:'moss bridge under a giant tree',Ember:'glass-black lava terrace',Tide:'blue tidal cavern',Volt:'stormlit cloud garden',Mystic:'starlit floating observatory',Shadow:'moonlit violet glade'};
const colors:Record<string,string>={Bloom:'fern green and warm gold',Ember:'copper and amber',Tide:'aqua and pearl',Volt:'cyan and electric gold',Mystic:'ivory and sky gold',Shadow:'violet and indigo'};
const temperament=['curious','patient','brave','mischievous','thoughtful','gentle'];
const blocked=/pokemon|pokémon|pikachu|disney|lorcana|digimon|yu.?gi.?oh|magic.{0,5}gathering|in the style of|copy exactly/i;
const pick=(seed:string,list:string[],offset=0)=>list[parseInt(createHash('sha256').update(seed+':'+offset).digest('hex').slice(0,8),16)%list.length];
export function signature(profile:Pick<ConceptProfile,'theme'|'creatureType'|'silhouette'|'habitat'>){return [profile.theme,profile.creatureType,profile.silhouette,profile.habitat].map(x=>x.toLowerCase().trim()).join('|')}
export function makeConcept(signals:string[],conceptId:string,createdAt=new Date().toISOString()):ConceptProfile{
 const theme=signals.find(x=>['Bloom','Ember','Tide','Volt','Mystic','Shadow'].includes(x))||({Ocean:'Tide',Forest:'Bloom',Volcanic:'Ember',Celestial:'Mystic',Night:'Shadow'} as Record<string,string>)[signals.find(x=>['Ocean','Forest','Volcanic','Celestial','Night'].includes(x))||'']||'Mystic';
 const body=pick(conceptId,bodies),feature=pick(conceptId,anatomy,1),personality=pick(conceptId,temperament,2);
 const creatureType=signals.includes('Birds')?'avian '+body:body;
 const silhouette=`${body} with ${feature}`;
 const nameCandidate=`${pick(conceptId,['Aster','Moss','Cinder','Ripple','Vesper','Kite','Lumen','Cairn'],3)}${pick(conceptId,['whorl','crest','glow','ling','drift','plume','tide','spark'],4)}`;
 const battleClassCandidate=signals.includes('Fast')?'Scout':signals.includes('Strong')?'Vanguard':signals.includes('Cute')?'Support':'Warden';
 const habitat=places[theme],colorDirection=colors[theme];
 const generationPrompt=`Create one original CardNest avatar concept: ${nameCandidate}, a ${personality} ${creatureType}. Distinct silhouette: ${silhouette}. Habitat: ${habitat}. Theme: ${theme}, color direction: ${colorDirection}. Battle class: ${battleClassCandidate}, using its independent class icon only in later card layout. Premium dark teal and metallic gold First Flight presentation. Original anatomy, expressive personality, family-friendly illustration. No text, logos, watermark, famous character, franchise design, or existing card frame. Avoid resemblance to canonical CardNest guardians. Human rights and art review required.`;
 return {conceptId,nameCandidate,creatureType,theme,battleClassCandidate,personality,habitat,silhouette,colorDirection,animationIdea:`A subtle ${feature} shimmer as it turns toward the viewer`,packUseCandidate:true,cardUseCandidate:true,viewerUseCandidate:true,interestSignals:signals,generationPrompt,generationModel:null,createdAt,reviewStatus:'idea',overseerResults:null,founderApproval:null,productionAssetUrl:null};
}
export function oversee(profile:ConceptProfile,existingSignatures:string[]=[]){
 const canonical=seasonManifest.some(c=>c.name.toLowerCase()===profile.nameCandidate.toLowerCase()||signature({theme:c.theme,creatureType:c.creatureType,silhouette:c.silhouette,habitat:c.habitat})===signature(profile));
 const distinctIdentity=!canonical&&!existingSignatures.includes(signature(profile));
 const cardnestContinuity=!!(taxonomy.themes as Record<string,unknown>)[profile.theme]&&!!(taxonomy.battleClasses as Record<string,unknown>)[profile.battleClassCandidate]&&profile.generationPrompt.includes('dark teal and metallic gold')&&!blocked.test(profile.generationPrompt);
 const creativeGrowth=new Set([profile.silhouette,profile.personality,profile.habitat,profile.animationIdea]).size>=3&&profile.silhouette.length>18;
 const notes=[!distinctIdentity&&'Possible canonical or existing concept duplication',!cardnestContinuity&&'Theme, class, brand, or originality check failed',!creativeGrowth&&'Insufficient creative dimensions'].filter(Boolean) as string[];
 return {distinctIdentity,cardnestContinuity,creativeGrowth,notes,pass:distinctIdentity&&cardnestContinuity&&creativeGrowth};
}
export function generationLimits(){const daily=Math.max(0,Math.min(20,Number(process.env.NESTFORGE_IMAGE_DAILY_LIMIT)||0));const global=Math.max(0,Math.min(100,Number(process.env.NESTFORGE_IMAGE_GLOBAL_DAILY_LIMIT)||0));const budget=Math.max(0,Math.min(100000,Number(process.env.NESTFORGE_IMAGE_DAILY_BUDGET_CENTS)||0));const unit=Math.max(0,Math.min(10000,Number(process.env.NESTFORGE_IMAGE_UNIT_COST_CENTS)||0));return {daily,global,budget,unit,enabled:!!process.env.OPENAI_API_KEY&&!!process.env.NESTFORGE_IMAGE_MODEL&&daily>0&&global>0&&budget>0&&unit>0&&unit<=budget}}
export function canPromote(row:{state:string;asset_key:string|null;overseer?:{pass:boolean;quality?:{productionStatus:string;blockingIssues:unknown[]}}|null;founder_approval:Date|null}){return row.state==='approved'&&!!row.asset_key&&row.overseer?.pass===true&&row.overseer.quality?.productionStatus==='PRODUCTION READY'&&row.overseer.quality.blockingIssues.length===0&&!!row.founder_approval}
