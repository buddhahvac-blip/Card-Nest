-- Physical merchandise ledger foundation; intentionally not applied automatically.
-- Separate from digital purchases, entitlements and NestRune pack fulfillment.
CREATE TABLE IF NOT EXISTS cardnest_v1.physical_orders (
 id uuid PRIMARY KEY,
 customer_id text NOT NULL,
 stripe_session_id text UNIQUE,
 stripe_payment_intent_id text UNIQUE,
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','fulfilled','cancelled','refunded','review_required')),
 merchandise_cents integer NOT NULL CHECK (merchandise_cents >= 0),
 shipping_charged_cents integer NOT NULL CHECK (shipping_charged_cents >= 0),
 carrier_cost_cents integer NOT NULL CHECK (carrier_cost_cents >= 0),
 handling_cents integer NOT NULL CHECK (handling_cents >= 0),
 payment_fee_cents integer NOT NULL DEFAULT 0 CHECK (payment_fee_cents >= 0),
 packaging_cost_cents integer NOT NULL DEFAULT 0 CHECK (packaging_cost_cents >= 0),
 currency text NOT NULL DEFAULT 'usd' CHECK (currency = 'usd'),
 fulfillment_method text NOT NULL CHECK (fulfillment_method IN ('pickup','ship')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS cardnest_v1.physical_order_items (
 order_id uuid NOT NULL REFERENCES cardnest_v1.physical_orders(id),
 product_id text NOT NULL,
 quantity integer NOT NULL CHECK (quantity > 0),
 unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0),
 unit_cost_cents integer NOT NULL CHECK (unit_cost_cents >= 0),
 PRIMARY KEY (order_id, product_id)
);
CREATE TABLE IF NOT EXISTS cardnest_v1.physical_stock (
 product_id text PRIMARY KEY,
 initial_quantity integer NOT NULL CHECK (initial_quantity >= 0),
 sold_quantity integer NOT NULL DEFAULT 0 CHECK (sold_quantity >= 0 AND sold_quantity <= initial_quantity),
 reserved_quantity integer NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0 AND reserved_quantity + sold_quantity <= initial_quantity),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS cardnest_v1.physical_payment_events (
 stripe_event_id text PRIMARY KEY,
 stripe_session_id text,
 processed_at timestamptz NOT NULL DEFAULT now()
);
-- Future checkout must reserve stock transactionally before creating a Stripe session.
-- Future signed webhook must process paid sessions idempotently in one DB transaction:
-- insert event id; mark order paid; decrement reserved and increment sold exactly once.
-- Refund/dispute events must flag review and never silently restock merchandise.
