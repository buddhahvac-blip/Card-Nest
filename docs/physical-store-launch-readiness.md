# NestRune physical collectibles — release-readiness gates

**Status: NOT READY FOR PAID PHYSICAL CHECKOUT.** This checklist covers Pokémon and One Piece sealed inventory and singles only. Keep digital Guardian packs and Rune Dungeon entitlements isolated from physical store catalog, orders and stock.

## Verified 2026-11-05 inventory/reporting facts
- Pokémon 30th Anniversary ETBs: **0**; 30th Knockout Collections: **5**, per owner's November 4 report. Latest testing branch reflects Knockout Collections; current public production site is older and shows two ETBs.
- One Piece starter decks: **4 total**, per owner. Only one has a verified catalog identity in current code (Charlotte Katakuri ST-34). Do not offer or assign SKUs to the other three until the exact product variants are confirmed.
- One Piece illustration boxes: one each Kid/Killer and Rayleigh/Shakuyaku.
- Uncatalogued raw singles should remain off sale until SKU, identity, condition, photos and quantity are reviewed.
- Physical quantities shown on pages are presently code constants and are **not** transactional inventory. Don't imply auto-updates or verified availability.

## Release blocker A — Stock source of truth
- Introduce dedicated `physical_products` (unique SKU, category, language, condition, price cents, cost cents, weight, photo source, visibility) and `physical_stock` (on_hand, reserved, version) tables.
- Use a per-SKU stock movement ledger (receipt, sale, cancellation, live-sale adjustment, return, loss, manual count) recording actor, reason, order reference, idempotency key and timestamp. Make inventory adjustment operations authorized, audited and idempotent.
- Product pages must read from the same database. Do not use local hard-coded counts as buyable inventory. Prevent overselling with a transaction/atomic update that permits reservation only if `on_hand - reserved >= quantity`.
- A Whatnot/eBay live sale not automatically synchronized by provider APIs must be manually recorded immediately via an authorized inventory adjustment screen. Do not promise automatic external sync without a tested integration.

## Release blocker B — Physical checkout
- Create a separate server-only Stripe Checkout flow for approved physical SKUs; *do not* reuse `/api/checkout` without redesign (it currently handles digital Guardian packs).
- Price and inventory are always computed from server-side authoritative records, never client input. Add rate limits and idempotent session creation.
- Reserve units before starting checkout, set an expiration, release abandoned/expired reservations, confirm paid orders only from verified Stripe webhook events.
- Webhook must validate Stripe signature, deduplicate event and order settlement, transition order state atomically and decrement available inventory **exactly once**. Handle refunds and chargebacks explicitly.
- Configure tax nexus/collection strategy, Hawaii-to-mainland shipping services and costs, prohibited international destinations if applicable, packaging weight, customer support, refunds and return policies; confirm shipping/taxes before a charge.

## Release blocker C — Operator dashboard
- Admin-only, server-authorized dashboard: sales and gross margin by SKU and channel, stock on hand/reserved/available, low-stock alerts, orders by status, paid/shipping/returns queue, daily reconciliation and recent inventory movements.
- Use role checks for every API and page. Never expose supplier cost, customer email/address, Stripe tokens or administrative adjustments to public endpoints.
- Provide CSV import/export for the current inventory tracker, with validation, preview, duplicate-SKU rejection and dry-run; do not silently overwrite counts.
- Include fulfilment workflow: paid -> picking -> packed -> shipped -> delivered, with tracking and exception queue.

## Release blocker D — Operational QA
- Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` on the release commit.
- Test on a production-equivalent staging database and Stripe test mode: one sale, two simultaneous sales for last unit, failed payment, abandoned session, repeated webhooks, refund, mixed cart, order confirmation email, shipping quote, tax calculation and live-stream inventory adjustment.
- Check small-screen layout, accessibility, item photos vs illustrations, click paths and navigation; verify checkout never offers a sold-out SKU.
- Inspect Vercel production domain, deployment branch, logs and Stripe webhook endpoint. **Never deploy an unchecked preview to production** just because it builds.
- Perform a $0/no-charge verification or Stripe test-mode transaction first. No live paid order or unannounced production release before sign-off.

## Launch decision
Paid physical checkout remains disabled until blockers A–D are signed off. Public site may display inquiry-only listings that clearly say owner-reported quantities, and must not claim live inventory or automated stock updates.
