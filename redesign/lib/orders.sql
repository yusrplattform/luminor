-- Apply to the selected PostgreSQL database before enabling checkout.
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  shipping_address text NOT NULL,
  country text NOT NULL,
  items jsonb NOT NULL,
  subtotal_baisa integer NOT NULL CHECK (subtotal_baisa >= 0),
  shipping_baisa integer NOT NULL CHECK (shipping_baisa >= 0),
  total_baisa integer NOT NULL CHECK (total_baisa = subtotal_baisa + shipping_baisa),
  currency text NOT NULL DEFAULT 'OMR' CHECK (currency = 'OMR'),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','processing','paid','failed','unconfirmed')),
  transaction_id text UNIQUE,
  updated_at timestamptz NOT NULL DEFAULT now()
);
