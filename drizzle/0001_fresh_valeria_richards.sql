ALTER TABLE "cardnest_v1"."cards" ADD COLUMN "definition" jsonb;--> statement-breakpoint
ALTER TABLE "cardnest_v1"."cards" ADD COLUMN "art_status" text DEFAULT 'reserved' NOT NULL;--> statement-breakpoint
ALTER TABLE "cardnest_v1"."cards" ADD COLUMN "release_status" text DEFAULT 'unreleased' NOT NULL;--> statement-breakpoint
ALTER TABLE "cardnest_v1"."cards" ADD COLUMN "is_collectible" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "cardnest_v1"."cards" ADD COLUMN "is_pack_eligible" boolean DEFAULT false NOT NULL;