CREATE INDEX IF NOT EXISTS copies_user_card_idx ON cardnest_v1.copies(user_id, card);
CREATE INDEX IF NOT EXISTS openings_user_created_idx ON cardnest_v1.openings(user_id, created DESC);
CREATE INDEX IF NOT EXISTS entitlements_user_status_idx ON cardnest_v1.entitlements(user_id, status);
CREATE INDEX IF NOT EXISTS purchases_user_status_idx ON cardnest_v1.purchases(user_id, status);
CREATE INDEX IF NOT EXISTS rune_dungeon_claims_user_created_idx ON cardnest_v1.rune_dungeon_claims(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS beta_feedback_session_created_idx ON cardnest_v1.beta_feedback(session_hash, created DESC);
CREATE INDEX IF NOT EXISTS rate_limits_expires_idx ON cardnest_v1.rate_limits(expires);
