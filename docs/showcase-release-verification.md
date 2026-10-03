# First Flight showcase — release verification

Verified 2026-10-03. Production application source: `905f2c27c55561ab686bc77b76f4669e41fe3088`. Deployment `dpl_4euvFRrqXiZhUBwSVHquTgLnbkZN` reached READY from main and owns https://card-nest-iota.vercel.app. This documentation update does not change application behavior.

Rollback baseline retained: commit `f9c1f6ccd7121d9c3ec5ea01a496faaf4245f81a`, deployment `dpl_5yore7rZ9BujpkJxRA9j5TBErX4x`.

## Completed

- Six new original concept illustrations, with source and avatar WebP files, for canonical IDs CN1-108, CN1-168, CN1-229, CN1-299, CN1-359 and CN1-307. Aurora Herald remains a Mystic Legendary Warden aurora stag.
- Premium teal/gold card presentation, supplemental review metadata, showcase, optional Aurora story dialog, albums, device-local Favorites/Wishlist and theme identity, My Nest entry points, beta trail and founder analytics additions.
- No canonical roster edits. All new art remains review-only, unreleased, not collectible and not pack-eligible.
- Additive analytics migration tested on isolated Neon branch `br-polished-lab-b50e1r49`, then applied to production branch `br-gentle-cake-b5k6ipkc`. Five new columns, expanded event constraint and migration ledger entry verified. No artificial production analytics inserted.
- Founder research, competitive matrix, growth plan and unplaytested battle proposal in [market validation](showcase-market-validation-2026-10-03.md); artwork directions and canonical metadata in [art briefs](showcase-art-briefs.md).

## Automated and asset verification

- All 34 automated tests pass, including four new showcase/analytics tests and existing payment-integrity tests. Existing payment tests do not establish a live Stripe end-to-end purchase.
- TypeScript and optimized Next.js build pass; 413 static pages generated; Guardian Enforcer has zero failures.
- ESLint has zero errors and eight legacy warnings.
- All twelve WebP files decode; source SHA256 hashes match supplemental records and GitHub binary blobs match the uploaded asset hashes.
- Production catalog has 369 cards. Deep comparison of health, attack, defense, speed, battle class, rarity and all three ability fields found zero differences from the canonical source. Older database descriptive metadata is not rewritten by this art release.

## Preview browser verification

Preview `91dfa329a01f51f68dc22a9991cddb7fcea50497` / `dpl_8mYJ1LtkYWF7PjUxiK2aS9nP5HdC` passed six-card taxonomy/stat/source checks, Aurora story advance, Escape close, pause/static control, Favorite/Wishlist reload persistence, Bloom identity and album membership. Saved interest remained distinct from actual ownership: zero owned of twelve.

Final application preview `905f2c27c55561ab686bc77b76f4669e41fe3088` / `dpl_EP2DsTmKUMSNVTcM3iXhJsgsf6qs` reached READY. Follow-up browser verification confirmed Aurora dialog, the “A world worth collecting” hero, responsive image source sets, no desktop horizontal overflow and the Mixed Themes album label. No CardNest rendering error was observed; extension-origin console noise was separate.

Preview has no database environment configured; its health endpoint reported unavailable. Production database connectivity was independently verified below.

One intermediate preview `ba71615ecfbe1a3d4ef3a877ab4bb8851fd25d61` failed remote build. The build-log connector was unavailable. A clean checkout of that exact source passed tests, guards, TypeScript and optimized build; the Vercel-only failure's cause remains unconfirmed. A subsequent explicit preview succeeded before main was updated. Automatic approval review rejected an unspecified deployment attempt while that preview was failed; no deployment was performed by that attempt. The successful release used an explicitly targeted, verified GitHub preview/main flow.

## Production checks

- Vercel reports READY, GitHub main source SHA above, correct production alias and no alias error.
- HTTP 200 and expected content on /, /showcase, /albums, /beta, /cards/cn1-307-aurora-herald, /cards/cn1-299-constellation-keeper-serpent, /cards/cn1-108-deepstream-oarfish, /season-one, /privacy, /feedback and /support.
- /api/health: HTTP 200, database connected, 369 catalog cards, payments test-only-gated.
- /api/catalog: paymentsEnabled false, paymentMode test; four pack definitions with card counts 1/3/5/7 all have sale_enabled false; zero released and zero pack-eligible cards.
- /api/analytics: anonymous founder-dashboard access rejected with HTTP 403.
- /robots.txt: HTTP 200, Disallow / and noindex response header. Search clearance remains gated.
- Vercel error/fatal runtime-log query for the release's first fifteen minutes returned no logs. This is a bounded observation, not proof that errors cannot occur.

## Still needed / limitations

Work's execution environment disconnected before a final production browser revisit. Production HTTP/connector checks passed; preview interactions were tested. Actual phone/touch use, narrow viewport browser QA, OS reduced-motion preference emulation, screen-reader navigation, field LCP/CLS, authenticated founder dashboard and a full production account/collection journey remain unverified in this release.

Aurora is an optional lightweight CSS/story prototype with a static fallback, not a layered 3D creature simulation. Albums do not grant rewards. Device-local saved interests are not account ownership. Anonymous session/receipt-order signals are not verified unique people or longitudinal conversion cohorts. The 50–100 collector target is a goal; no traction is fabricated.

Four pre-existing HIGH artwork incidents remain: #001 Mystic badge; #007 Shadow palette; #007 Support badge; #008 Warden badge. This release does not claim to resolve them. All six new concepts await founder approval, rights/originality review and the existing name/search clearance gate.

Real Stripe purchases, paid random packs, subscriptions, affiliate activation, autonomous spending/pricing/releases and multiplayer remain disabled/unlaunched. Battle rules remain an unplaytested proposal. Existing payment integrity tests do not substitute for test-mode Stripe checkout and signed webhook end-to-end verification. This showcase release is not a claim of commerce launch readiness.

## Founder actions

Review and approve or revise the six concepts and retained artwork incidents; complete name/IP clearance before indexing or commercial release. Arrange device/accessibility checks and real beta feedback. Any later commercial launch requires its separate payment, fulfillment, customer policy and release-gate verification. No live-payment authorization was exercised here.
