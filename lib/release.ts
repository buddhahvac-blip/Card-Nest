/** A payment entitlement must never consume a preview or concept pool. */
export function packCardAvailable(card:{status:string;release_status:string;is_collectible:boolean;is_pack_eligible:boolean;art:string|null;art_status:string},paid:boolean){
  if(!card.art||!card.is_collectible)return false;
  if(paid)return card.release_status==='released'&&card.is_pack_eligible&&card.art_status==='live';
  return card.release_status==='preview'||card.release_status==='released';
}
