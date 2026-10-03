# First Flight showcase — release verification

2026-10-03. Baseline production commit `f9c1f6ccd7121d9c3ec5ea01a496faaf4245f81a`, deployment `dpl_5yore7rZ9BujpkJxRA9j5TBErX4x`, retained for rollback.

## Completed checks before preview

- All 34 automated tests pass, including four showcase/analytics tests and existing purchase-integrity tests.
- TypeScript and optimized Next.js build pass; Guardian Enforcer has no failures.
- ESLint errors corrected; legacy image/navigation warnings remain.
- Twelve WebP source/avatar files decode; source hashes match the six review records.
- Canonical `data/season-one.json` unchanged: 369 stable records; all six showcase cards unreleased/not collectible/not pack-eligible.
- Analytics migration applied to isolated Neon branch `br-polished-lab-b50e1r49`; five new columns and expanded event constraint verified; 369 cards and zero pack-eligible records preserved.
- Local browser access is blocked by the cloud browser network boundary. Remote preview verification is the next release gate.

## Release boundaries

Real Stripe/live commerce, paid random packs, subscriptions, new affiliate activations, autonomous releases/pricing/spending and search-indexing approval are unchanged. Four existing HIGH legacy artwork incidents remain release blockers. Showcase source art awaits founder rights/originality review.

## Verification still to record

Remote preview interaction tests, public production commit/domain verification, production analytics migration, mobile/device performance and screen-reader coverage. Do not interpret this preview snapshot as completed production validation.
