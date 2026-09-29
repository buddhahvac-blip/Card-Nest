import {database} from '@/lib/postgres';
import {catalogCode,copySerial,parseCopySerial} from '@/lib/authenticity';
import {failure,json} from '@/lib/http';

export const dynamic='force-dynamic';

export async function GET(req:Request){
  try{
    const serial=new URL(req.url).searchParams.get('serial')?.trim();
    if(!serial)return json({error:'Enter a CardNest copy serial.'},400);
    const parsed=parseCopySerial(serial);
    if(!parsed)return json({verified:false,reason:'invalid-format'},200);
    const p=database();
    const {rows:[record]}=await p.query(
      `SELECT cp.id,cp.created,cd.id AS card_id,cd.number,cd.name,cd.family,cd.rarity,cd.release_status
       FROM copies cp
       JOIN cards cd ON cd.id=cp.card
       WHERE cp.id=$1 AND cd.number=$2
       LIMIT 1`,
      [parsed.copyId,parsed.cardNumber]
    );
    if(!record)return json({verified:false,catalogCode:catalogCode(parsed.cardNumber),reason:'not-found'},200);
    return json({
      verified:true,
      catalogCode:catalogCode(record.number),
      copySerial:copySerial(record.id,record.number),
      card:{id:record.card_id,number:record.number,name:record.name,clan:record.family,rarity:record.rarity},
      issuedAt:record.created,
      releaseStatus:record.release_status,
      commerciallyReleased:record.release_status==='released'
    });
  }catch(e){return failure(e)}
}
