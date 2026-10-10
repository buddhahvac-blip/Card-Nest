# NestRune mobile growth — implementation roadmap (October 2026)

Branch: `feature/nestrune-mobile-app`. No production deployment or database migration is authorized by this document.

## Guardrails
- Keep `main`, production deployments, Stripe and Neon production schema unchanged until review.
- Preserve card canon, rarity, pack costs and eligibility rules (Hatchling 100 energy, Nest 220 energy, Guardian 400 energy, Royal Nest purchase-only); do not alter without explicit business approval.
- Never trust clients for wins, energy grants, inventory or pack pulls. Use server-side idempotent transactions with audit trails and abuse limits.
- No copying competitor IP. No manipulative notifications or randomized purchase claims without clear disclosure; take extra care for younger players.

## Phase 1 — mobile foundation and first-session conversion
1. Installable web-app manifest and branded mobile icons (this branch's manifest is an initial foundation; provide 192/512 PNG and Apple touch assets before release).
2. Responsive touch targets, reduced-motion option, landscape/portrait QA, slow-network image checks, and recovery from mid-battle reconnects.
3. New player path: free introductory pack **once per verified account**, welcome deck, guided battle, then first dungeon. Rewards must be gated by server-side eligibility and anti-abuse checks; requires product approval before enabling.
4. Optional shareable card-pull art with a branded nestrune.app deep link, avoiding account data leaks and preserving player choice. Add acquisition UTM attribution.
5. First-session funnel analytics: landing -> signup -> tutorial -> first pack -> first battle -> second session. Avoid capturing children's personal information unnecessarily.

## Phase 2 — reasons to return
1. Daily and weekly quests using existing validated event records, capped rewards and idempotent claims.
2. Rotating dungeon encounters and modest event schedules with transparent countdowns and rotating rewards.
3. Card collection milestones, transparent collection odds, and non-purchase cosmetic achievements.
4. Opt-in notifications for genuinely relevant events with quiet hours and frequency caps.

## Phase 3 — social and sustainable discovery
1. Private friend challenges with basic moderation, report/block controls and youth-safety assessment.
2. Seasonal leaderboard with cheat detection and fair matchmaking.
3. Share links that attribute referred users; avoid rewarding fake registrations or self-referrals.
4. Community-friendly cosmetic events; do not lock core progress behind recruitment.

## Measurement and release gates
- Track daily active players, day-1/day-7/day-30 retention (by signup cohort), first-battle completion, pack-to-battle engagement, crash-free sessions, rewards error rate, and organic referred registrations.
- Use feature flags; stage tests with nonproduction credentials and separate data. Roll back if reward integrity, payments, login, or battle regression checks fail.
- Before any release: run tests, typecheck, mobile device QA, accessibility checks, server reward-integrity tests, and explicit human approval for deployment.

## Competitive design references
- Pokémon TCG Pocket: rewarding pack-opening and collecting loop.
- MARVEL SNAP: brief strategic matches, starter decks, weekend missions.
- Clash Royale: approachable competition and social progression.
- RAID: team-building and dungeon progression.
- Brawl Stars: concise events and intuitive mobile play.
These are design inspirations only, not a claim that any specific feature guarantees traffic.
