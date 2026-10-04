CREATE TABLE IF NOT EXISTS "cardnest_v1"."release_controls" (
  "id" text PRIMARY KEY,
  "common_pull_cap" integer NOT NULL DEFAULT 1600 CHECK ("common_pull_cap" >= 0),
  "epic_release_at" timestamptz,
  "enabled" boolean NOT NULL DEFAULT true,
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
INSERT INTO "cardnest_v1"."release_controls" ("id","common_pull_cap","enabled")
VALUES ('season-1-pre-epic',1600,true)
ON CONFLICT ("id") DO NOTHING;
