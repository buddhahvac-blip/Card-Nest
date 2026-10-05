# Nest Battles operating plan

Status: playable alpha foundation  
Rules version: nest-battles-alpha-1

## Product promise

Nest Battles should be visually exciting and immediately understandable for kids while retaining enough sequencing, matchup knowledge and team construction to reward adults. The surface should feel like an animated tabletop in the Garden of Lands. The depth should come from decisions rather than from dense text or paid power.

## Core loop

Collect or discover a Guardian → build a three-Guardian team → enter a short battle → learn class and Theme interactions → improve team construction → return to collecting, story and future progression.

The alpha uses illustrated Common guardians to prove that ordinary cards can be useful. Rarity must never increase the base battle-stat budget.

## Battle pillars

1. **Readable action** — large cards, clear HP/Guard/Energy, two primary actions, obvious feedback and short battle logs.
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

### Beta — Garden Adventure
- Six Theme regions with tutorial encounters and bosses.
- Starter missions and cosmetic/lore rewards.
- Team builder connected to My Nest.
- Server persistence for progress, but battle balance remains versioned and reversible.

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

The current alpha is local and non-authoritative. Before rewards or PvP:
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
