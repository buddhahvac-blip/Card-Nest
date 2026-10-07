const fallback='https://nestrune.app';

export const siteUrl=(()=>{
  const raw=process.env.NEXT_PUBLIC_SITE_URL||process.env.APP_URL||fallback;
  try{return new URL(raw)}catch{return new URL(fallback)}
})();

export const siteName='NestRune';
export const siteDescription='NestRune is an original fantasy digital card game beta you can play in your browser. Collect Guardians, open free beta packs, build your Nest, battle, and explore the Rune Dungeon.';

const nameClearanceApproved=(process.env.NESTRUNE_NAME_CLEARANCE_APPROVED||process.env.CARDNEST_NAME_CLEARANCE_APPROVED)==='true';
const searchApproval=(process.env.NESTRUNE_SEARCH_INDEXING_APPROVED||process.env.CARDNEST_SEARCH_INDEXING_APPROVED)==='true';
export const searchIndexingApproved=nameClearanceApproved&&searchApproval;
