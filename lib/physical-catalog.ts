export const physicalEtbs = [
  {id:'anniversary-30',name:'Pokémon 30th Anniversary ETB',quantity:5,priceCents:20000,costCents:18500,detail:'Standard retail English-language sealed Elite Trainer Box'},
  {id:'destined-rivals',name:'Destined Rivals ETB',quantity:1,priceCents:13000,costCents:12000,detail:'Standard retail sealed Elite Trainer Box'},
  {id:'prismatic-evolutions',name:'Prismatic Evolutions ETB',quantity:1,priceCents:20000,costCents:11800,detail:'Sealed Elite Trainer Box'},
  {id:'surging-sparks',name:'Surging Sparks ETB',quantity:1,priceCents:22500,costCents:14600,detail:'Sealed Elite Trainer Box'},
] as const;
export const pausedFourAnniversaryBundleCents = 74000; // historical offer, not active
export const approvedFullCollectionBundleCents = 159900;
export const fullCollectionRegularCents = physicalEtbs.reduce((sum,item)=>sum+item.quantity*item.priceCents,0);
// Promotional pricing is not authorized yet; inquiries only until owner confirms price and stock.

export const totalInventoryCostCents = physicalEtbs.reduce((sum,item)=>sum+item.quantity*item.costCents,0);
export const individualGrossMarginCents = physicalEtbs.reduce((sum,item)=>sum+item.quantity*(item.priceCents-item.costCents),0);
