import postgres from 'postgres';

/**
 * Postgres (Supabase) data layer for the deployed app.
 * Locally and on Vercel we read DATABASE_URL; the schema is created lazily
 * on first request so a fresh Supabase project needs no manual migration.
 */
const CONNECTION = process.env.DATABASE_URL || '';

let sqlInstance: postgres.Sql | null = null;

export function sql(): postgres.Sql {
  if (!sqlInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    sqlInstance = postgres(process.env.DATABASE_URL, {
      ssl: 'require',
      // serverless-friendly: reuse cached connections, cap pool size
      max: 5,
      idle_timeout: 20,
    });
  }
  return sqlInstance;
}

let ready: Promise<void> | null = null;

/** Create the schema if it doesn't exist yet (runs once per process). */
export function initDb(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const db = sql();
      await db`CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name_zh TEXT NOT NULL,
        name_en TEXT NOT NULL,
        sku TEXT NOT NULL,
        price_hkd INTEGER NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1,
        description_zh TEXT NOT NULL DEFAULT '',
        description_en TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;
      await db`CREATE TABLE IF NOT EXISTS stores (
        id TEXT PRIMARY KEY,
        name_zh TEXT NOT NULL,
        name_en TEXT NOT NULL,
        address_zh TEXT NOT NULL,
        address_en TEXT NOT NULL,
        phone TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1
      )`;
      await db`CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        store_id TEXT NOT NULL REFERENCES stores(id),
        pickup_date TEXT NOT NULL,
        pickup_window TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_note TEXT DEFAULT '',
        total_hkd INTEGER NOT NULL,
        pickup_pin TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;
      await db`CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL REFERENCES products(id),
        qty INTEGER NOT NULL,
        unit_price_hkd INTEGER NOT NULL
      )`;
      // migration for databases created before pickup_pin existed
      await db`ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_pin TEXT NOT NULL DEFAULT ''`;
    })();
  }
  return ready;
}

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Pickup code in the same format the Express backend used: MUK-XXXX */
export function makeCode() {
  let s = '';
  for (let i = 0; i < 4; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `MUK-${s}`;
}
