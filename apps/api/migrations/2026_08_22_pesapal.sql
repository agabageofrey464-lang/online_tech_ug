-- Pesapal integration — production Postgres migration.
-- Safe & idempotent. Apply once on the live database.
--
--   psql "$DATABASE_URL" -f app/migrations/2026_08_22_pesapal.sql
--
-- The `payment_transactions` table is also auto-created by the app's startup
-- (SQLAlchemy create_all), but it is included here so the migration is complete
-- and self-contained. create_all does NOT add the new `orders` columns to an
-- existing table — that is what this migration is really for.

BEGIN;

-- New columns on the existing orders table.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency VARCHAR(8) NOT NULL DEFAULT 'UGX';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pesapal_tracking_id VARCHAR(80) NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pesapal_merchant_reference VARCHAR(40) NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS ix_orders_pesapal_tracking_id ON orders (pesapal_tracking_id);

-- Audit trail of Pesapal transactions (idempotent on tracking_id).
CREATE TABLE IF NOT EXISTS payment_transactions (
    id                  SERIAL PRIMARY KEY,
    order_id            INTEGER NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    merchant_reference  VARCHAR(40) NOT NULL DEFAULT '',
    tracking_id         VARCHAR(80) NOT NULL UNIQUE,
    amount              NUMERIC(12, 0) NOT NULL DEFAULT 0,
    currency            VARCHAR(8) NOT NULL DEFAULT 'UGX',
    payment_method      VARCHAR(60) NOT NULL DEFAULT '',
    payment_status      VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    pesapal_response    TEXT NOT NULL DEFAULT '',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_payment_transactions_order_id ON payment_transactions (order_id);
CREATE INDEX IF NOT EXISTS ix_payment_transactions_merchant_reference ON payment_transactions (merchant_reference);

COMMIT;
