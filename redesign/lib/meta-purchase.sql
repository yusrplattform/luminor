-- Apply to the same PostgreSQL database as orders before enabling Purchase tracking.
CREATE TABLE IF NOT EXISTS meta_purchase_claims (
  order_id uuid PRIMARY KEY REFERENCES orders(id),
  claimed_at timestamptz NOT NULL DEFAULT now()
);
