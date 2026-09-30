import 'server-only';
import {database} from './postgres';

type Partner='tcgplayer'|'ebay';
type Entry={
 slug:string;
 partner:Partner;
 label:string;
 category:'Pokemon'|'Magic';
 env:string;
 approvalEnv:string;
 allowedHosts:string[];
 description:string;
};

const entries:Entry[]=[
 {slug:'tcg-pokemon',partner:'tcgplayer',label:'Shop Pokémon on TCGplayer',category:'Pokemon',env:'AFFILIATE_TCGPLAYER_POKEMON_URL',approvalEnv:'AFFILIATE_TCGPLAYER_APPROVED',allowedHosts:['tcgplayer.com','www.tcgplayer.com','tcgplayer.pxf.io'],description:'Third-party Pokémon marketplace discovery.'},
 {slug:'tcg-magic',partner:'tcgplayer',label:'Shop Magic on TCGplayer',category:'Magic',env:'AFFILIATE_TCGPLAYER_MAGIC_URL',approvalEnv:'AFFILIATE_TCGPLAYER_APPROVED',allowedHosts:['tcgplayer.com','www.tcgplayer.com','tcgplayer.pxf.io'],description:'Third-party Magic: The Gathering marketplace discovery.'},
 {slug:'ebay-pokemon',partner:'ebay',label:'Shop Pokémon on eBay',category:'Pokemon',env:'AFFILIATE_EBAY_POKEMON_URL',approvalEnv:'AFFILIATE_EBAY_APPROVED',allowedHosts:['ebay.com','www.ebay.com','ebay.us','rover.ebay.com'],description:'Third-party Pokémon marketplace discovery.'},
 {slug:'ebay-magic',partner:'ebay',label:'Shop Magic on eBay',category:'Magic',env:'AFFILIATE_EBAY_MAGIC_URL',approvalEnv:'AFFILIATE_EBAY_APPROVED',allowedHosts:['ebay.com','www.ebay.com','ebay.us','rover.ebay.com'],description:'Third-party Magic: The Gathering marketplace discovery.'}
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
 return entries.map(({env,approvalEnv,allowedHosts,...entry})=>({...entry,active:!!safeUrl({...entry,env,approvalEnv,allowedHosts})}));
}

export function affiliateDestination(slug:string){
 const entry=entries.find(x=>x.slug===slug);
 if(!entry)return null;
 const url=safeUrl(entry);
 return url?{entry,url}:null;
}

export async function recordAffiliateClick(slug:string){
 const entry=entries.find(x=>x.slug===slug);if(!entry)return;
 // Privacy-first aggregate event: no account id, email, IP address, user agent, or cross-site profile.
 await database().query("INSERT INTO security_events(kind,actor_id,subject,details) VALUES('affiliate-click',NULL,$1,$2)",[slug,JSON.stringify({partner:entry.partner,category:entry.category,placement:'discover'})]).catch(()=>{});
}
