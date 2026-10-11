/**
 * Approved, transparent-background battle creature assets.
 *
 * Each entry MUST point to a human-reviewed transparent WebP/PNG under /public.
 * Absence means the original portrait is displayed without alteration.
 * No automatic background removal or guessed filenames: preserve approved art.
 */
export const battleCreatureCutouts: Readonly<Record<string,string>> = Object.freeze({});

export function battleCreatureCutoutFor(cardId:string):string | null {
 return Object.prototype.hasOwnProperty.call(battleCreatureCutouts,cardId)
  ? battleCreatureCutouts[cardId] ?? null : null;
}
