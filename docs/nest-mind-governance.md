# CardNest Nest Mind governance

CardNest uses two complementary guardians.

## Nest Mind Art Overseer

The Art Overseer protects three equal pillars:

1. **Distinct Identity** — no duplicate production art and no near-copy creature designs.
2. **CardNest Continuity** — every card remains canonical to Season One and visually belongs to the same universe, theme system, rarity system, and First Flight frame language.
3. **Creative Growth** — every new creature should contribute a fresh silhouette, signature feature, pose, habitat story, elemental expression, or rarity treatment instead of becoming a recolor of an existing card.

Creativity never overrides canon. A creative idea that changes the permanent card identity, copies third-party IP, or breaks theme continuity is rejected.

Cards #001-#011 are visual composition anchors for Season One, not metadata authorities. Canonical taxonomy overrides any legacy label or icon mistake visible in an anchor image.

### Taxonomy separation

- **Theme**: Ember, Tide, Bloom, Volt, Mystic, or Shadow. This is visual/world treatment only.
- **Creature type**: what the guardian actually is.
- **Battle class**: V3 gameplay role.
- **Battle-class icon**: must match the canonical class mapping in `data/cardnest-taxonomy.json`.
- **Affinity**: prototype V3 gameplay affinity, separate from visual theme.

Public copy must say `Mystic Theme`, not imply Nestling is literally a Mystic creature. The same rule applies to every theme.

## Guardian Enforcer

Guardian Enforcer is the deterministic program gate above automated workflows. It protects canonical card data, code quality, release state, production assets, payments, authentication, and security-sensitive operations.

It automatically blocks duplicate card IDs/numbers, missing canonical slots, invalid themes/rarities/classes, theme/creature identity confusion, incorrect class-badge mappings, exact duplicated production full-card assets, silent release/pack-eligibility changes, and obvious live secrets committed to source.

Human approval is required before enabling real payments, live Stripe mode, releasing cards, making cards pack-eligible, replacing #001-#011, destructive database changes, authentication/security-policy changes, or bulk production deletion.

## Commands

- `npm run guardian:art` — run the three-pillar Art Overseer audit.
- `npm run guardian:enforce` — run Guardian Enforcer plus the Art Overseer.
- `npm run build` — automatically runs Guardian Enforcer first through `prebuild`.

The automated checks catch deterministic problems. Near-duplicate visual similarity and subjective creative quality still require visual review; they are not represented as mathematically certain when no vision-similarity model has been run.

## Permanent QC pipeline

`data/qc-incidents.json` records the specific legacy asset hashes and fixes for 001, 007, 008, and the rejected 012 metadata incident. Replacing a legacy image clears the old hash-specific finding, but a new asset remains in founder review until its visual content, typography, mobile display, originality, and rights have been checked. A metadata pass or empty OCR result never clears a visual check.

`lib/quality-control.ts` returns a 16-dimension scorecard with CRITICAL/HIGH/MEDIUM/LOW findings and one of REFERENCE ONLY, NEEDS REVISION, FOUNDER REVIEW, or PRODUCTION READY. `preflight` locks canonical card fields and projects nearby names and repeated metadata patterns; the diversity report counts all 369 cards, with inferred anatomy labels explicitly marked as text matches. Generated contact sheets remain reference only. Final card labels and statistics should be rendered from the manifest, not generated as pixels.

The founder's NestForge dashboard has a **RUN FULL CARDNEST QC AUDIT** action. It scans manifests, local card and pack paths, full-card hashes, ledger state, known defects, release flags and private avatar concept states. It optionally checks readable image text with Tesseract where the binary exists. Its negative OCR result is not a watermark or typography clearance. The server cannot inspect responsive browser layouts, visual resemblance, or legal rights; the founder must inspect the actual art and layouts before approval. Audit execution records a security event, but never deletes, overwrites, releases or buys anything.

NestForge review now binds its scorecard to the stored art SHA-256. Its approval requires explicit founder checks for visual quality, mobile layout, originality, theme and continuity. Promotion rechecks the stored bytes and the fully passing scorecard. This remains a private avatar asset, not a canonical card or pack item.

`npm run build` executes all regression tests and Guardian Enforcer before compilation. The QC command reports legacy review defects without blocking a preview-only site; duplicate identities, missing referenced files, duplicated full-card bytes, pack asset absence, premature release flags and live secrets block the build. Release authorization remains separate from the automated quality score.
