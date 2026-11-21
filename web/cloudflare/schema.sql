-- Dapur Ummi Kyana — Cloudflare D1 (SQLite). DEMO-ONLY.
-- New database: create with Cloudflare D1, then execute this schema.
-- This file contains no secrets; passwords must be hashed by the Worker API.
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL, name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS auth_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attempts_email ON auth_attempts(email,at);
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '', category TEXT NOT NULL DEFAULT 'Nasi Box',
  price_idr INTEGER NOT NULL CHECK(price_idr>0),
  active INTEGER NOT NULL DEFAULT 1, featured INTEGER NOT NULL DEFAULT 0,
  image_url TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
  client_request_id TEXT NOT NULL, customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL, fulfillment TEXT NOT NULL CHECK(fulfillment IN ('pickup','delivery')),
  delivery_address TEXT, notes TEXT NOT NULL DEFAULT '', scheduled_for TEXT NOT NULL,
  subtotal_idr INTEGER NOT NULL, delivery_fee_idr INTEGER NOT NULL DEFAULT 0,
  total_idr INTEGER NOT NULL, payment_method TEXT NOT NULL DEFAULT 'demo',
  payment_status TEXT NOT NULL DEFAULT 'awaiting_confirmation',
  status TEXT NOT NULL DEFAULT 'pending', paid_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id,client_request_id)
);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(user_id,created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status,payment_status);
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id), product_name TEXT NOT NULL,
  unit_price_idr INTEGER NOT NULL, quantity INTEGER NOT NULL CHECK(quantity>0),
  line_total_idr INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE TABLE IF NOT EXISTS payment_events (
  id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  actor_user_id TEXT REFERENCES users(id), type TEXT NOT NULL,
  previous_status TEXT, next_status TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS catering_requests (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
  service_slug TEXT NOT NULL, package_name TEXT NOT NULL,
  quantity INTEGER NOT NULL, scheduled_for TEXT NOT NULL,
  phone TEXT NOT NULL, address TEXT NOT NULL, notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'requested',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_catering_user ON catering_requests(user_id,created_at);
