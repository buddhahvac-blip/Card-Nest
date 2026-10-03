# First Flight showcase — release verification

2026-10-03. Baseline production commit `f9c1f6ccd7121d9c3ec5ea01a496faaf4245f81a`, deployment `dpl_5yore7rZ9BujpkJxRA9j5TBErX4x`, retained for rollback.

## Completed checks before preview

- All 34 automated tests pass, including four showcase/analytics tests and existing purchase-integrity tests.
- TypeScript and optimized Next.js build pass; Guardian Enforcer has no failures.
- ESLint errors corrected; legacy image/navigation warnings remain.
- Twelve WebP source/avatar files decode; source hashes match the six review records.
- Canonical `data/season-one.json` unchanged: 369 stable records; all six showcase cards unreleased/not collectible/not pack-eligible.
- Analytics migration applied to isolated Neon branch `br-polished-lab-b50e1r49`; five new columns and expanded event constraint verified; 369 cards and zero pack-eligible records preserved.
- Preview `91dfa329a01f51f68dc22a9991cddb7fcea50497` / `dpl_8mYJ1LtkYWF7PjUxiK2aS9nP5HdC` passed browser checks: six-card taxonomy/stats, loaded source, dialog story advance, Escape close, pause/static control, Favorite/Wishlist reload persistence, Bloom identity and album membership. Saved interest remained 0 owned / 12.
- Desktop DOM overflow check passed. The browser cannot provide a permitted narrow viewport test in this session. Mobile CSS was reviewed; actual phone/touch, reduced-motion preference emulation, screen reader and field LCP/CLS remain unverified.
- Preview has no database environment configured; `/api/health` correctly reports unavailable. This does not describe production. Database migration was tested independently on the isolated Neon branch.
- Later preview `ba71615ecfbe1a3d4ef3a877ab4bb8851fd25d61` failed Vercel's build. Build-log connector returned tool-not-found. A clean checkout of exactly that commit passed all 34 tests, guards, TypeScript and optimized build. Cause of the remote-only failure is not established; a fresh explicitly targeted preview is required before main.
- Browser console noise came from the browser extension, not CardNest. No CardNest rendering error was observed during the tested interactions.

## Release boundaries

Real Stripe/live commerce, paid random packs, subscriptions, new affiliate activations, autonomous releases/pricing/spending and search-indexing approval are unchanged. Four existing HIGH legacy artwork incidents remain release blockers. Showcase source art awaits founder rights/originality review.

## Verification still to record

Remote preview interaction tests, public production commit/domain verification, production analytics migration, mobile/device performance and screen-reader coverage. Do not interpret this preview snapshot as completed production validation.
