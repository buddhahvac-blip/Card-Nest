-- Additive state for server-authoritative Rune Dungeon battle settlement.
-- No historical attempts, clears, claims or energy balances are modified.
ALTER TABLE cardnest_v1.rune_dungeon_attempts
 ADD COLUMN IF NOT EXISTS engine_version text,
 ADD COLUMN IF NOT EXISTS combat_state jsonb,
 ADD COLUMN IF NOT EXISTS turn_index integer NOT NULL DEFAULT 0,
 ADD COLUMN IF NOT EXISTS combat_verified_at timestamptz;
DO $ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='rune_dungeon_attempts_turn_index_nonnegative' AND conrelid='cardnest_v1.rune_dungeon_attempts'::regclass) THEN
  ALTER TABLE cardnest_v1.rune_dungeon_attempts ADD CONSTRAINT rune_dungeon_attempts_turn_index_nonnegative CHECK (turn_index >= 0);
 END IF;
END $;

CREATE TABLE IF NOT EXISTS cardnest_v1.rune_dungeon_turns (
 attempt_id uuid NOT NULL REFERENCES cardnest_v1.rune_dungeon_attempts(id) ON DELETE CASCADE,
 turn_index integer NOT NULL CHECK(turn_index >= 1),
 actor_id text NOT NULL,
 action text NOT NULL CHECK(action IN ('strike','ability','power','special','guard','swap')),
 resulting_state jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(attempt_id,turn_index)
);
CREATE INDEX IF NOT EXISTS rune_dungeon_turns_attempt_created_idx
 ON cardnest_v1.rune_dungeon_turns(attempt_id, created_at);
