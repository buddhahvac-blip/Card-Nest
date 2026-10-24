-- Physical Pokémon stock and orders are segregated from digital packs.
-- All products begin unavailable with ZERO approved units, regardless of website copy.
CREATE TABLE IF NOT EXISTS "cardnest_v1"."collector_inventory" (
 "id" text PRIMARY KEY,
 "name" text NOT NULL,
 "unit_price_cents" integer CHECK ("unit_price_cents" IS NULL OR "unit_price_cents">=50),
 "on_hand" integer NOT NULL DEFAULT 0 CHECK ("on_hand">=0),
 "reserved" integer NOT NULL DEFAULT 0 CHECK ("reserved">=0),
 "sellable" boolean NOT NULL DEFAULT false,
 "verified_photos" boolean NOT NULL DEFAULT false,
 "photo_url" text CHECK ("photo_url" IS NULL OR left("photo_url",16)='/collector/real/'),
 "updated" timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT "collector_inventory_reservations_valid" CHECK ("reserved"<="on_hand"),
 CONSTRAINT "collector_items_only_after_review" CHECK (NOT "sellable" OR ("verified_photos" AND "photo_url" IS NOT NULL AND "unit_price_cents" IS NOT NULL))
);
--> statement-breakpoint
INSERT INTO "cardnest_v1"."collector_inventory" ("id","name") VALUES
 ('etb-30th','30th Anniversary Elite Trainer Box'),
 ('etb-prismatic','Prismatic Evolutions Elite Trainer Box'),
 ('etb-rivals','Destined Rivals Elite Trainer Box'),
 ('etb-surging','Surging Sparks Elite Trainer Box')
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cardnest_v1"."collector_orders" (
 "id" text PRIMARY KEY,
 "item_id" text NOT NULL REFERENCES "cardnest_v1"."collector_inventory"("id"),
 "quantity" integer NOT NULL CHECK ("quantity" BETWEEN 1 AND 4),
 "unit_price_cents" integer NOT NULL CHECK ("unit_price_cents">=50),
 "email" text NOT NULL,
 "currency" text NOT NULL DEFAULT 'usd' CHECK ("currency"='usd'),
 "status" text NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending','paid','expired','review_required')),
 "request_key" text UNIQUE NOT NULL,
 "session_id" text UNIQUE,
 "payment_intent" text UNIQUE,
 "paid_total_cents" integer,
 "hold_expires" timestamptz NOT NULL,
 "created" timestamptz NOT NULL DEFAULT now(),
 "paid_at" timestamptz
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collector_orders_recent" ON "cardnest_v1"."collector_orders" ("created" DESC);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cardnest_v1"."collector_stripe_events" (
 "id" text PRIMARY KEY,
 "type" text NOT NULL,
 "created" timestamptz NOT NULL DEFAULT now()
);
