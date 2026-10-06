# Nest Battles operating plan

Status: playable alpha + Rune Dungeon beta  
Rules version: nest-battles-alpha-2-specials

## Product promise

Nest Battles should be visually exciting and immediately understandable for kids while retaining enough sequencing, matchup knowledge and team construction to reward adults. The surface should feel like an animated tabletop in the Garden of Lands. The depth should come from decisions rather than from dense text or paid power.

## Core loop

Collect or discover a Guardian → build a three-Guardian team → enter a short battle → learn class and Theme interactions → improve team construction → return to collecting, story and future progression.

The alpha uses illustrated Common guardians to prove that ordinary cards can be useful. Rarity must never increase the base battle-stat budget.

## Battle pillars

1. **Readable action** — Guardian avatars plus collectible card art, clear HP/Guard/Energy, Quick Strike + Ability + Special, obvious feedback and short battle logs.
2. **Strategic timing** — Speed, cooldowns, Energy, switching and affinity affect the order and value of actions.
3. **Team identity** — Scout, Striker, Vanguard, Support, Warden and Disruptor must each have a recognizable purpose.
4. **Collection usefulness** — owning more guardians should create new strategies, not mandatory power escalation.
5. **Low-pressure family design** — no paid power, forced streaks, countdown purchases or open child chat.

## Roadmap gates

### Alpha — Practice Arena
- Local 3v3 practice matches.
- Six illustrated Common learning cards covering all six battle classes.
- No rewards, trading, rank or purchases.
- Measure clarity, match length, class diversity and rematch intent.

### Rune Dungeon World Map
- **World I — Verdant Skywilds (Floors 1–3):** Bloom / Tide / Mystic encounters, enchanted Great Nest landscape treatment, and the CC0 track *Fairy Battles*.
- **World II — Emberstorm Crucible (Floors 4–7):** Ember / Volt encounters, volcanic forge landscape treatment, and the CC0 track *Hope (Orchestral battle music)*.
- **World III — Eclipse Runeheart (Floors 8–10):** Shadow / Mystic / Ember encounters, moonlit Runeheart landscape treatment, and the CC0 track *Heavy Boss Battle 2*.
- Each world changes the arena lighting, foreground/particle treatment, enemy Theme mix and background music while preserving the same battle rules and Rune Energy economy.
- Music provenance and license evidence are kept in `docs/AUDIO_SOURCES.md`.

### Beta — Rune Dungeon / Garden Adventure
- Rune Dungeon launches the PvE foundation with ten sequential mission floors and a boss on Floor 10.
- Enemy HP and damage scale by floor; Specials, swapping, affinity and Energy remain the strategic core.
- First clears persist per account and award account-bound Rune Energy once per floor.
- Rune Energy cannot be purchased, transferred or cashed out. It may only claim free preview-pack entitlements while the beta preview pool is enabled.
- Reward costs are server-defined: Hatchling 20, Nest 50, Guardian 90, Royal Nest 140 Rune Energy.
- All ten first clears award 240 Rune Energy total. Replays award zero additional Energy.
- The team builder remains a starter learning pool for this first pass; My Nest roster selection is a later gate.
- Expand toward six Theme regions after mission completion, balance and reward telemetry are validated.

### League — Ranked Battles
Do not launch until:
- server-authoritative action validation exists;
- anti-cheat and abuse controls pass review;
- matchmaking and disconnect handling are tested;
- balance telemetry is available;
- account age/family policy is finalized;
- reward economy has no paid competitive advantage.

### Flocks — Cooperative play
- Cooperative bosses and group goals.
- No open child chat at launch.
- Any messaging, friend or social graph feature requires separate moderation, privacy and parental-consent review.

## Operating metrics

Nest Mind should summarize, but not autonomously rebalance from:
- match starts and completions;
- rematch rate;
- average rounds and duration;
- Guardian/class pick rate;
- ability usage;
- swap usage;
- surrender or abandonment rate;
- Theme matchup win rates;
- first-session tutorial completion;
- return-to-play rate after a battle.

Do not optimize primarily for spend, pack openings or time-on-site. Fun, comprehension, fairness and return intent are the first alpha signals.

## Balance policy

- Rarity does not add to the base stat budget.
- Cosmetics, animation, lore depth and presentation may scale with rarity.
- Every balance change gets a version label and playtest note.
- Avoid hard counters that make a match feel decided at team select.
- Common cards must remain viable in at least one useful team role.
- Paid products may expand collection choice but cannot sell exclusive statistical advantage.

## Technical direction

The current battle resolution is still client-side and non-authoritative. Rune Dungeon therefore limits beta rewards to finite, account-bound, no-cash-value preview entitlements with one server-recorded Energy award per floor. Before any economically valuable reward, paid competitive reward or PvP:
- move match resolution to trusted server code;
- persist match IDs and rules version;
- validate owned/deck-eligible cards server-side;
- record deterministic action logs for dispute/debug review;
- rate-limit matchmaking/actions;
- keep commerce and battle entitlement boundaries separate.

## Visual direction

Kids: expressive Guardian art, bright ability feedback, simple move names, readable numbers, celebratory but non-manipulative animation.

Adults: visible class roles, exact stats, affinity information, cooldowns, Guard, Energy, team swaps, versioned rules and later deck/habitat construction.

Reduced-motion preferences must always receive a complete playable static experience.
