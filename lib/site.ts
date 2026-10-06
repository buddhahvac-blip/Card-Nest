const fallback='https://nestrune.vercel.app';

export const siteUrl=(()=>{
  const raw=process.env.NEXT_PUBLIC_SITE_URL||process.env.APP_URL||fallback;
  try{return new URL(raw)}catch{return new URL(fallback)}
})();

export const siteName='NestRune';
export const siteDescription='Discover original guardians, build your Nest, and help shape Season One: The First Flight.';

const nameClearanceApproved=(process.env.NESTRUNE_NAME_CLEARANCE_APPROVED||process.env.CARDNEST_NAME_CLEARANCE_APPROVED)==='true';
const searchApproval=(process.env.NESTRUNE_SEARCH_INDEXING_APPROVED||process.env.CARDNEST_SEARCH_INDEXING_APPROVED)==='true';
export const searchIndexingApproved=nameClearanceApproved&&searchApproval;
