# CardNest V1 migration — 2026-09-27 Hawaii time

## Verified source mismatch
The old Vercel-linked GitHub repository is buddhahvac-blip/Card-Nest, main commit 77cac086734405ee382075fbfcefc0daa6e89a88. GitHub reports a successful Vercel deployment for that commit: project buddhahvac-3696/card-nest, deployment 9yq3yYm3E3kGcEXBj6njvEbQ6VTY. Its root page is the old marketplace. The new dark teal/gold Work build was separately hosted, commit 0573dbc142902e054c9d4674e6611dde41f93816. It had not been transferred to GitHub/Vercel.

## Preservation
The remote rollback/old-marketplace-2026-09-27 branch preserves the old commit. legacy-app preserves its source in this migration. Existing public Neon tables are not dropped, renamed or overwritten. A new cardnest_v1 schema separates authenticated commerce from the old development-user scaffold. Historical holdings need a reviewed identity mapping; they are preserved but not automatically reassigned to Neon Auth accounts. The Work D1 collection is likewise not silently merged into new identities.

## Existing content
Neon project muddy-waterfall-70532466, production branch br-gentle-cake-b5k6ipkc has 369 Season 1 placeholder entries with only one artwork URL. The new index presents seven illustrated preview guardians and 362 reserved slots. Placeholder content is excluded from draws. Preview rarity is common/equal weight; commercial rarity tiers, finalized roster and prices require approval. Server drop tables are versioned, integer-weighted, and use cryptographic randomness with replacement. All duplicate card copies persist. There are no cash value or limited-supply guarantees.

## Runtime migration
Native Next.js for Vercel replaces Vinext/Cloudflare. Neon Postgres replaces D1. Auth uses Neon Auth verified server sessions, never client headers. Founder access requires verified email matching a secret environment setting. Until public launch, application identities are restricted to that founder when PUBLIC_SIGNUPS_ENABLED is false. Public account creation remains closed. Artwork bytes are temporarily stored in Postgres under authenticated founder access; move growing artwork archives to approved object storage before scaling.

## Payments and Billing
Checkout uses database-controlled pack IDs, prices, amounts and a stable request key. Stripe's hosted checkout receives one-time payment orders. Raw-body webhook signatures are verified with the official SDK, sessions are fetched server-side, and order identity, user, pack, currency and amount must match. Fulfillment locks the purchase in a transaction. Each purchase has a unique entitlement; each entitlement a unique opening; each opening position a unique copy. Refund/dispute events hold unopened packs for human review; previously opened cards are not automatically confiscated. Latest charge status is checked before fulfillment. Billing portal and subscription-status synchronization are implemented; no paid recurring benefits or subscription checkout are invented.

Live keys and live webhook events are explicitly rejected. PAYMENTS_ENABLED defaults false and all seeded sale_enabled values are false. Test-mode API keys, webhook registration, approved test prices, verified account, and APP_URL are required. Production enablement must be a separate reviewed change after end-to-end Stripe tests.

## Validation and remaining work
Eight tests cover unpaid/mismatched sessions, duplicate/concurrent fulfillment, competing sessions, owner-scoped persistent openings and duplicates, free grant replay, drop boundaries, and webhook signature tampering. They run against embedded Postgres, not a live Stripe account. The isolated Neon migration and seed were applied through the Neon connector because direct database networking from this workspace is unavailable. Native Next.js production build and TypeScript succeeded.

Still required: Vercel preview environment inspection/configuration; authentication, collection and purchase tests against deployed Neon; live Stripe test checkout and webhook delivery; authenticated mobile/desktop smoke tests; production domain promotion verification; customer support address, seller identity, approved terms/privacy/refund and eligibility decisions; full commercial art/brand review; finalize subscription benefits, prices and remaining Season 1 content; least-privilege production database role, retention/rate-limit housekeeping, monitoring and backup/restore exercise.

## Rollback
Do not delete previous deployments. Before promotion record the exact previous Vercel production deployment ID. Roll back Vercel to that deployment or revert the migration commit in main. The additive cardnest_v1 schema can remain unused; rollback does not require deleting data. Never reset a database branch containing customer data to perform an application rollback.

## Handoff blockers recorded during this run
Automatic approval review rejected both the additive production-schema transaction and the production seed, citing persistent changes to the live branch. Neither was applied. The subsequent first GitHub artwork-blob upload was also rejected; its detailed reason was not exposed after a response-parsing failure. No new artwork or migration commit reached GitHub. The remote migration and rollback branches exist at the old commit. Vercel installation was confirmed but no Vercel callable tools appeared in this active tool registry. Do not describe the production domain as migrated.

The complete code is available in the accompanying migration package. The next authorized rollout should first push this source to the migration branch, configure its Vercel preview to the isolated Neon branch, run deployed account/collection/payment tests, then apply the reviewed additive production migration and promote the verified new design. Explicit approval is needed to retry the production database changes and publication of the new artwork/source to the existing public repository. Stripe still needs its connection and test configuration.

## Approved continuation
The founder explicitly approved the public GitHub upload and additive production database migration. The production schema and catalog seed have now been applied; existing public tables were preserved and all sales remain disabled. GitHub accepts the approved artwork upload. Vercel's connected account returns 403 for the owning team buddhahvac-3696 (team_2ZKTK9Ms2sMupzxDJQiF5ryG), requiring reauthorization to that scope. Production domain promotion remains unverified.
