ALTER TABLE cardnest_v1.rune_dungeon_progress
  DROP CONSTRAINT IF EXISTS rune_dungeon_progress_highest_cleared_check;
ALTER TABLE cardnest_v1.rune_dungeon_progress
  ADD CONSTRAINT rune_dungeon_progress_highest_cleared_check CHECK (highest_cleared BETWEEN 0 AND 30);

ALTER TABLE cardnest_v1.rune_dungeon_clears
  DROP CONSTRAINT IF EXISTS rune_dungeon_clears_floor_check;
ALTER TABLE cardnest_v1.rune_dungeon_clears
  ADD CONSTRAINT rune_dungeon_clears_floor_check CHECK (floor BETWEEN 1 AND 30);

ALTER TABLE cardnest_v1.rune_dungeon_attempts
  DROP CONSTRAINT IF EXISTS rune_dungeon_attempts_floor_check;
ALTER TABLE cardnest_v1.rune_dungeon_attempts
  ADD CONSTRAINT rune_dungeon_attempts_floor_check CHECK (floor BETWEEN 1 AND 30);

ALTER TABLE cardnest_v1.rune_dungeon_attempts
  ADD COLUMN IF NOT EXISTS outcome text NOT NULL DEFAULT 'active';
ALTER TABLE cardnest_v1.rune_dungeon_attempts
  ADD COLUMN IF NOT EXISTS energy_delta integer NOT NULL DEFAULT 0;
ALTER TABLE cardnest_v1.rune_dungeon_attempts
  DROP CONSTRAINT IF EXISTS rune_dungeon_attempts_outcome_check;
ALTER TABLE cardnest_v1.rune_dungeon_attempts
  ADD CONSTRAINT rune_dungeon_attempts_outcome_check CHECK (outcome IN ('active','won','lost','abandoned'));
ALTER TABLE cardnest_v1.rune_dungeon_attempts
  DROP CONSTRAINT IF EXISTS rune_dungeon_attempts_energy_delta_check;
ALTER TABLE cardnest_v1.rune_dungeon_attempts
  ADD CONSTRAINT rune_dungeon_attempts_energy_delta_check CHECK (energy_delta >= 0);
