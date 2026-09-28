CREATE SCHEMA "cardnest_v1";
--> statement-breakpoint
CREATE TABLE "cardnest_v1"."art_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"card_id" text,
	"name" text NOT NULL,
	"family" text NOT NULL,
	"brief" text NOT NULL,
	"prompt" text NOT NULL,
	"status" text NOT NULL,
	"model" text,
	"object_key" text,
	"review" text,
	"created" text NOT NULL,
	"updated" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cardnest_v1"."art_objects" (
	"key" text PRIMARY KEY NOT NULL,
	"body" "bytea" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cardnest_v1"."art_usage" (
	"day" text PRIMARY KEY NOT NULL,
	"calls" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cardnest_v1"."card_art" (
	"card_id" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"object_key" text NOT NULL,
	"published" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cardnest_v1"."cards" (
	"id" text PRIMARY KEY NOT NULL,
	"season_id" text NOT NULL,
	"number" integer NOT NULL,
	"name" text NOT NULL,
	"family" text NOT NULL,
	"rarity" text NOT NULL,
	"lore" text NOT NULL,
	"art" text,
	"status" text NOT NULL,
	"legacy_id" text
);
--> statement-breakpoint
CREATE TABLE "cardnest_v1"."copies" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"card" text NOT NULL,
	"opening_id" text NOT NULL,
	"position" integer NOT NULL,
	"created" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cardnest_v1"."customers" (
	"user_id" text PRIMARY KEY NOT NULL,
	"stripe_id" text NOT NULL,
	CONSTRAINT "customers_stripe_id_unique" UNIQUE("stripe_id")
);
--> statement-breakpoint
CREATE TABLE "cardnest_v1"."economics" (
	"user_id" text PRIMARY KEY NOT NULL,
	"scenario" text NOT NULL,
	"updated" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cardnest_v1"."entitlements" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"pack_id" text NOT NULL,
	"purchase_id" text,
	"grant_key" text NOT NULL,
	"status" text DEFAULT 'unopened' NOT NULL,
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "entitlements_purchase_id_unique" UNIQUE("purchase_id"),
	CONSTRAINT "entitlements_grant_key_unique" UNIQUE("grant_key")
);
--> statement-breakpoint
CREATE TABLE "cardnest_v1"."stripe_events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"created" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cardnest_v1"."rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cardnest_v1"."openings" (
	"id" text PRIMARY KEY NOT NULL,
	"entitlement_id" text NOT NULL,
	"user_id" text NOT NULL,
	"pack" text NOT NULL,
	"cards" jsonb NOT NULL,
	"drop_version" text NOT NULL,
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "openings_entitlement_id_unique" UNIQUE("entitlement_id")
);
--> statement-breakpoint
CREATE TABLE "cardnest_v1"."packs" (
	"id" text PRIMARY KEY NOT NULL,
	"season_id" text NOT NULL,
	"name" text NOT NULL,
	"count" integer NOT NULL,
	"drop_version" text NOT NULL,
	"drops" jsonb NOT NULL,
	"price_cents" integer,
	"currency" text DEFAULT 'usd' NOT NULL,
	"stripe_price_id" text,
	"sale_enabled" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cardnest_v1"."profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"interest" text NOT NULL,
	"consent" integer NOT NULL,
	"updated" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cardnest_v1"."purchases" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"pack_id" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text NOT NULL,
	"price_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"session_id" text,
	"payment_intent" text,
	"request_key" text NOT NULL,
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone,
	CONSTRAINT "purchases_session_id_unique" UNIQUE("session_id"),
	CONSTRAINT "purchases_payment_intent_unique" UNIQUE("payment_intent")
);
--> statement-breakpoint
CREATE TABLE "cardnest_v1"."runs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"agent" text NOT NULL,
	"output" text NOT NULL,
	"created" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cardnest_v1"."seasons" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"planned_total" integer NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cardnest_v1"."subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"status" text NOT NULL,
	"updated" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cardnest_v1"."users" (
	"id" text PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cardnest_v1"."cards" ADD CONSTRAINT "cards_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "cardnest_v1"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cardnest_v1"."copies" ADD CONSTRAINT "copies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "cardnest_v1"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cardnest_v1"."copies" ADD CONSTRAINT "copies_card_cards_id_fk" FOREIGN KEY ("card") REFERENCES "cardnest_v1"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cardnest_v1"."copies" ADD CONSTRAINT "copies_opening_id_openings_id_fk" FOREIGN KEY ("opening_id") REFERENCES "cardnest_v1"."openings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cardnest_v1"."customers" ADD CONSTRAINT "customers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "cardnest_v1"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cardnest_v1"."entitlements" ADD CONSTRAINT "entitlements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "cardnest_v1"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cardnest_v1"."entitlements" ADD CONSTRAINT "entitlements_pack_id_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "cardnest_v1"."packs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cardnest_v1"."entitlements" ADD CONSTRAINT "entitlements_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "cardnest_v1"."purchases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cardnest_v1"."openings" ADD CONSTRAINT "openings_entitlement_id_entitlements_id_fk" FOREIGN KEY ("entitlement_id") REFERENCES "cardnest_v1"."entitlements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cardnest_v1"."openings" ADD CONSTRAINT "openings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "cardnest_v1"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cardnest_v1"."openings" ADD CONSTRAINT "openings_pack_packs_id_fk" FOREIGN KEY ("pack") REFERENCES "cardnest_v1"."packs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cardnest_v1"."packs" ADD CONSTRAINT "packs_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "cardnest_v1"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cardnest_v1"."purchases" ADD CONSTRAINT "purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "cardnest_v1"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cardnest_v1"."purchases" ADD CONSTRAINT "purchases_pack_id_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "cardnest_v1"."packs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "card_number_unique" ON "cardnest_v1"."cards" USING btree ("season_id","number");--> statement-breakpoint
CREATE UNIQUE INDEX "one_copy_per_position" ON "cardnest_v1"."copies" USING btree ("opening_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "purchase_request_unique" ON "cardnest_v1"."purchases" USING btree ("user_id","request_key");