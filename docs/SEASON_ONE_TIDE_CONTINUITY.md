# Season One continuity: Tide expansion staging (2026-10-08)

This change is non-destructive. It does **not** upload new pictures, change Neon records, flip pack eligibility, change real-money settings or alter battle logic.

## Canonical Tide assignments

| Number | Name | Canon rarity | Action |
|---|---|---|---|
| 004 | Rippleo | common | Preserve published original until new art is visually reviewed |
| 070 | Dew Axolotl | common | Candidate art; review |
| 071 | Pearl Seahorse | common | Candidate image currently says Rare; replace with Common frame or approve gameplay/release rarity change |
| 072 | Shell Crab | common | Candidate art; review |
| 073 | Brook Otter | common | Candidate image currently says Rare; replace with Common frame or approve gameplay/release rarity change |
| 074 | Bubble Pufferfish | common | Reserved and protected; do not assign Manta here |
| TBD | Abyssal Manta Guardian | TBD | Select a canonical slot with matching species/theme/rarity or formally review a future-season addition |

## Production approval gates

- Compare against actual approved **live** cards and their original full-resolution masters.
- Export original source illustration, full-card image, square battle avatar, thumbnail and pack reveal without image upscaling; inspect both desktop and mobile.
- Validate frame text, theme wave icon, printed name/number/rarity, stats and abilities against canonical data.
- Keep all original 369 IDs and names. A thematic alternative image is not permission to rewrite a canonical identity.
- Review common/uncommon and rare+ ability mappings against the **runtime** battle engine. Schema currently only includes primary, secondary, passive; never assume missing properties prove an actual runtime bug.
- Stage packs and battles first; preserve reward/energy accounting and purchase restrictions.
- Publish only after end-to-end verification and explicit approval.

Run `node scripts/verify-season-one-continuity.mjs`. Review warnings deliberately; only structural blockers fail execution.
