# NestRune — unified growth, product, game and revenue roadmap
**Updated: 2026-10-14 · Planning document (not a claim of deployment or affiliate approval)**

## Mission
Build an independent trading-card collector community and original fantasy-card game. Use helpful Pokémon / TCG content to attract collectors, send interested shoppers to clearly disclosed, approved partner affiliate links, measure *confirmed* commissions and net profit, and reinvest sustainable surplus in NestRune art, gameplay and operations. NestRune originals must remain distinct from third-party brands.

## Phase 1 — Trust, traffic and first affiliate earnings (first priority)
- Keep the Next.js / Vercel / Neon website stable, secure, accessible, mobile-first and fast; preserve current member collections, Stripe gates and game state.
- Give Instagram bio and original Reels a simple destination: **/deals** (proposed in this branch). It reuses the existing affiliate-discovery component; it is a partner hub, **not** a claimed real-time price comparison or a NestRune checkout.
- TCGplayer partner application is listed *in review* in the repository; confirm approval directly in Impact. Confirm the status of eBay and others directly with each network. Do not enable a link until its exact affiliate URL and promotion permissions are approved.
- Publish four useful, original Pokémon/TCG Reels per week: fair-price breakdowns, sealed collecting tips, product comparisons and honest market education. Add an appropriate paid-link disclosure wherever required. Do not fabricate urgency or results, copy other creators' content, or use engagement bots.
- Current affiliate code already gates partner URLs, labels paid links, and counts outbound clicks. Add campaign identifiers and server-side, privacy-minimal attribution only after auditing network rules.
- Track Instagram referral sessions, partner outbound clicks, confirmed attributed sales, pending/approved/paid commissions, fees, expenses, and net profit. Never treat clicks or a retailer's gross merchandise value as NestRune revenue.
- Funding milestones: first $100 of verified commissions, then sustained $500/month and $1,000/month as *targets*, not forecasts. Retain cash for costs/taxes before reinvesting.

## Phase 2 — AI-assisted operation (behind approval controls)
- Use a low-cost AI model to draft original product summaries, video scripts and educational posts from verified product data, not invented market prices.
- Use official partner feeds/APIs only where access and the affiliate terms permit. Do not assume TCGplayer product API access or scrape prohibited data.
- Add a review queue; a human approves product claims, affiliate disclosures, public posts and spend. Use Buffer or native scheduling as permitted by each platform.
- Use Vercel scheduled tasks and Neon for periodic metrics imports and reports. Financial numbers must come from affiliate network exports/APIs with clear pending vs approved vs paid statuses.
- Founder-only earnings dashboard: clicks, actual commissions, operating costs, net profit, and attribution by content/campaign. The existing Nest Mind analytics can host the reporting; Nest Mind has no authority to move funds or alter game production data.

## Phase 3 — Original collecting and browser game (parallel, paced by capacity)
- Protect and improve Season One card artwork, theme emblems, safe upload/review, pack-eligible live cards, collection presentation, missing-art placeholders and fast image loading.
- Keep Nest Battles playable on phones: compact controls, readable art, smooth attack animations, ability balancing by rarity and themed sounds / VFX.
- Rune Dungeons: three themed worlds; ten escalating floors each; rotating daily enemies; rare/epic/legendary floor-ten bosses; reward issuance must be server-authoritative, idempotent, and protected against false client victory claims.
- Preserve current energy economy goals: Hatchling 100, Nest 220, Guardian 400; Royal Nest purchase-only *subject to commercial and safety review*.
- Any payment functionality remains gated until security, consumer, balance, compliance and checkout review are complete.

## Phase 4 — Future expansion (only after proving demand)
- Expand from affiliate partners to authorized physical-product sales only after inventory, tax, returns, shipping, licensing/brand rules and customer-support planning.
- Position NestRune as a wider TCG discovery hub without suggesting Pokémon affiliation or using third-party artwork as NestRune intellectual property.
- Develop **NestRune Verdant**, a separate Unreal Engine fantasy-RPG vertical slice inspired by the *quality* of modern RPG combat (not copied creative assets). Keep UE investment separate from the stable live web game budget.

## Near-term checklist
- [x] Existing affiliate catalog, disclosures, approval gates and basic outbound click tracking in code.
- [x] Prepare a shareable **/deals** landing route that reuses the existing affiliate component (branch proposal only; no live deployment).
- [ ] Review /deals on mobile and desktop, run `npm test`, `npm run typecheck`, `npm run build`, then merge and deploy deliberately.
- [ ] Verify TCGplayer / eBay application statuses and retrieve only network-generated, approved public affiliate URLs; configure in Vercel secrets/settings.
- [ ] Add campaign-level tracking without storing unnecessary identifying data.
- [ ] Implement network-report import and founder dashboard for approved commissions, payouts, expenses and net profit.
- [ ] Create an AI content-draft/review queue; test first four Reels and measure qualified affiliate visits.
- [ ] Continue game security and mobile battle fixes independently of the marketing rollout.

## Success measures and safeguards
Weekly: content output, reach, meaningful watch time, referral sessions, outbound clicks, verified conversion rate, commissions by status, net profit, returning visitors and game retention. No false earnings claims, no unapproved affiliate links, no client-trusted reward payouts, no production schema mutation without migrations/tests/rollback, no autonomous money movement.
