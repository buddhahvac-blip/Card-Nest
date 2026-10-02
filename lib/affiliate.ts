import 'server-only';
import {database} from './postgres';

type Partner='tcgplayer'|'ebay'|'amazon'|'target'|'walmart'|'fanatics'|'vaultx'|'psa';
type Category='Pokemon'|'Magic'|'Supplies'|'Sports'|'Grading';
type Entry={
 slug:string;
 partner:Partner;
 label:string;
 category:Category;
 env:string;
 approvalEnv:string;
 allowedHosts:string[];
 description:string;
};

const entries:Entry[]=[
 {slug:'tcg-pokemon',partner:'tcgplayer',label:'Shop Pokémon on TCGplayer',category:'Pokemon',env:'AFFILIATE_TCGPLAYER_POKEMON_URL',approvalEnv:'AFFILIATE_TCGPLAYER_APPROVED',allowedHosts:['tcgplayer.com','www.tcgplayer.com','tcgplayer.pxf.io'],description:'Third-party Pokémon marketplace discovery.'},
 {slug:'tcg-magic',partner:'tcgplayer',label:'Shop Magic on TCGplayer',category:'Magic',env:'AFFILIATE_TCGPLAYER_MAGIC_URL',approvalEnv:'AFFILIATE_TCGPLAYER_APPROVED',allowedHosts:['tcgplayer.com','www.tcgplayer.com','tcgplayer.pxf.io'],description:'Third-party Magic: The Gathering marketplace discovery.'},
 {slug:'ebay-pokemon',partner:'ebay',label:'Shop Pokémon on eBay',category:'Pokemon',env:'AFFILIATE_EBAY_POKEMON_URL',approvalEnv:'AFFILIATE_EBAY_APPROVED',allowedHosts:['ebay.com','www.ebay.com','ebay.us','rover.ebay.com'],description:'Third-party Pokémon marketplace discovery.'},
 {slug:'ebay-magic',partner:'ebay',label:'Shop Magic on eBay',category:'Magic',env:'AFFILIATE_EBAY_MAGIC_URL',approvalEnv:'AFFILIATE_EBAY_APPROVED',allowedHosts:['ebay.com','www.ebay.com','ebay.us','rover.ebay.com'],description:'Third-party Magic: The Gathering marketplace discovery.'},
 {slug:'amazon-pokemon',partner:'amazon',label:'Shop Pokémon on Amazon',category:'Pokemon',env:'AFFILIATE_AMAZON_POKEMON_URL',approvalEnv:'AFFILIATE_AMAZON_APPROVED',allowedHosts:['amazon.com','www.amazon.com','amzn.to'],description:'Third-party Pokémon retail discovery.'},
 {slug:'amazon-magic',partner:'amazon',label:'Shop Magic on Amazon',category:'Magic',env:'AFFILIATE_AMAZON_MAGIC_URL',approvalEnv:'AFFILIATE_AMAZON_APPROVED',allowedHosts:['amazon.com','www.amazon.com','amzn.to'],description:'Third-party Magic retail discovery.'},
 {slug:'amazon-supplies',partner:'amazon',label:'Shop card supplies on Amazon',category:'Supplies',env:'AFFILIATE_AMAZON_SUPPLIES_URL',approvalEnv:'AFFILIATE_AMAZON_APPROVED',allowedHosts:['amazon.com','www.amazon.com','amzn.to'],description:'Binders, sleeves and storage discovery.'},
 {slug:'target-pokemon',partner:'target',label:'Shop Pokémon at Target',category:'Pokemon',env:'AFFILIATE_TARGET_POKEMON_URL',approvalEnv:'AFFILIATE_TARGET_APPROVED',allowedHosts:['target.com','www.target.com','goto.target.com'],description:'Third-party Pokémon retail discovery.'},
 {slug:'target-magic',partner:'target',label:'Shop Magic at Target',category:'Magic',env:'AFFILIATE_TARGET_MAGIC_URL',approvalEnv:'AFFILIATE_TARGET_APPROVED',allowedHosts:['target.com','www.target.com','goto.target.com'],description:'Third-party Magic retail discovery.'},
 {slug:'walmart-pokemon',partner:'walmart',label:'Shop Pokémon at Walmart',category:'Pokemon',env:'AFFILIATE_WALMART_POKEMON_URL',approvalEnv:'AFFILIATE_WALMART_APPROVED',allowedHosts:['walmart.com','www.walmart.com','goto.walmart.com'],description:'Third-party Pokémon retail discovery.'},
 {slug:'walmart-magic',partner:'walmart',label:'Shop Magic at Walmart',category:'Magic',env:'AFFILIATE_WALMART_MAGIC_URL',approvalEnv:'AFFILIATE_WALMART_APPROVED',allowedHosts:['walmart.com','www.walmart.com','goto.walmart.com'],description:'Third-party Magic retail discovery.'},
 {slug:'fanatics-sports',partner:'fanatics',label:'Shop sports collectibles at Fanatics',category:'Sports',env:'AFFILIATE_FANATICS_SPORTS_URL',approvalEnv:'AFFILIATE_FANATICS_APPROVED',allowedHosts:['fanatics.com','www.fanatics.com'],description:'Licensed sports collectible discovery.'},
 {slug:'vaultx-supplies',partner:'vaultx',label:'Shop collection protection at Vault X',category:'Supplies',env:'AFFILIATE_VAULTX_SUPPLIES_URL',approvalEnv:'AFFILIATE_VAULTX_APPROVED',allowedHosts:['vaultx.com','www.vaultx.com','us.vaultx.com'],description:'Binders, sleeves, deck boxes and protection.'},
 {slug:'psa-grading',partner:'psa',label:'Explore grading with PSA',category:'Grading',env:'AFFILIATE_PSA_GRADING_URL',approvalEnv:'AFFILIATE_PSA_APPROVED',allowedHosts:['psacard.com','www.psacard.com'],description:'Third-party grading and authentication services.'}
];

function safeUrl(entry:Entry){
 if(process.env[entry.approvalEnv]!=='true')return null;
 const raw=process.env[entry.env];
 if(!raw)return null;
 try{
  const u=new URL(raw);
  if(u.protocol!=='https:')return null;
  const host=u.hostname.toLowerCase();
  if(!entry.allowedHosts.some(h=>host===h||host.endsWith('.'+h)))return null;
  return u.toString();
 }catch{return null}
}

export function affiliateCatalog(){
 return entries.map(entry=>{
  const url=safeUrl(entry);
  const {env,approvalEnv,allowedHosts,...publicEntry}=entry;
  return {...publicEntry,active:!!url,url};
 });
}

export function affiliateDestination(slug:string){
 const entry=entries.find(x=>x.slug===slug);
 if(!entry)return null;
 const url=safeUrl(entry);
 return url?{entry,url}:null;
}

export async function recordAffiliateClick(slug:string){
 const entry=entries.find(x=>x.slug===slug);if(!entry)return;
 // Privacy-first aggregate event: no CardNest account id, email, IP address, or user-agent value is stored in this database event.
 await database().query("INSERT INTO security_events(kind,actor_id,subject,details) VALUES('affiliate-click',NULL,$1,$2)",[slug,JSON.stringify({partner:entry.partner,category:entry.category,placement:'discover'})]).catch(()=>{});
}
