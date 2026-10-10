-- Draft only. Not applied to production.
-- Only server-owned combat handlers may write these fields.
ALTER TABLE cardnest_v1.rune_dungeon_attempts
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS combat_state jsonb,
  ADD COLUMN IF NOT EXISTS combat_rules_version text,
  ADD COLUMN IF NOT EXISTS turn_sequence integer NOT NULL DEFAULT 0;
ALTER TABLE cardnest_v1.rune_dungeon_attempts
  ADD CONSTRAINT rune_dungeon_verified_win_consistency
    CHECK (verified_at IS NULL OR (outcome = 'won' AND completed_at IS NOT NULL AND verified_at <= completed_at));
-- Do not retroactively populate verified_at from old 'won' rows:
-- historical wins were client-reported, not independently verified.
-- Server must persist each action and evaluate victory before stamping verified_at.
