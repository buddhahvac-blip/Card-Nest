# Phase 1C — Sovereign Cinematic Presentation
Status: code committed, QA pending. Existing rules and rewards unchanged.

## Scope
Feature flag `NEXT_PUBLIC_NESTRUNE_CINEMATIC_FX=true` enables:
- Dramatic entrance for existing dungeon bosses (levels flagged boss or worldBoss).
- Pulsing boss aura.
- Attack-in-progress HUD cue `SOVEREIGN STRIKE` / `SOVEREIGN SIGNATURE` when the rival actually attacks.
- Visual `SOVEREIGN DEFEATED` overlay when battle enters finished state and all rival fighters have zero HP.
- Small-screen adjustments and reduced-motion fallbacks.

Important: the current attack cue is **not** a strategic advance warning. True turn-ahead boss telegraphs require versioned combat-rule and enemy-AI changes, outside this visual-only phase. Likewise the cinematic does not create new boss abilities or change attack damage.

## QA checklist (must perform in local/staging; not verified by commit)
1. Set preview `NEXT_PUBLIC_NESTRUNE_CINEMATIC_FX=true`, rebuild, and start boss levels 10, 20, 30.
2. Verify opening title fades without covering ability controls; stage animations have no pointer events.
3. Watch enemy attacks: warning and signature only on boss levels during rival actions; not on player attacks, swaps, or normal floors.
4. Finish battle by victory and loss. Defeat banner only on boss victory.
5. Check mobile narrow portrait, tablet, desktop, and reduced-motion accessibility.
6. Flag unset: unchanged original boss entrance and other combat visuals.
7. Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
8. Confirm no changes to damage, ability cooldowns, rewards, level progression. Do not enable real rewarded V2 combat before server-authoritative victory verification.

## Next
Follow up with screenshot-based QA. Build actual anticipatory telegraphs and multi-phase boss behavior only as a separately reviewed and tested gameplay-rules feature.
