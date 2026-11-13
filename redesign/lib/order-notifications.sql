-- Apply once to the production orders database before deploying notifications.
CREATE TABLE IF NOT EXISTS order_notifications (
  order_id uuid NOT NULL REFERENCES orders(id),
  event text NOT NULL CHECK (event IN ('created', 'paid')),
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  claimed_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  PRIMARY KEY (order_id, event)
);
