# NestRune shared ecosystem architecture

Status: architecture specification only. Do not deploy or modify production by committing this document.

## Product boundary
- **One account, one authoritative game backend** shared by nestrune.app and the future iOS app.
- Game surfaces: original NestRune cards, My Nest, validated pack-opening inventory, Nest Battles, Rune Dungeons, energy, rewards and progression. Reuse existing endpoints wherever safe; mobile presents the same authoritative state with its own responsive UX.
- Website additionally owns a **separate affiliate marketplace** for permitted external partner products. Affiliate products must be clearly labeled as third-party offerings, distinct from original NestRune IP and packs.
- Keep affiliate checkout/referral links on the website. Do not insert external purchase links or affiliate storefront promotions into iOS game flows without App Store policy/legal review.

## Shared-state rules
- Authenticate mobile and web to the existing account identity; no separate mobile user database.
- Server is source of truth for draws, inventory, battle results, level unlocks, energy and idempotent rewards.
- Mobile refreshes authoritative account state after claims, purchases, dungeon completions and app resume; avoid inventing client wins.
- Log reward transactions with unique event IDs to protect against double credit across devices; use replay-safe operations.
- Use a shared game schema and versioned APIs; retain a compatibility window when mobile releases lag website deployments.
- App purchases of digital goods must use an Apple-compliant in-app purchase design, server receipt verification and synchronized entitlements; do not assume website Stripe checkout can be embedded in iOS.
- Keep affiliate identifiers and attribution separated from in-game economy and children’s account data.

## Operations and safety
- Development stays on feature/nestrune-mobile-app until production approval.
- Staging uses nonproduction databases/secrets and synthetic inventory; no live rewards or money.
- Test web/mobile switching, concurrent claims, offline reconnection, duplicate checkout callbacks and purchases on multiple devices.
- Review Apple policies, affiliate program terms, privacy/consent and youth protections before release.
- No database migrations, production deploys, live payments or affiliate link modifications without explicit approval.

## Rollout
1. API and account-state audit.
2. Mobile battle UI / animation pilot.
3. Staging cross-device authentication, inventory, dungeon and reward tests.
4. Apple purchase and entitlement compliance review.
5. Opt-in mobile beta; then approve production integration.
