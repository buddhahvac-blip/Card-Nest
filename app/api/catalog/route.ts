import {database} from '@/lib/postgres';
import {json,failure} from '@/lib/http';
export const dynamic='force-dynamic';
export async function GET(){try{const p=database();const [cards,packs]=await Promise.all([p.query('SELECT id,number,name,family,rarity,lore,art,status,definition,art_status,release_status,is_collectible,is_pack_eligible FROM cards ORDER BY number'),p.query('SELECT id,name,count,drops,drop_version,price_cents,currency,sale_enabled FROM packs ORDER BY count')]);return json({cards:cards.rows,packs:packs.rows,paymentsEnabled:process.env.PAYMENTS_ENABLED==='true'&&!!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_'),paymentMode:'test',plannedTotal:369})}catch(e){return failure(e)}}
