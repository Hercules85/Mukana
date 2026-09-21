// Seeds products + stores into the Supabase Postgres instance.
// Usage: node scripts/seed.mjs  (reads DATABASE_URL from env or ../.env.local)
import fs from 'node:fs';
import postgres from 'postgres';

// minimal .env loader
let url = process.env.DATABASE_URL;
if (!url) {
  try {
    const env = fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
    url = env.match(/^DATABASE_URL=(.*)$/m)?.[1];
  } catch {}
}
if (!url) throw new Error('DATABASE_URL not set');

const sql = postgres(url, { ssl: 'require', max: 1 });

const products = [
  ['notebook', '筆記簿', 'Notebook', 'MUK-NB-01', 25, 60,
    '陪伴你的每一個課堂，筆記簿是你的知識庫。它靜靜等待，記錄你得到的知識、夢想及待辦事項。在這本筆記簿中，你不再孤單，它是你最真摯的朋友。',
    'Your companion through every class and every idea. A quiet keeper of knowledge, dreams and to-dos — your most sincere friend.'],
  ['toteSmall', '帆布袋（細）', 'Tote bag (S)', 'MUK-CT-S', 38, 40,
    'Mukana 的帆布袋與你共度每一個奇妙瞬間。輕盈自在，編織著你的生活故事，彰顯你獨特的風格。',
    'Light and unfussy — carries the story of your day, from city strolls to weekend escapes.'],
  ['toteLarge', '帆布袋（大）', 'Tote bag (L)', 'MUK-CT-L', 42, 40,
    '容量升級，陪你走更遠。同樣輕盈，卻能裝下筆電、書本與所有日常所需。',
    'Same lightness, more room — for your laptop, books and everything a day needs.'],
  ['postcard', '明信片', 'Postcard', 'MUK-PC-01', 5, 200,
    '世界如詩，充滿著溫暖。每刻都值得紀錄、分享。用筆墨描繪生活的美。',
    'The world is full of quiet poetry. Record, share, and pass a little warmth on.'],
  ['keyring1', '鎖匙扣（一）', 'Keyring 1', 'MUK-KR-1', 15, 80,
    '每一個細節都凝聚著溫暖和回憶，象徵著希望和夢想，提醒著你珍惜當下。把小小的勇氣掛在身邊。',
    'A small charm that symbolises hope and dream — carry a little courage in your pocket.'],
  ['keyring2', '鎖匙扣（二）', 'Keyring 2', 'MUK-KR-2', 15, 80,
    '另一款小小的貼身提醒。當你握著它，它成為你的力量之源。',
    'Another pocket-sized reminder — hold it close and let it nudge you back to what matters.'],
];

const stores = [
  ['dpark', 'MUKANA · D·PARK 荃灣店', 'MUKANA · D·PARK (Tsuen Wan)',
    '新界荃灣青山公路 398 號 D·PARK L3 樓 3030 舖',
    'Shop 3030, L3, D·PARK, 398 Castle Peak Rd – Tsuen Wan, N.T., Hong Kong', '+852 2984 5739'],
  ['apm', 'MUKANA · APM 觀塘店', 'MUKANA · APM (Kwun Tong)',
    '九龍觀塘觀塘道 418 號 APM UC 14',
    'UC 14, APM, 418 Kwun Tong Rd, Kowloon, Hong Kong', '+852 2784 9485'],
];

// schema (same as the app's initDb)
await sql`CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, name_zh TEXT NOT NULL, name_en TEXT NOT NULL, sku TEXT NOT NULL, price_hkd INTEGER NOT NULL, stock INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1, description_zh TEXT NOT NULL DEFAULT '', description_en TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT now())`;
await sql`CREATE TABLE IF NOT EXISTS stores (id TEXT PRIMARY KEY, name_zh TEXT NOT NULL, name_en TEXT NOT NULL, address_zh TEXT NOT NULL, address_en TEXT NOT NULL, phone TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1)`;
await sql`CREATE TABLE IF NOT EXISTS orders (id SERIAL PRIMARY KEY, code TEXT NOT NULL UNIQUE, store_id TEXT NOT NULL REFERENCES stores(id), pickup_date TEXT NOT NULL, pickup_window TEXT NOT NULL, customer_name TEXT NOT NULL, customer_phone TEXT NOT NULL, customer_email TEXT NOT NULL, customer_note TEXT DEFAULT '', total_hkd INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`;
await sql`CREATE TABLE IF NOT EXISTS order_items (id SERIAL PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE, product_id TEXT NOT NULL REFERENCES products(id), qty INTEGER NOT NULL, unit_price_hkd INTEGER NOT NULL)`;

await sql`DELETE FROM products WHERE id = 'keychain'`;
await sql`DELETE FROM products WHERE id = 'sticker'`;
for (const p of products) {
  await sql`INSERT INTO products (id, name_zh, name_en, sku, price_hkd, stock, active, description_zh, description_en)
            VALUES (${p[0]}, ${p[1]}, ${p[2]}, ${p[3]}, ${p[4]}, ${p[5]}, 1, ${p[6]}, ${p[7]})
            ON CONFLICT (id) DO UPDATE SET name_zh = EXCLUDED.name_zh, name_en = EXCLUDED.name_en,
              sku = EXCLUDED.sku, price_hkd = EXCLUDED.price_hkd, stock = EXCLUDED.stock,
              description_zh = EXCLUDED.description_zh, description_en = EXCLUDED.description_en`;
}
for (const s of stores) {
  await sql`INSERT INTO stores (id, name_zh, name_en, address_zh, address_en, phone, active)
            VALUES (${s[0]}, ${s[1]}, ${s[2]}, ${s[3]}, ${s[4]}, ${s[5]}, 1)
            ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, address_zh = EXCLUDED.address_zh, address_en = EXCLUDED.address_en`;
}

const [{ n }] = (await sql`SELECT count(*)::int n FROM products`);
console.log(`Seeded ${n} products + ${stores.length} stores.`);
await sql.end();
