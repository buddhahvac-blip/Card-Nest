# NestRune Collector Shop — Commercial Go-Live Gates

Prepared October 23, 2026. This document is a launch checklist, not an approval to take payment.

## Changes in this branch
- Add Pokémon shop canonical metadata and sitemap listing.
- Add a first-party, anonymous session counter and contact-intent tracking.
- Add private founder reporting at `/admin/shop` (API uses `studioOwner()`).
- Let interested customers submit an in-site purchase request through the existing support-ticket API, with a reference number and ZIP-only shipping quote request.
- Keep physical-product checkout OFF; payment confirmation is not simulated or counted as a sale.

## Required before charging for physical inventory
1. Reconcile **real, on-hand sealed products** against the static catalog. Replace hardcoded stock/price with a single authoritative inventory source, with atomic inventory reservation before checkout.
2. Agree to shipping destinations, packing materials, weight tiers, buyer-visible fees and insurance; test Hawaii-to-mainland postage and pickup rules.
3. Approve customer-facing physical-goods policies: seller identity, dispatch windows, loss/damage procedure, refunds/cancellations/returns, support contact, tax treatment and age requirements.
4. Build a **separate** physical-item Stripe Checkout and webhook workflow. The existing `/api/checkout` and `/api/webhooks/stripe` fulfill *digital game packs*; they cannot safely sell or fulfill Pokémon ETBs.
5. In test mode, verify successful and cancelled payment, duplicate-webhook idempotency, declined cards, refund/dispute, inventory hold expiry, shipping amount, and confirmation receipts.
6. Only then activate physical commerce with an independent launch flag. Do **not** flip the current game-wide `PAYMENTS_ENABLED` flag or override `CARDNEST_COMMERCIAL_POLICY_APPROVAL` as a shortcut.
7. Add Stripe-confirmed paid orders and net revenue to `/admin/shop`; current `completedPurchases` and `revenueCents` intentionally return `null` until this is implemented.

## Analytics details
- Page and purchase-request clicks are first-party browser session counts. They are not unique users, all traffic, conversions or paid orders.
- Events are suppressed for browser Do Not Track and webdriver; client events can be blocked by browser privacy tools.
- No IP address, names, raw session UUIDs, emails or user-agent strings are placed into collector tracking events.
- The purchase request collects a contact name/email and shipping ZIP in the existing **support ticket** workflow for direct follow-up.
- The Vercel Web Analytics feature remains disabled at the platform level; this branch adds independent first-party metrics instead.

## SEO still requires external verification
- Search indexing flags are already approved (`NESTRUNE_NAME_CLEARANCE_APPROVED=true`, `NESTRUNE_SEARCH_INDEXING_APPROVED=true`) in current Vercel production settings.
- Verify the deployed site's `/robots.txt` and `/sitemap.xml`, register `https://nestrune.app` in Google Search Console, and submit the sitemap.
- Add genuine inventory photographs and product detail pages before including item-level `Product`/`Offer` structured data.
