import {database} from '@/lib/postgres';
import {json,failure} from '@/lib/http';
import {releaseSupply} from '@/lib/release-supply';
import {paymentReadiness} from '@/lib/stripe';
import {isPreviewCollectible,packDefinitions,previewDropVersion,previewPackDrops} from '@/lib/catalog';
import commonMasterArt from '@/data/common-master-art.json';

export const dynamic='force-dynamic';

export async function GET(){
 try{
  const p=database();
  const [cards,packs,commonSupply]=await Promise.all([
   p.query('SELECT id,number,name,family,rarity,lore,art,status,definition,art_status,release_status,is_collectible,is_pack_eligible FROM cards ORDER BY number'),
   p.query('SELECT id,name,count,drops,drop_version,price_cents,currency,sale_enabled FROM packs ORDER BY count'),
   releaseSupply()
  ]);
  const payment=paymentReadiness();
  const art=commonMasterArt as Record<string,string>;
  const publicCards=cards.rows.map(card=>isPreviewCollectible(card.id)?{
   ...card,
   art:card.art||art[card.id]||null,
   status:'preview',
   release_status:'preview',
   is_collectible:true,
   is_pack_eligible:false
  }:card);
  const publicPacks=packs.rows.map(pack=>{
   const currentPreview=!pack.sale_enabled&&pack.drop_version.startsWith('preview-')&&packDefinitions.some(def=>def.id===pack.id);
   return currentPreview?{...pack,drop_version:previewDropVersion,drops:previewPackDrops(pack.id)}:pack;
  });
  return json({cards:publicCards,packs:publicPacks,commonSupply,paymentsEnabled:payment.checkoutReady,paymentMode:payment.mode,plannedTotal:369});
 }catch(e){return failure(e)}
}
