CREATE TABLE IF NOT EXISTS "cardnest_v1"."rune_dungeon_progress" (
  "user_id" text PRIMARY KEY REFERENCES "cardnest_v1"."users"("id") ON DELETE CASCADE,
  "highest_cleared" integer NOT NULL DEFAULT 0 CHECK ("highest_cleared" BETWEEN 0 AND 10),
  "rune_energy" integer NOT NULL DEFAULT 0 CHECK ("rune_energy" >= 0),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cardnest_v1"."rune_dungeon_clears" (
  "user_id" text NOT NULL REFERENCES "cardnest_v1"."users"("id") ON DELETE CASCADE,
  "floor" integer NOT NULL CHECK ("floor" BETWEEN 1 AND 10),
  "energy_awarded" integer NOT NULL CHECK ("energy_awarded" >= 0),
  "cleared_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("user_id","floor")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cardnest_v1"."rune_dungeon_claims" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "cardnest_v1"."users"("id") ON DELETE CASCADE,
  "pack_id" text NOT NULL REFERENCES "cardnest_v1"."packs"("id"),
  "energy_cost" integer NOT NULL CHECK ("energy_cost" > 0),
  "entitlement_id" text NOT NULL UNIQUE REFERENCES "cardnest_v1"."entitlements"("id"),
  "created_at" timestamptz NOT NULL DEFAULT now()
);
