ALTER TABLE "cardnest_v1"."analytics_sessions" ADD COLUMN IF NOT EXISTS "favorite_actions" integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "cardnest_v1"."analytics_sessions" ADD COLUMN IF NOT EXISTS "wishlist_actions" integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "cardnest_v1"."analytics_sessions" ADD COLUMN IF NOT EXISTS "share_actions" integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "cardnest_v1"."analytics_sessions" ADD COLUMN IF NOT EXISTS "feedback_submits" integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "cardnest_v1"."analytics_daily" DROP CONSTRAINT IF EXISTS "analytics_daily_event_check";
--> statement-breakpoint
ALTER TABLE "cardnest_v1"."analytics_daily" ADD CONSTRAINT "analytics_daily_event_check" CHECK ("event" IN ('visit','season-view','card-view','pack-preview','theme-select','discover-view','battle-view','my-nest-view','support-view','favorite','wishlist-add','share-card','feedback-submit'));
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cardnest_v1"."beta_feedback" (
  "id" text PRIMARY KEY,
  "session_hash" text NOT NULL,
  "favorite_guardian" text,
  "would_collect" text NOT NULL CHECK ("would_collect" IN ('yes','maybe','no')),
  "pack_fun" integer NOT NULL CHECK ("pack_fun" BETWEEN 1 AND 5),
  "return_reason" text NOT NULL,
  "next_priority" text NOT NULL CHECK ("next_priority" IN ('collecting','battles','stories','trading','customization')),
  "created" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "beta_feedback_created" ON "cardnest_v1"."beta_feedback" ("created" DESC);
