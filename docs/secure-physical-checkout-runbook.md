# NestRune physical-goods checkout: safe launch runbook

Physical Pokémon checkout is **separate from the digital-game pack system**. Existing digital `/api/checkout` and `/api/webhooks/stripe` are untouched.

## Scope implemented
- Server-priced Stripe Checkout for four sealed ETB types (max 4 units/order).
- Database atomic hold: checkout reserves on-hand units, cannot oversell.
- Checkout sessions expire after 30 minutes; reservation timeout > session lifetime.
- Separate signed webhook at `/api/webhooks/collector-stripe` for completed/expired payments; events deduplicated in one database transaction.
- Stripe refunds and disputes flag orders for review, never automatically restock.
- Founder view/edit at `/admin/collector-inventory` and reconciliation button for delayed/expired sessions.
- Existing `/admin/shop` counts webhook-confirmed paid orders separately from inquiries.
- Products default to **zero stock, no price, unavailable**. Founder can approve ONLY actually counted boxes with a real local photo under `public/collector/real/`.
- Existing purchase inquiry form remains usable regardless of payment status.

## Required setup (no live charges until all complete)
1. Apply `drizzle/0008_collector_physical_checkout.sql` to the **exact Neon project configured for production**. Keep Vercel migrations in sync; do not replay historical baseline migrations.
2. Upload original real item photos to `public/collector/real/`; founder verifies sealed quantities, photograph, and desired actual sales prices. Do not copy guessed quantities/prices from AI poster.
3. In Stripe **test mode**, create an active USD fixed-amount shipping rate after validating Hawaiʻi-origin USPS rates, packaging/insurance and US destinations. Set server env `COLLECTOR_US_SHIPPING_RATE_ID` to the corresponding `shr_...` for test, NOT a live rate.
4. Add a separate Stripe **test** webhook destination `https://<preview-host>/api/webhooks/collector-stripe`, subscribed to `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded`, `charge.refunded` and `charge.dispute.created`. Store its signing secret server-side under `COLLECTOR_STRIPE_WEBHOOK_SECRET` for preview.
5. Set `COLLECTOR_TEST_CHECKOUT_ENABLED=true` in preview **only**, with Stripe test keys and `CARDNEST_PAYMENT_MODE=test`. Run successful, rejected, expired, duplicate-webhook, refund/dispute, and stock concurrency tests using test cards. Confirm buyer receipt and founder order dashboard.
6. Review and publish actual physical-item dispatch timelines, shipping/loss claims, returns/cancellations, seller business identity and Hawaiʻi GET/other tax treatment. Activate automatic tax in Stripe only when configured for applicable registrations.
7. Configure **live** shipping rate and live webhook signing secret, with the Vercel production live key only. Explicitly approve the following *after* successful testing: `COLLECTOR_LIVE_CHECKOUT_ENABLED`, `COLLECTOR_FOUNDER_APPROVAL`, `COLLECTOR_POLICIES_APPROVED`, `COLLECTOR_SHIPPING_APPROVED`, `COLLECTOR_TAX_APPROVED`, `COLLECTOR_INVENTORY_APPROVED`, and the existing `CARDNEST_COMMERCIAL_POLICY_APPROVAL`. Each must equal literal `true`.
8. Keep `PAYMENTS_ENABLED=false` for digital packs unless those separate products have independently passed their own gates.
9. Check page / sitemap, purchase confirmation, webhook logs and refund handling in production with a low-value real sale only after documented approval.

## Fail-closed guarantees
- Stripe key must match `CARDNEST_PAYMENT_MODE` (`test` or `live`).
- A dedicated webhook secret (`whsec_...`), active server-validated USD fixed shipping rate (`shr_...`) and HTTPS return URL are mandatory.
- No customer-supplied prices, stock quantities, shipping charges, or fulfillment signals are trusted.
- Final payment status is driven only by a cryptographically verified Stripe webhook or a founder-triggered Stripe API reconciliation.
- **No live processing activated by this change.** Do not set commercial approval flags merely to reveal the purchase button.
