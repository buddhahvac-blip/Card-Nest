CREATE TABLE IF NOT EXISTS "cardnest_v1"."support_tickets" (
  "id" text PRIMARY KEY,
  "number" bigint GENERATED ALWAYS AS IDENTITY UNIQUE NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "category" text NOT NULL CHECK ("category" IN ('account','collection','affiliate','bug','privacy','general')),
  "subject" text NOT NULL,
  "message" text NOT NULL,
  "status" text NOT NULL DEFAULT 'open' CHECK ("status" IN ('open','in-progress','waiting','closed')),
  "created" timestamptz NOT NULL DEFAULT now(),
  "updated" timestamptz NOT NULL DEFAULT now(),
  "closed_at" timestamptz
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_tickets_recent" ON "cardnest_v1"."support_tickets" ("created" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_tickets_status" ON "cardnest_v1"."support_tickets" ("status","created" DESC);
