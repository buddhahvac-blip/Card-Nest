import records from '../data/season-one.json';
export type SeasonCard = (typeof records)[number];
export const seasonManifest: SeasonCard[] = records;
export const clanColors: Record<string,string> = {Ember:'#ffa76e',Tide:'#72d5f2',Bloom:'#80d995',Volt:'#ffda75',Mystic:'#c4a0ee',Shadow:'#b0afea'};
export const seasonCard = (id:string) => seasonManifest.find(c=>c.id===id);
export function artProgress(cards=seasonManifest) {
  return {total:cards.length,illustrated:cards.filter(c=>c.artworkUrl).length,complete:cards.filter(c=>c.artStatus==='live'&&c.masterArtworkUrl&&c.fullCardUrl&&c.avatarUrl&&c.thumbnailUrl&&c.highResolutionArtworkUrl&&c.packRevealUrl).length,released:cards.filter(c=>c.releaseStatus==='released'&&c.isPackEligible).length};
}
export function productionPrompt(card:SeasonCard) {
  return `Original CardNest: ${card.name}. Season One: The First Flight. ${card.artDirection} Story: ${card.lore} Portrait 2:3 full-body painterly fantasy, family friendly, detailed original habitat, jewel colors, quiet edges for our separate UI frame. No text, watermarks, logos, third-party characters or copied franchise designs. One individual creature illustration, never a contact sheet or recolor. Human originality and production review required.`;
}
