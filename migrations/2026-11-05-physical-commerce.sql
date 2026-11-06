-- REVIEW-ONLY MIGRATION: do NOT apply to production before staging QA and sign-off.
-- Physical collectibles are intentionally separate from cardnest_v1 digital packs/purchases.
CREATE TABLE IF NOT EXISTS cardnest_v1.physical_products (
  sku text PRIMARY KEY CHECK (length(sku) BETWEEN 3 AND 80),
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 250),
  category text NOT NULL CHECK (category IN ('pokemon','one_piece','other')),
  product_type text NOT NULL CHECK (product_type IN ('sealed','booster','slab','single','other')),
  language text CHECK (language IN ('en','jp','other')),
  condition_note text,
  product_photo_url text,
  listing_verified boolean NOT NULL DEFAULT false,
  unit_price_cents integer CHECK (unit_price_cents >= 0),
  unit_cost_cents integer CHECK (unit_cost_cents >= 0),
  weight_oz numeric(10,2) CHECK (weight_oz > 0),
  low_stock_threshold integer NOT NULL DEFAULT 2 CHECK (low_stock_threshold >= 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','inquiry','active','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS cardnest_v1.physical_stock (
  sku text PRIMARY KEY REFERENCES cardnest_v1.physical_products(sku) ON DELETE RESTRICT,
  on_hand integer NOT NULL DEFAULT 0 CHECK (on_hand >= 0),
  reserved integer NOT NULL DEFAULT 0 CHECK (reserved >= 0),
  version bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT physical_stock_not_oversold CHECK (reserved <= on_hand)
);
CREATE TABLE IF NOT EXISTS cardnest_v1.physical_stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text NOT NULL REFERENCES cardnest_v1.physical_products(sku),
  delta integer NOT NULL CHECK (delta <> 0),
  reason text NOT NULL CHECK (reason IN ('receipt','sale','cancellation','live_sale','return','damage','count_adjustment')),
  actor_id text NOT NULL,
  source text NOT NULL,
  external_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sku, source, external_id)
);
CREATE INDEX IF NOT EXISTS idx_physical_movements_sku_time
ON cardnest_v1.physical_stock_movements(sku,created_at DESC);
CREATE TABLE IF NOT EXISTS cardnest_v1.physical_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text UNIQUE,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','cancelled','refunded')),
  fulfillment_status text NOT NULL DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled','picking','packed','shipped','delivered','cancelled','returned')),
  subtotal_cents integer NOT NULL DEFAULT 0 CHECK (subtotal_cents >= 0),
  shipping_cents integer NOT NULL DEFAULT 0 CHECK (shipping_cents >= 0),
  tax_cents integer NOT NULL DEFAULT 0 CHECK (tax_cents >= 0),
  currency text NOT NULL DEFAULT 'usd' CHECK (currency = 'usd'),
  source text NOT NULL DEFAULT 'website' CHECK (source IN ('website','whatnot','ebay','other')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS cardnest_v1.physical_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES cardnest_v1.physical_orders(id) ON DELETE RESTRICT,
  sku text NOT NULL REFERENCES cardnest_v1.physical_products(sku),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0),
  UNIQUE (order_id,sku)
);
CREATE TABLE IF NOT EXISTS cardnest_v1.physical_webhook_events (
  stripe_event_id text PRIMARY KEY,
  order_id uuid REFERENCES cardnest_v1.physical_orders(id),
  processed_at timestamptz NOT NULL DEFAULT now()
);
-- Reserving stock MUST be performed via an atomic guarded transaction:
-- UPDATE cardnest_v1.physical_stock SET reserved=reserved+$2,version=version+1,
-- updated_at=now() WHERE sku=$1 AND on_hand-reserved >= $2 RETURNING sku;
-- Then insert the physical order and items in the SAME transaction.
-- Do not create buy buttons until the reservation + expiry + webhook settlement
-- lifecycle has been implemented and concurrency-tested.
