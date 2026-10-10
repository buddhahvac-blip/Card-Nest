# Rune Dungeon: server-authoritative victory verification

## Security property
No client-reported `onVictory`, timer, HP value, action trace, or signed browser payload can independently authorize currency. A server-owned combat engine must determine the outcome before the first-clear reward transaction runs.

## Current code and gap
- `app/nest-battles.tsx`: local React state drives fighter health, buffs, cooldowns, opponent selection, and the `dungeon.onVictory()` callback.
- `app/rune-dungeon-client.tsx`: posts `{action:'clear', floor, attempt}` after that callback.
- `app/api/dungeon/route.ts`: originally credited currency based only on attempt ownership/unlock/age; there is no trustworthy battle result.
- Emergency PR #49 deliberately fails closed for *new* first clears. It is not an acceptable final game release since legitimate energy rewards are unavailable.

## Permanent architecture
1. Extract combat logic into a pure deterministic shared module, without timers, effects, network, window or React. Keep the current combat rules, damage formulas, guarding, cooldowns, enemy AI, turn order, and swapping, including all rarity-specific abilities.
2. At `start`, the server records attempt ID, authenticated user, dungeon floor, validated three-card roster, fixed enemy roster / rotation, rules version, and initial combat state. Only eligible, actually owned cards may be used if that is the live game rule. Save snapshots against the attempt, not in the browser.
3. Add an authenticated `action` endpoint that accepts only the next player action (including swap), enforces move validity and cooldown/energy, and advances combat on the server. Serialize concurrent actions with row locks and monotonically increasing turn IDs; stale/duplicate turns must not advance the state.
4. Return authoritative current combat state and event descriptions to the client. Animate using server results; never use rendered VFX to determine wins.
5. On terminal victory the server itself atomically sets attempt outcome to `won`. On loss it sets `lost` and energy delta zero. The client may request `clear`, but the endpoint awards only when the locked, matching attempt has verified `won` status.
6. Under the existing per-user progress lock, atomically insert one `rune_dungeon_clears` row per user/floor and adjust `rune_dungeon_progress`. Reject stale, expired, replayed, misowned, or floor-mismatched attempts. Keep existing clear and pack entitlement behavior.
7. Never trust a caller-supplied `won` flag, replay transcript, HP, duration or final damage total. Do not expose any server credential used to sign/state transitions.
8. Preserve historical energy and clears and run the current integrity monitor before and after migration.

## Required security tests
- forged `clear` without server verified victory -> zero reward
- `clear` on a merely started attempt, even after 15 seconds -> zero
- lost, expired, mismatched floor, foreign-user attempt -> zero
- replay, double-submit and simultaneous submits -> at most one reward
- manipulated action, impossible swap, illegal ability or turn ordering -> rejected
- normal player win -> exactly one first-clear reward
- legitimate replay win -> no additional Rune Energy
- pack claim never exceeds available energy, duplicate claim cannot create an extra entitlement
- all thirty floor configurations and each world boss use correct frozen enemy roster and balance multipliers
- actual mobile browser gameplay remains playable with server action latency and existing visual effects

## Release gate
Do not merge the emergency block alone into production unless explicitly choosing a temporary full freeze on *new* earned energy. Do not declare security resolved until server-side victory transitions, integration tests, typecheck, build and preview battle smoke tests pass.
