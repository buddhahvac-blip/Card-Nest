# Physical inventory reconciliation — NestRune

**Working draft, 2026-11-05.** Reported counts are not independently physically verified and are **not** approved available-to-sell quantities. They must be counted, photographed and entered through the admin SKU intake workflow after the physical inventory migration is tested and approved. Never auto-import this document as stock or activate checkout from it.

## Pokémon
| Item | Owner-reported count | Notes |
| --- | ---: | --- |
| 30th Anniversary Elite Trainer Boxes | 0 | Owner clarified none remain on 2026-11-04; old production site still advertises two |
| 30th Knockout Collections | 5 | Owner-reported as of 2026-11-04; verify exact labeling and packaging |
| Destined Rivals Elite Trainer Box | 1 | Appears in recent storefront code; physically recount before import |
| Prismatic Evolutions / Surging Sparks ETBs | 0 shown | No current in-hand inventory verified |

## One Piece — listed by unique identifier in current site source
| SKU in current site source | Product | Reported units |
| --- | --- | ---: |
| OP-ILL-KID-KILLER | Kid/Killer Illustration Box | 1 |
| OP-ILL-RAYLEIGH-SHAKUYAKU | Rayleigh/Shakuyaku Illustration Box | 1 |
| OP-ST-34 | Charlotte Katakuri Starter Deck ST-34 | 1 |
| OP-16-EN | OP-16 booster pack, English 12-card | 2 |
| EB-04-JP | EB-04 booster pack, Japanese | 1 |
| OP-15-JP | OP-15 booster pack, Japanese | 1 |
| OP-09-JP | OP-09 booster pack, Japanese | 1 |
| OP-17-JP | OP-17 booster pack, Japanese | 3 |
| OPC-01-JP | Carddass OPC-01 booster pack, Japanese — confirm label (not automatically equivalent to OP-01) | 8 |
| OP-SLAB-BACCARAT | Baccarat Crown Gem 10 | 1 |
| OP-SLAB-CAMIE | Camie Crown Gem 10 | 1 |
| OP-SLAB-DON | DON!! Crown Gem Mint 9.5 | 1 |
| OP-SLAB-BELLMERE | Bell-mère Crown Gem Mint 9.5 | 1 |
| OP-SLAB-TEACH | Marshall D. Teach Crown Mint 9 | 1 |

**Loose booster count discrepancy:** site source sums 2+1+1+1+3+8 = **16** identified packs. Earlier owner report says **17** total. Confirm the missing pack or correction before the dashboard's initial stock count. Do not create a mystery SKU or make the extra pack sellable.

**Starter deck discrepancy:** owner reported **four total starter decks** on 2026-11-04. The site currently identifies only **one ST-34**. Confirm identity, language, packaging, count and SKU for the remaining **three** before creating listings.

**Raw single cards:** approximately 26 reported previously, with incomplete set/card/condition data. Keep off sale until individual SKU and actual photos are verified.

## Reconciliation and release requirements
- Confirm each sealed item's exact manufacturer product name, language, physical count and condition; do not rely on AI draft pictures.
- Photograph actual unit and label; record SKU, cost, proposed retail price, weight, stock count, receipt reference and low-stock threshold.
- Reconcile any quantities reserved for a Whatnot or eBay show against physically counted stock.
- Create each SKU in the private dashboard in `draft` status; include the starting physical count only after a manual count.
- Use logged inventory adjustments for sales, receipts, returns and write-offs. Record the real marketplace order ID as the unique reference.
- Physical checkout remains disabled until atomic order reservations, paid webhook settlement, expiry releases, tax and shipping calculation and end-to-end tests are approved.
