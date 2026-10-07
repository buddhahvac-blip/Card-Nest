import {redirect} from 'next/navigation';
import {studioOwner} from '@/lib/studio-auth';
import {database} from '@/lib/postgres';
import {seasonManifest} from '@/lib/season-manifest';
import SeasonOneUploader from './season-one-uploader';

export const dynamic='force-dynamic';

export default async function SeasonOneAdminPage(){
  const owner=await studioOwner();
  if(!owner)redirect('/auth');
  const rows=await database().query("SELECT id,art_status,release_status,is_pack_eligible FROM cards WHERE season_id='season-1'");
  const saved=new Map(rows.rows.map(row=>[row.id,row]));
  const cards=seasonManifest.map(card=>{
    const row=saved.get(card.id);
    return {
      id:card.id,
      number:card.cardNumber,
      name:card.name,
      theme:card.theme,
      rarity:card.rarity,
      artStatus:row?.art_status||card.artStatus,
      releaseStatus:row?.release_status||card.releaseStatus,
      packEligible:Boolean(row?.is_pack_eligible)
    };
  });
  return <main className="wrap" style={{paddingTop:32,paddingBottom:64}}>
    <div style={{maxWidth:900,margin:'0 auto'}}>
      <span className="eyebrow">FOUNDER TOOLS</span>
      <h1 style={{margin:'8px 0 10px'}}>Season One Card Studio</h1>
      <p style={{color:'#b9cec7',marginBottom:24}}>Upload approved Season One character cards without editing GitHub files. A successful upload makes the card available to free/gameplay pack pools, but never turns on paid pack sales.</p>
      <SeasonOneUploader cards={cards}/>
    </div>
  </main>;
}
