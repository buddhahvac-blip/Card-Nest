CREATE TABLE IF NOT EXISTS "cardnest_v1"."analytics_sessions" (
  "session_hash" text PRIMARY KEY,
  "first_seen" timestamptz NOT NULL DEFAULT now(),
  "last_seen" timestamptz NOT NULL DEFAULT now(),
  "visits" integer NOT NULL DEFAULT 0,
  "season_views" integer NOT NULL DEFAULT 0,
  "card_views" integer NOT NULL DEFAULT 0,
  "pack_previews" integer NOT NULL DEFAULT 0,
  "theme_selects" integer NOT NULL DEFAULT 0,
  "discover_views" integer NOT NULL DEFAULT 0,
  "battle_views" integer NOT NULL DEFAULT 0,
  "my_nest_views" integer NOT NULL DEFAULT 0,
  "support_views" integer NOT NULL DEFAULT 0
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_sessions_last_seen" ON "cardnest_v1"."analytics_sessions" ("last_seen" DESC);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cardnest_v1"."analytics_daily" (
  "day" text NOT NULL,
  "event" text NOT NULL,
  "dimension" text NOT NULL DEFAULT '',
  "count" integer NOT NULL DEFAULT 0,
  CONSTRAINT "analytics_daily_pk" PRIMARY KEY ("day","event","dimension"),
  CONSTRAINT "analytics_daily_event_check" CHECK ("event" IN ('visit','season-view','card-view','pack-preview','theme-select','discover-view','battle-view','my-nest-view','support-view'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_daily_recent" ON "cardnest_v1"."analytics_daily" ("day" DESC,"event");
