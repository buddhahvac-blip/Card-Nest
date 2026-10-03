ALTER TABLE "cardnest_v1"."analytics_sessions" ADD COLUMN IF NOT EXISTS "showcase_views" integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "cardnest_v1"."analytics_sessions" ADD COLUMN IF NOT EXISTS "living_views" integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "cardnest_v1"."analytics_sessions" ADD COLUMN IF NOT EXISTS "album_views" integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "cardnest_v1"."analytics_sessions" ADD COLUMN IF NOT EXISTS "first_saved_at" timestamptz;
--> statement-breakpoint
ALTER TABLE "cardnest_v1"."analytics_sessions" ADD COLUMN IF NOT EXISTS "battle_after_save" boolean NOT NULL DEFAULT false;
--> statement-breakpoint
ALTER TABLE "cardnest_v1"."analytics_daily" DROP CONSTRAINT IF EXISTS "analytics_daily_event_check";
--> statement-breakpoint
ALTER TABLE "cardnest_v1"."analytics_daily" ADD CONSTRAINT "analytics_daily_event_check" CHECK ("event" IN ('visit','season-view','card-view','pack-preview','theme-select','discover-view','battle-view','my-nest-view','support-view','favorite','wishlist-add','share-card','feedback-submit','showcase-view','living-view','album-view'));
