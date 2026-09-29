# CardNest Nest Mind governance

CardNest uses two complementary guardians.

## Nest Mind Art Overseer

The Art Overseer protects three equal pillars:

1. **Distinct Identity** — no duplicate production art and no near-copy creature designs.
2. **CardNest Continuity** — every card remains canonical to Season One and visually belongs to the same universe, clan, rarity system, and First Flight frame language.
3. **Creative Growth** — every new creature should contribute a fresh silhouette, signature feature, pose, habitat story, elemental expression, or rarity treatment instead of becoming a recolor of an existing card.

Creativity never overrides canon. A creative idea that changes the permanent card identity, copies third-party IP, or breaks clan continuity is rejected.

Cards #001-#011 are the visual style anchors for Season One.

## Guardian Enforcer

Guardian Enforcer is the deterministic program gate above automated workflows. It protects canonical card data, code quality, release state, production assets, payments, authentication, and security-sensitive operations.

It automatically blocks duplicate card IDs/numbers, missing canonical slots, invalid clans/rarities/classes, exact duplicated production full-card assets, silent release/pack-eligibility changes, and obvious live secrets committed to source.

Human approval is required before enabling real payments, live Stripe mode, releasing cards, making cards pack-eligible, replacing #001-#011, destructive database changes, authentication/security-policy changes, or bulk production deletion.

## Commands

- `npm run guardian:art` — run the three-pillar Art Overseer audit.
- `npm run guardian:enforce` — run Guardian Enforcer plus the Art Overseer.
- `npm run build` — automatically runs Guardian Enforcer first through `prebuild`.

The automated checks catch deterministic problems. Near-duplicate visual similarity and subjective creative quality still require visual review; they are not represented as mathematically certain when no vision-similarity model has been run.
