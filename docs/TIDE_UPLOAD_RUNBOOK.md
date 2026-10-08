# Tide assets integration — operator checklist

Source package: `nestrune_tide_website_staging.zip` from the ChatGPT conversation. The package is **not** stored in GitHub; the operator must attach/unzip it into a checked-out repository. Do not commit the UNASSIGNED folder or replace #004 live art until approved.

1. Unzip candidate assets into the repository. Keep original art backed up. For initial integration, use #070, #072; hold #071 and #073 because their painted frames say Rare while canon says Common. Do not use the #074 number for Manta.
2. Run `node scripts/stage-tide-assets.mjs` after all four numbered entries have been staged. Expect it to fail until the full quartet is present.
3. Inspect the 4 art images against their canonical names, IDs, rarity text and Theme icons; replace incorrect baked-in text before launch.
4. Modify catalog URLs only after files exist at stable public paths. Resolve the app's actual release activation pathway and keep payments disabled.
5. Create or update **only the intended DB preview records** using the application's existing reviewed admin upload/release flow. Do not forcibly set pack eligibility in a migration. Check that all existing player cards and progress remain unchanged.
6. Test obtaining each card through the supported beta mechanism, ownership in My Nest, selections/abilities in Nest Battles, encounters in all three Rune Dungeons, win/lose energy and reward accounting, and logout/relogin persistence.
7. Run `npm test`, `npm run typecheck`, `npm run audit:season-art`, and `npm run build` on a preview deployment. Roll back if any fail. Merge to main and deploy only once all pass.

An art file by itself is NOT sufficient to make a card playable. Canonical number/name, runtime definition, preview eligibility, avatar resolution and database sync must all be verified.
