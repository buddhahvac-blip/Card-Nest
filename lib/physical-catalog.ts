export const physicalEtbs = [
  {id:'anniversary-30',name:'Pokémon 30th Anniversary ETB',quantity:5,priceCents:20000,detail:'English-language sealed Elite Trainer Box'},
  {id:'destined-rivals',name:'Destined Rivals ETB',quantity:1,priceCents:13000,detail:'Sealed Elite Trainer Box'},
  {id:'prismatic-evolutions',name:'Prismatic Evolutions ETB',quantity:1,priceCents:20000,detail:'Sealed Elite Trainer Box'},
  {id:'surging-sparks',name:'Surging Sparks ETB',quantity:1,priceCents:22500,detail:'Sealed Elite Trainer Box'},
] as const;
export const fourAnniversaryBundleCents = 74000;
export const fullCollectionRegularCents = physicalEtbs.reduce((sum,item)=>sum+item.quantity*item.priceCents,0);
// Promotional pricing is not authorized yet; inquiries only until owner confirms price and stock.
