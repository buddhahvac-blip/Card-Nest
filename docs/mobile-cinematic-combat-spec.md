# NestRune cinematic mobile battle experience — design specification

Status: design only; no live gameplay, schema, pack pricing, or rewards are modified.

## Product goal
Deliver a polished iOS-first mobile fantasy collection RPG experience inspired by the production qualities of turn-based squad games, while retaining NestRune's original IP, illustrated cards, art direction, and battle logic. Do not copy competitors' artwork, characters, sound, interfaces or exact gameplay implementations.

## Visual treatment
- Phase 1: responsive 2.5D arenas with multi-layer environmental parallax, silhouette depth, character portrait cutouts with subtle skeletal/layer motion, anticipation -> cast -> projectile -> hit -> recoil -> recovery animation states.
- Four signature VFX languages: Volt (electric arcs); Ember (fire and smoke); Tide (waves and mist); Bloom (vines and pollen).
- Epic/Legendary special moves: brief cinematic zoom, unique theme effects, screen shake capped to mild levels, skip/reduced-motion support.
- Use existing validated card art; do not upscale poor-resolution assets or substitute old avatars.
- Sound: original/licensed music per world with independent toggles for soundtrack, SFX and haptics.

## Battle mobile UX
- Target >=44pt touch targets and safe-area support; thumb-reachable ability choices; visible target indicators; readable health/status; clear turn order; pause/reconnect.
- Build preview initially as non-authoritative client animation driven by server-validated actions/results.
- Preserve ability counts and existing rarity rules; do NOT alter server combat mechanics as a VFX feature.
- Consider 3-creature squads only after examining existing game engine/team rules; never silently change existing battle mode.
- 30/60 fps adaptive animation quality with low-power option and assets loaded per arena.
- Accessibility: reduced motion, high contrast, screen reader labels for controls, captions/text for combat results.

## Dungeons and progression
- Preserve 3 dungeon worlds and current 10-level progression per world, as well as existing unlock rules.
- Level 1 must be a gentle tutorial; difficulty ramps across stages to a signature level-10 boss.
- Distinct background/music, opponent variety and theme-specific effects per world.
- Rotate opponents according to existing schedule; never grant energy from local/client-only victory.
- Add visible rewards preview, post-fight victory summary and collection milestones without changing reward amounts until approved.

## New-player and growth flow
- The first-run experience previews choosing a starter roster, opening a one-time welcome pack and finishing a guided battle. Do not enable rewards until server-side per-account eligibility, transaction idempotency, logging and antifraud are audited.
- Optional share cards for rare pulls with nestrune.app invite URL; never expose user information.
- Plan recurring quests and community play later, with child-appropriate privacy/safety constraints and fair monetization.

## Verification gates
1. Audit battle components, server combat validation, existing asset-loading paths, existing app policies and engine before implementation.
2. Mock UX and effects against existing canon; mobile preview behind a feature flag on feature/nestrune-mobile-app.
3. Unit/integration tests for deterministic victory/reward outcomes; test portrait and landscape, iPhone sizes, low-end phones and slow network.
4. Measure first interactive time, memory, crash-free sessions, battle completion and visual frame pacing.
5. Manual approval required before merging to main or deploying production. Keep all database migrations and purchase flow changes separately reviewed.

## Delivery sequence
A: review existing battle renderer and design 2.5D prototype.
B: deliver one Volt creature vs one Bloom enemy demo with real validated battle actions.
C: build the other two theme effects and dungeon environmental presets.
D: finish character previews, post-battle cinematic rewards and high-quality starter onboarding.
E: test mobile beta, app-store acceptance and monetization compliance.
