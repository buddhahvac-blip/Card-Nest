const fallback='https://card-nest-iota.vercel.app';

export const siteUrl=(()=>{
  const raw=process.env.NEXT_PUBLIC_SITE_URL||process.env.APP_URL||fallback;
  try{return new URL(raw)}catch{return new URL(fallback)}
})();

export const siteName='CardNest';
export const siteDescription='Discover original guardians, build your Nest, and help shape Season One: The First Flight.';
