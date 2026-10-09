ALTER TABLE cardnest_v1.cards ADD COLUMN IF NOT EXISTS upload_source text;
ALTER TABLE cardnest_v1.cards ADD COLUMN IF NOT EXISTS approved_by_founder boolean NOT NULL DEFAULT false;
ALTER TABLE cardnest_v1.cards ADD COLUMN IF NOT EXISTS founder_uploaded_at timestamptz;
ALTER TABLE cardnest_v1.cards ADD COLUMN IF NOT EXISTS uploaded_by_user_id text;
ALTER TABLE cardnest_v1.cards DROP CONSTRAINT IF EXISTS cards_upload_source_check;
ALTER TABLE cardnest_v1.cards ADD CONSTRAINT cards_upload_source_check CHECK (upload_source IS NULL OR upload_source IN ('founder','system','migration','admin'));
CREATE INDEX IF NOT EXISTS cards_founder_uploads_recent ON cardnest_v1.cards (founder_uploaded_at DESC) WHERE approved_by_founder=true;
