import records from '../data/season-one.json';
import showcaseRecords from '../data/season-one-showcase.json';
export type SeasonCard = (typeof records)[number];
export const seasonManifest: SeasonCard[] = records;
export const themeColors: Record<string,string> = {Ember:'#ffa76e',Tide:'#72d5f2',Bloom:'#80d995',Volt:'#ffda75',Mystic:'#c4a0ee',Shadow:'#b0afea'};
export const clanColors=themeColors; // Legacy internal alias. User-facing UI uses theme terminology.
export const seasonCard = (id:string) => seasonManifest.find(c=>c.id===id);
export const hasSeasonArtwork = (card:SeasonCard) => Boolean(card.artworkUrl || showcaseRecords.some(art=>art.cardId===card.id && art.artworkUrl));
export const hasApprovedShowcaseArt = (card:SeasonCard) => showcaseRecords.some(art=>art.cardId===card.id && art.reviewStatus==='founder-approved');
export function artProgress(cards=seasonManifest) {
  return {total:cards.length,illustrated:cards.filter(hasSeasonArtwork).length,complete:cards.filter(c=>c.artStatus==='live'&&c.masterArtworkUrl&&c.fullCardUrl&&c.avatarUrl&&c.thumbnailUrl&&c.highResolutionArtworkUrl&&(c as {packRevealUrl:string|null}).packRevealUrl).length,released:cards.filter(c=>c.releaseStatus==='released'&&c.isPackEligible).length};
}
export function productionPrompt(card:SeasonCard) {
  const theme=(card as SeasonCard & {theme?:string}).theme||card.clan; return `Original CardNest: ${card.name}. Season One: The First Flight. Creature type: ${card.creatureType}. Visual theme: ${theme}. Battle class: ${card.battleClass}. ${card.artDirection} Story: ${card.lore} Portrait 2:3 full-body painterly fantasy, family friendly, detailed original habitat, jewel colors, quiet edges for our separate UI frame. A theme is visual treatment, not the creature species. No text, watermarks, logos, third-party characters or copied franchise designs. One individual creature illustration, never a contact sheet or recolor. Human originality and production review required.`;
}
