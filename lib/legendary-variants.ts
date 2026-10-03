// Presentation proposals only. These records never participate in ownership or drops.
export const legendaryVariants = [
 {id:'base',name:'Base Legendary',finish:'base',description:'Original illustration in the Legendary gold frame.'},
 {id:'first-flight',name:'First Flight Foil',finish:'gold',description:'A warm gold edge inspired by the first dawn.'},
 {id:'aurora',name:'Aurora Foil',finish:'aurora',description:'Quiet teal and violet light around the frame.'},
 {id:'constellation',name:'Constellation Foil',finish:'stars',description:'Starlit edges tracing journeys across the sky.'},
 {id:'founder',name:'Founder Edition',finish:'founder',description:'An ivory-gold frame study. No edition size or entitlement is established.'},
].map(variant=>({...variant,status:'display-concept' as const,releaseStatus:'unreleased' as const,isCollectible:false as const,isPackEligible:false as const,purchasable:false as const}));
