import {seasonManifest,type SeasonCard} from './season-manifest';

export const seasonOneThemes=['Ember','Tide','Bloom','Volt','Mystic','Shadow'] as const;
export type SeasonOneTheme=(typeof seasonOneThemes)[number];

export const seasonOnePageSize=12;

export const seasonOneThemeCopy:Record<SeasonOneTheme,string>={
 Ember:'Heat, courage, volcanic ridges and Guardians built to endure.',
 Tide:'Flow, patience and creatures shaped by rivers, reefs and open water.',
 Bloom:'Growth, healing and living sanctuaries filled with wild magic.',
 Volt:'Speed, sparks and high-energy Guardians from storm-lit lands.',
 Mystic:'Stars, runes and celestial Guardians tied to ancient mysteries.',
 Shadow:'Moonlit ruins, stealth and Guardians that thrive beyond the light.'
};

export function seasonOneCardsForTheme(theme:SeasonOneTheme):SeasonCard[]{
 return seasonManifest.filter(card=>card.theme===theme).sort((a,b)=>a.cardNumber-b.cardNumber);
}

export function seasonOneThemeCount(theme:SeasonOneTheme){
 return seasonOneCardsForTheme(theme).length;
}

export function isSeasonOneTheme(value:string):value is SeasonOneTheme{
 return (seasonOneThemes as readonly string[]).includes(value);
}
