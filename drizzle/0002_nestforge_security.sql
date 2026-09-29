CREATE TABLE IF NOT EXISTS "cardnest_v1"."security_events" (
  "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "kind" text NOT NULL,
  "actor_id" text,
  "subject" text,
  "details" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "security_events_recent" ON "cardnest_v1"."security_events" ("created" DESC);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cardnest_v1"."nestforge_concepts" (
  "id" text PRIMARY KEY,
  "owner_id" text NOT NULL,
  "request_key" text NOT NULL,
  "signature" text NOT NULL,
  "profile" jsonb NOT NULL,
  "state" text NOT NULL DEFAULT 'idea' CHECK ("state" IN ('idea','generated','overseer-review','needs-revision','founder-review','approved','production-ready','rejected')),
  "generation_model" text,
  "asset_key" text,
  "overseer" jsonb,
  "review_note" text,
  "founder_approval" timestamptz,
  "created" timestamptz NOT NULL DEFAULT now(),
  "updated" timestamptz NOT NULL DEFAULT now(),
  UNIQUE("owner_id","request_key")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nestforge_recent" ON "cardnest_v1"."nestforge_concepts" ("created" DESC);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cardnest_v1"."nestforge_usage" (
  "day" date NOT NULL,
  "owner_id" text NOT NULL,
  "calls" integer NOT NULL DEFAULT 0 CHECK ("calls">=0),
  "reserved_cents" integer NOT NULL DEFAULT 0 CHECK ("reserved_cents">=0),
  PRIMARY KEY ("day","owner_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cardnest_v1"."nestforge_interest_counts" (
  "interest" text PRIMARY KEY,
  "clicks" bigint NOT NULL DEFAULT 0 CHECK ("clicks">=0)
);
