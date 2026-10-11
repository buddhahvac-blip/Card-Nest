# NestRune — RPG Dungeon Upgrade Execution Plan
Status: PLANNED (no gameplay changes in this commit)
Branch: `feature/raid-inspired-dungeon-upgrade`
Baseline: `main` at branch creation
Principle: Inspired by the *feel* of premium squad RPGs; no third-party assets, names, proprietary animations or copied interfaces.

## Non-negotiable invariants
- Do not modify production settings, deploy, merge or migrate production data from this branch without separate review.
- Preserve existing Season One manifest, live-card roster, My Nest ownership, catalog/pack eligibility, rarity/ability permissions, 3 worlds, 10 levels per world, first-clear Rune Energy values, and Royal Nest purchase-only gate.
- Maintain accessible input, reduced-motion mode, mobile layouts, and low-end performance fallback.
- Never grant rewards solely from a client-submitted victory. Current `app/api/dungeon/route.ts` validates signed-in attempt, floor, time, and completion, **but does not yet verify actual server-authoritative battle outcomes**. Treat this as a release blocker; do not characterize timing as proof of victory.
- Isolate upgrades behind a disabled-by-default feature flag until server authority, regression tests, and staging checks pass.

## Baseline source inventory (main)
- `app/nest-battles.tsx`: setup, 3-member roster, active fighters, round-based actions, battle snapshots, UI state.
- `app/battle-fx.tsx`, `app/battle-fx.module.css`: arena, ambient effects, boss entrance, timed attack overlays.
- `app/theme-combat-fx.tsx`, `app/theme-combat-fx.module.css`: Volt/Ember/Tide/Bloom/Mystic/Shadow identities.
- `lib/nest-battle-rules.ts`, `lib/battle-ability-profile.ts`: calculation and ability rules.
- `lib/rune-dungeon.ts`: 30 floors / 3 worlds / base enemy configuration and progression.
- `app/rune-dungeon-client.tsx`: map, start/clear/loss, first-clear feedback, NestBattles handoff.
- `app/api/dungeon/route.ts`: attempts, clears, rewards; review server-authority gap.
- `tests/rune-dungeon.test.ts`, `tests/nest-battle-rules.test.ts`, `tests/battle-roster.test.ts`, `tests/battle-ability-profile.test.ts`: existing tests.

## Sequence (implement in small independent PRs)

### Phase 0 — Baseline, guardrails, threat model (1–2 days)
1. Capture test/build/lint/typecheck results and baseline screenshots on desktop/tablet/mobile in a staging environment.
2. Document combat flow, reward flow, animation timings, player actions and irreversible writes.
3. Add `RPG_DUNGEON_V2_ENABLED` flag (default false); avoid modifying base experience when off.
4. Define server-side authoritative model: battle session ID, cryptographically opaque action session, owned-eligible team snapshot, canonical enemy snapshot, action sequence, validation against ability costs/cooldowns, boss state, terminal result; persist and transactionally close session before any first-clear grant. Ensure idempotency and replay resistance.
5. Exit gate: baseline green; no prod writes; reward threat model reviewed.

### Phase 1 — Pure deterministic combat core (3–6 days)
1. Extract combat resolution out of React UI into `lib/combat-v2/`: types, immutable state reducer, abilities, status effects, target policy, seeded enemy AI, turns, canonical action events, victory/loss.
2. Retain current rarity ability limits, affinity, Guard, energy, damage and cooldown tuning unless separately reviewed and versioned.
3. Add deterministic fixtures and extensive unit tests: target selection, status stacking/expiry, speed-order ties, KO, revive if added, simultaneous KO, cooldown, energy, low-level balancing, invalid action.
4. Server and client must consume same canonical rules and version identifier.
5. Exit gate: deterministic replay verified; old combat unchanged when flag off.

### Phase 2 — Presentation engine / creature animation (3–5 days)
1. Separate semantic battle event timeline from visual presentation; do not let animation completion determine authoritative damage or victory.
2. Implement creature slots with reusable art-based rigs (idle/anticipate/cast/impact/recoil/KO) that gracefully fall back to static card illustration; prefer 2D/2.5D to mass 3D.
3. Add synchronized hit flash, VFX, damage text, sound, HP interpolation, animation cancel/skip, and reduced-motion variants.
4. Preserve all 6 theme FX identities; no copyrighted external assets.
5. Exit gate: 3-character art fallback, smooth playback, no missing images, reduced-motion confirmed.

### Phase 3 — 3v3 visible squad UI and targeting (4–7 days)
1. Render all allied/enemy combat slots on mobile/desktop while keeping card ownership, stats, and ability tooltips discoverable.
2. Accessible click/tap/keyboard targeting; legal-target outlines; active turn indicator; shield/status/cooldown indicators.
3. Upgrade mobile layout for touch targets >=44 CSS px, no horizontal overflow; use visual quality tiers.
4. Exit gate: no unintended changes to original `/play` while flag off; target selection works on all target device sizes.

### Phase 4 — Multiwave dungeons, enemy AI and boss phases (5–8 days)
1. Define `DungeonEncounter` separate from existing floor and reward definitions: 1–3 waves; beginner floors 1–3 shorter; level 10/20/30 unique boss encounters.
2. Introduce telegraphed boss moves with one-turn reaction windows; explicit dispels/interrupts; prevent unwinnable loops.
3. Thornveil sovereign: breakable root anchors and controlled regeneration. Crucible sovereign: furnace charge / guard timing. Dreadmoon sovereign: shadow doubles and phase-based vulnerability.
4. Ensure world unlock rules, rotating eligible enemies, base rewards and first-clear-only semantics remain unchanged.
5. Balance progression using team-power fixtures; target level 1 reliably completable by baseline starter team.
6. Exit gate: boss strategy explained in UI; beginner levels easy; defeat and retry do not mint rewards.

### Phase 5 — Server-authoritative rewards and abuse hardening (4–7 days; REQUIRED before opt-in)
1. Design migration(s) additive only, no destructive table resets; review against Neon branch before application.
2. Start battle: server binds user, floor, roster, version, rotation key, canonical opponent, session lifetime.
3. Submit action: server checks sequential nonce/action count, current actor, legal targets, resources, cooldowns and canonical state; returns authoritative events/state.
4. Victory can only be saved after terminal authoritative session; grant first-clear energy in the same transaction (or idempotent transactionally linked completion). Require session ownership, expiration, unique first-clear key, no duplicate grants, and no cross-floor/session replay.
5. Negative tests: forged win, forged damage, skipped actions, timing bypass, stale sessions, repeated submission, concurrent clears, roster tampering, network retries, loss/refund path.
6. Exit gate: security tests pass and production reward endpoint cannot be tricked into trusting a client assertion.

### Phase 6 — Polish and gated rollout (4–7 days)
1. Profile mobile FPS, loading, Web Vitals, audio, network interruptions, and low-end reduced-motion fallback.
2. Add optional x2 playback, skip and auto-battle only when server-validated and with distinct limits; do not shortcut win checking.
3. Staging QA: desktop Chromium, Safari iOS, Chrome Android, tablet, narrow portrait/landscape. Compare before/after screenshots and smoke tests.
4. Monitor completion, crash/failed-session rates, retry, turn duration, first-clear payout consistency and low-level success.
5. Roll out staged flag only after review; retain immediate rollback to v1 and immutable ownership/rewards.

## Test plan — commands
- `npm ci`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build` (runs repo prebuild checks; safe with test-only env and no prod credentials)
- `npm run security:check` (requires dependency registry access)

## Test plan — acceptance matrix
| Area | Required behavior |
|---|---|
| Existing v1 | Flag off yields unchanged UX, rules, rewards and URLs |
| Starting roster | Own and eligible cards only; all currently live cards work |
| 3v3 | Correct turn order, targeting, KO and swaps; no stuck turns |
| Abilities | Rarity restrictions, costs, cooldowns, affinities, buffs and Guard match versioned specification |
| Visuals | Correct theme effects, timeline sync, pause/cancel, audio unlock, fallback images |
| Accessibility | Touch 44px, keyboard focus, reduced motion, readable HUD |
| Dungeon progression | Three worlds; levels 1–10 each; no skips; progressive difficulty |
| Waves/bosses | Deterministic state transitions; telegraphs; no softlocks |
| Rewards | No reward on fake victory/loss/replay; legitimate first clear granted exactly once |
| Security | Action tampering, repeat requests, expired sessions, concurrency, cross-user access rejected |
| Reliability | Reload/resume semantics explicit; network loss and double-tap safe |
| Performance | Target 60fps capable desktop / 30fps fallback mobile; benchmark not assumed |
| Deployment | Staging before production; migration rollback rehearsed; feature flag off by default |

## First PR implementation cut
- Add feature flag and v2 state/event types, pure reducer skeleton, and tests; NO modification to `/api/dungeon` reward semantics and NO production exposure until security redesign is complete.
- Next PR adds one Thornveil level-10 prototype with static-art fallbacks, feature-flagged presentation, boss mechanics as deterministic events.
- Follow with server-authoritative combat and reward pipeline **before** enabling any live reward-bearing v2 dungeon.

## Definition of done
All test matrix items have evidence; no production change without explicit approval; v1 preserved; only original/licensed audio and images; no client-trusted reward settlement; PR review and documented rollback plan.
