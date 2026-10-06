CREATE TABLE IF NOT EXISTS cardnest_v1.rune_dungeon_attempts (
  id uuid PRIMARY KEY,
  user_id text NOT NULL REFERENCES cardnest_v1.users(id) ON DELETE CASCADE,
  floor integer NOT NULL CHECK (floor BETWEEN 1 AND 10),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 minutes')
);

CREATE INDEX IF NOT EXISTS rune_dungeon_attempts_user_floor_idx
  ON cardnest_v1.rune_dungeon_attempts(user_id, floor, started_at DESC);

CREATE INDEX IF NOT EXISTS rune_dungeon_attempts_expires_idx
  ON cardnest_v1.rune_dungeon_attempts(expires_at);
