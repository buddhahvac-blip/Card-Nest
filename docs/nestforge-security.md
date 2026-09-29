# NestForge and security review — 2026-09-29

## What changed

NestForge is an internal founder-only idea and avatar review queue. The visitor interest panel provides contextual suggestions. It holds only intentionally selected interests in browser session storage when the visitor switches session personalization on. The founder can enable this with `NESTFORGE_PERSONALIZATION_ENABLED=true`; the default is off. Anonymous aggregate click counts require a separate voluntary checkbox. The server stores only an interest name and a count, never a visitor identifier in that table. Neither interest clicks nor generated concepts alter the Season One catalog or pack eligibility.

Concept records contain a structured profile, theme, creature type, battle-class candidate, silhouette, habitat, palette, movement idea, optional private image key, review state and Overseer result. The state path is `idea → generated → overseer-review → founder-review → approved → production-ready`; rejected or revision-needed concepts stay private. The Overseer performs deterministic metadata and duplicate-signature checks. It cannot establish visual originality or legal rights; the founder must review the generated image and reference provenance before approval. Production-ready means the private asset passed the internal queue, not that a canonical card was released. No public image route serves these assets.

## Paid generation controls

Default spend is $0. `generate-art` remains off unless the founder explicitly sets `NESTFORGE_PAID_GENERATION_APPROVED=true`, a provider credential and model, `NESTFORGE_IMAGE_DAILY_LIMIT`, `NESTFORGE_IMAGE_GLOBAL_DAILY_LIMIT`, `NESTFORGE_IMAGE_DAILY_BUDGET_CENTS`, and a conservative `NESTFORGE_IMAGE_UNIT_COST_CENTS`. The request also requires a click and `confirm:true`. A transaction reserves both call and estimated cents under a global advisory lock before one provider call. A timeout does not automatically retry or return the reservation, because the provider may still bill. The estimate is a cap configuration, not verified provider billing. Image generation is separate from the no-cost structured idea generator.

## Security controls and scope

Founder routes check Neon Auth's server-side admin role. Collection queries and private images remain owner-scoped. Strict action schemas reject unknown fields; JSON streams have byte limits; writes require a same-origin header. Sign-in sensitive POSTs use per-minute throttling and an 8 KiB request cap. Generation and pack/account writes have separate limits. Admin decisions and denials go to `security_events` without prompts, credentials, payment data or raw IPs. The public interest endpoint is off by default, origin checked, small, and throttled. Outbound model calls use a fixed provider URL; arbitrary user URLs are never fetched.

The CSP blocks external scripts, frames, objects and external images; existing Next.js inline bootstrap scripts require `unsafe-inline` for now. A nonce-based CSP is a future hardening step. HSTS, frame protection, no-sniff, referrer and permissions policies are set by the application. Neon Auth cookie behavior is managed by the auth library and needs a browser/host inspection; the code does not claim independent cookie verification. The current production database credential is inherited from the existing Vercel project; a distinct least-privilege runtime role is a separate credential rotation with deployment coordination.

`npm run security:check` executes the Guardian Enforcer and fails on high/critical npm advisories. The lockfile pins the currently installed Auth, Stripe and Vercel Functions versions. An audit found four moderate transitive advisories in `drizzle-kit`'s development toolchain; the suggested automated change would downgrade Drizzle Kit across incompatible versions, so it was not applied. Guardian Enforcer still blocks duplicate IDs, theme/class icon mismatches, release and pack-eligibility changes, obvious live secrets and missing NestForge gates. Art Overseer retains its existing Season One checks.

## Migration and rollback

`drizzle/0002_nestforge_security.sql` only adds private review, aggregate, usage and security-event tables; it does not change cards, ownership, pricing or packs. Apply to a fresh Neon branch first, then production before deploying the matching code. Keep the prior Vercel deployment and main commit available as rollback. Rolling back application code leaves the additive tables harmlessly unused.

## Unfinished launch work

The site remains a review preview. Paid packs and live Stripe are disabled. Season One art and gameplay need human approval, including the known badge corrections on CN1-007 and CN1-008. Public family signup, customer privacy/retention terms, legal IP clearance, a least-privilege database role, a nonce CSP and provider-cost reconciliation remain separate launch tasks.
