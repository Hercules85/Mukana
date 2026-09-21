import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

// Runs from the backend directory (npm run dev/seed/start) or anywhere with
// MUKANA_DATA_DIR set. Prefer the directory that contains this module's
// grandparent (src/../data or dist/../data) when determinable.
const DATA_DIR =
  process.env.MUKANA_DATA_DIR ||
  path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'mukana.sqlite'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,              -- e.g. 'notebook'
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  sku TEXT NOT NULL,
  price_hkd INTEGER NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  description_zh TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,              -- 'dpark' | 'apm'
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  address_zh TEXT NOT NULL,
  address_en TEXT NOT NULL,
  phone TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,        -- pickup code e.g. MUK-7H4K
  store_id TEXT NOT NULL REFERENCES stores(id),
  pickup_date TEXT NOT NULL,        -- YYYY-MM-DD
  pickup_window TEXT NOT NULL,      -- morning | afternoon | evening
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_note TEXT DEFAULT '',
  total_hkd INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | ready | picked_up | cancelled
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  qty INTEGER NOT NULL,
  unit_price_hkd INTEGER NOT NULL
);
`);

export default db;
