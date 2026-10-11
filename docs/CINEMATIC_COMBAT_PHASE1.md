# Cinematic Combat FX — Phase 1
Status: implemented on feature branch; not deployed or runtime-tested.
Feature flag: `NEXT_PUBLIC_NESTRUNE_CINEMATIC_FX=true` (unset/false means original effects).

## Changes
- Battle stage receives `data-cinematic=true` only when the flag is enabled.
- Scoped CSS introduces gentle character idle motion, anticipation/lunge for strikes, charged casting, longer special motion, hit recoil, and Guard/Special visual emphasis.
- Existing effect timeline lengths (680ms normal / 820ms special) stay unchanged.
- Respects OS `prefers-reduced-motion: reduce` by disabling added character animations.
- Preserves all attack damage, combat rules, team selection, cooldowns, reward calls and dungeon progression; no server or database changes.

## Local verification (required before staging)
1. Install dependencies with `npm ci`.
2. Execute `npm run typecheck && npm run lint && npm test && npm run build`.
3. Start locally with flag unset; verify visuals unchanged in Nest Battles and Rune Dungeon.
4. Restart dev server with `NEXT_PUBLIC_NESTRUNE_CINEMATIC_FX=true` (Next.js public env flags are built into client bundles). Verify idle/strike/cast/special/hit/guard and skip-effects behavior.
5. Test normal and reduced-motion settings, desktop, iPhone-size viewport, Android-size viewport, tablet, portrait/landscape, low-end device.
6. Verify all currently battle-ready cards use existing card image or fallbacks. Check no cropped transforms or overlay misalignment during attack animation.
7. Confirm outcomes and rewards identical with flag on/off. Do not use current client-clear endpoint as proof of server-authoritative wins.
8. No production enablement until security plan's server-side authoritative outcome gate is addressed.

## Acceptance
- Legacy experience identical with flag disabled.
- Flagged animation changes only presentation; no extra visual delays versus battle snapshots.
- No broken player input after Skip effects, KO, swap or route navigation.
- Text overlays remain readable, reduced-motion obeyed and no runaway continuous effects on mobile.

## Follow-up
- Instrument staged screenshot/screen recordings and automated visual regression checks.
- Implement normalized event timeline and multi-creature animations only after this base pass is verified.
