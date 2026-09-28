# Season One production record

369 permanent definitions are in `data/season-one.json`. Regenerate deterministically using `python scripts/build-season-manifest.py`; run `npm test` before publishing. This is a creative and battle prototype, not a completed art set or balanced game.

## Identity and numbering

The seven prior canonical IDs and numbers are preserved. Previously seeded `reserved-NNN` database IDs are also retained, even after naming, so ownership references never break. Slugs are separate display identifiers.

| Clan | Preserved early numbers | Additional numbers | Total |
| --- | --- | --- | --- |
| Ember | 002 | 008–068 | 62 |
| Tide | 003 | 069–129 | 62 |
| Bloom | 001, 004 | 130–189 | 62 |
| Volt | 005 | 190–249 | 61 |
| Mystic | 006 | 250–309 | 61 |
| Shadow | 007 | 310–369 | 61 |

Global rarity allocation: 150 common, 90 uncommon, 60 rare, 30 epic, 19 ultra, 20 legendary. These are roster counts, not purchase odds. Existing free-preview odds remain unchanged.

## Artwork truth

Eight individual illustrations exist: seven prior previews plus Ember Sovereign #068, generated from the supplied clan direction on 2026-09-28 using the built-in image tool. It is a newly generated standalone image, not a crop of the sheet. Original source remains in the conversation's generated assets; optimized portrait, reveal, thumbnail, high-resolution and avatar files are checked in. Its master URL and full-card composition are not yet published. All eight require final production/commercial review. **Zero cards are marked production-complete or paid-pack eligible. 361 still lack individual illustrations.**

No automatic test establishes intellectual-property clearance. Individual resemblance review, rights/provenance records and brand clearance remain launch requirements. Review avatars for useful framing as part of asset approval.

## Release controls

The database stores `definition`, `art_status`, `release_status`, `is_collectible`, and `is_pack_eligible`. Default new entries are unreleased and ineligible. Seed replay preserves live release decisions. Paid checkout and paid opening independently require every configured pool member to have artwork, `art_status=live`, `release_status=released`, and both eligibility flags. Free previews use only the seven existing collectible previews. No user/browser input selects results.

Asset workflow: reserved → character concept → generation → review → approved → composition → avatar → optimization → upload → live. The current studio handles brief/generation/review and preview publication; composition, derivative verification and final release remain operator steps. There is no unrestricted automatic release action.

Founder dashboard queries database progress. Preparing the 369 individual prompts is free and idempotent. The image API requires an explicitly configured model, key and positive daily request limit (hard capped at 20); default capacity is zero. Generation remains one deliberate request, no automatic retry. A dollar-budget ledger/provider spending cap is still needed before unattended paid generation. Failed requests can still be billable.

## Battle design

`first-flight-draft-1` is unplaytested. Each role has 190 total HP/attack/defense/speed points and summon cost 3 across rarities. Higher rarities add conditional abilities rather than base stats. Weakness/resistance form a clan cycle. Evolution identifiers initially describe standalone families; multi-stage relationships require a separate balancing/content pass. The existing battle demo does not yet execute these profiles. Do not market these as a finished competitive game.

## Validation and deployment

Automated tests check exact counts, unique numbers/names/IDs/slugs, metadata, actual asset files, release gates, additive migration and repeated seeds. Existing payment integrity tests run alongside them. `scripts/export-season-sql.ts` exports the same seed semantics for the approved Neon connector when direct SQL networking is unavailable.

Remaining launch blockers: owning-team Vercel access, production env/auth wiring and end-to-end persisted account checks, real Stripe test checkout/webhook delivery, final business contact and commerce policies, artwork review, mobile-browser verification, and production promotion. Build success alone is not launch readiness.
