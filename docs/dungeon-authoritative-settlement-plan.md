# Dungeon authoritative settlement implementation plan (P0)

Status: design/implementation pending. **Do not merge the temporary fail-closed draft**: it blocks legitimate wins as well as forged ones.

## Observed client flow (2026-10-10)
- `app/rune-dungeon-client.tsx` POSTs `start`, passes an attempt ID into local component state, and passes `onVictory` to `NestBattles`.
- `app/nest-battles.tsx` constructs player and enemy teams, simulates `perform()`, damage, cooldowns, turns and team defeat in React client state. It calls `dungeon.onVictory()` after `isTeamDown(rival)`. All of this is untrusted browser state.
- `app/api/dungeon/route.ts` POST `clear` previously accepted the browser-reported result after timing, expiry and ownership checks. The draft branch temporarily blocks this command.
- Existing row locks, unique first-clear semantics and transactional credit logic should be retained once authenticated server outcomes exist.

## Required secure architecture
1. Move battle calculations (start, next turn, ability selection, enemy AI, victory/loss detection) into a deterministic shared game engine running authoritatively on the server. UI may animate server-returned turn events but cannot determine settlement.
2. On `start`, bind immutable attempt ID to user, floor, allowed owned character roster, server-selected enemy rotation, engine/rules version, generated random seed, initial HP/cooldowns and expiry. Persist in database.
3. Introduce authenticated turn submission using attempt ID, expected sequence/version, and action type; validate turn legality, ownership, ability energy and cooldown. Lock attempt row; apply one transition; persist resulting state and action ledger atomically. Reject stale/concurrent/replayed turns.
4. Server computes terminal result. Within one database transaction, mark attempt `won` or `lost`, and for legitimate first wins apply floor clear plus exact `rune_energy` credit once. Browser `clear` must only read the already-settled result, never issue a win.
5. Do not allow changed client enemy IDs, damage, speed, rotation, timer, HP, or claimed victory to affect server decisions. Limit turn count and enforce bounded payloads and reasonable rates.
6. Keep guests in clearly labeled practice mode with no durable rewards; logged-in flow requires server game state. Gracefully resume interrupted battles.
7. Migrate schema additively; never wipe existing accounts, clears, attempts, claims or balances. Version the engine for ongoing attempts. Existing attempts without authoritative state cannot be retroactively credited as verified.
8. Protect production release with feature flag, audit and rollback plan; maintain commerce safety flags unchanged.

## Acceptance tests (blocking)
- Legitimate win persists first clear and grants exactly one configured floor reward.
- Legitimate loss adds zero energy.
- Fabricated `clear` after 15 seconds and after 30 minutes awards zero energy.
- Direct terminal turn, forged roster/enemy IDs, forced HP=0, altered cooldown, illegal action, and skipped turns are rejected.
- Replayed/concurrent identical turn requests settle at most once and do not double credit.
- Cross-account attempts, floor mismatch, expired attempt, out-of-order level, and invalid user are rejected.
- Disconnect/reload resumes verified state; older progress remains intact; first-clear-only rules continue.
- All 30 floors and three worlds tested against boss rotations and loadouts.
- Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` in preview; verify game-integrity audit and real UI flows.

## Release note
The current draft branch is *not a complete security patch* and must never be described as one. Replacing it with a server-authoritative implementation is a prerequisite to approval.

## Draft implementation progress — 2026-11-04

- Added `POST /api/dungeon/combat` for authenticated start and turn commands. A start binds three distinct permitted guardians, a server-selected approved enemy rotation, the floor's difficulty, and a versioned initial combat state to an attempt.
- A turn requires `expectedTurn` matching the locked attempt's server-owned sequence. The server applies combat, records the turn, and persists terminal results under the same database transaction.
- When a server-generated win passes `assertVerifiedDungeonVictory`, the transaction inserts a unique first-clear row and credits Rune Energy only if the insert succeeded. Stale turns, repeated wins, client-reported clears, cross-account attempts, and expired sessions cannot award Energy.
- Added authenticated `GET /api/dungeon/combat?attempt=<uuid>` for restoring an unfinished battle.
- Added `app/dungeon-server-battle.tsx`, an opt-in UI selected only when `NEXT_PUBLIC_DUNGEON_AUTHORITATIVE_BETA=true`; the existing public dungeon presentation is unchanged by default.
- Expanded deterministic win/loss tests for the combat engine.

**Not release-ready.** The draft requires the additive migration `drizzle/0013_dungeon_authoritative_state.sql` in a dedicated preview database, complete test/typecheck/build verification, actual browser testing, ability parity, attack balance checks, and concurrency/replay tests against a database. Do not enable the feature flag in production or merge this PR until those checks pass. Existing user balances and entitlements must remain intact.
