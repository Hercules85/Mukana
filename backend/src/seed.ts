import db from './db';

const products = [
  {
    id: 'notebook',
    name_zh: '筆記簿',
    name_en: 'Notebook',
    sku: 'MUK-NB-01',
    price_hkd: 25,
    stock: 60,
    description_zh:
      '陪伴你的每一個課堂，筆記簿是你的知識庫。它靜靜等待，記錄你得到的知識、夢想及待辦事項。在這本筆記簿中，你不再孤單，它是你最真摯的朋友。',
    description_en:
      'Your companion through every class and every idea. A quiet keeper of knowledge, dreams and to-dos — your most sincere friend.',
  },
  {
    id: 'toteSmall',
    name_zh: '帆布袋（細）',
    name_en: 'Tote bag (S)',
    sku: 'MUK-CT-S',
    price_hkd: 38,
    stock: 40,
    description_zh:
      'Mukana 的帆布袋與你共度每一個奇妙瞬間。輕盈自在，編織著你的生活故事，彰顯你獨特的風格。',
    description_en:
      'Light and unfussy — carries the story of your day, from city strolls to weekend escapes.',
  },
  {
    id: 'toteLarge',
    name_zh: '帆布袋（大）',
    name_en: 'Tote bag (L)',
    sku: 'MUK-CT-L',
    price_hkd: 42,
    stock: 40,
    description_zh: '容量升級，陪你走更遠。同樣輕盈，卻能裝下筆電、書本與所有日常所需。',
    description_en: 'Same lightness, more room — for your laptop, books and everything a day needs.',
  },
  {
    id: 'postcard',
    name_zh: '明信片',
    name_en: 'Postcard',
    sku: 'MUK-PC-01',
    price_hkd: 5,
    stock: 200,
    description_zh: '世界如詩，充滿著溫暖。每刻都值得紀錄、分享。用筆墨描繪生活的美。',
    description_en: 'The world is full of quiet poetry. Record, share, and pass a little warmth on.',
  },
  {
    id: 'keyring1',
    name_zh: '鎖匙扣（一）',
    name_en: 'Keyring 1',
    sku: 'MUK-KR-1',
    price_hkd: 15,
    stock: 80,
    description_zh:
      '隨身的勇氣與提醒。鑰匙圈上的小飾品象徵著希望和夢想，掛在身邊，提醒你珍惜當下、追尋內心的真實。',
    description_en:
      'A pocket-sized source of courage. A small charm that symbolises hope and dream — carry it daily as a quiet reminder to treasure the present.',
  },
  {
    id: 'keyring2',
    name_zh: '鎖匙扣（二）',
    name_en: 'Keyring 2',
    sku: 'MUK-KR-2',
    price_hkd: 15,
    stock: 80,
    description_zh:
      '每一個細節都凝聚著溫暖和回憶。讓它掛在你的鎖匙旁，安靜地陪你出入每個日常，提醒你：你並不孤單。',
    description_en:
      'Every detail carries warmth and memory. Let it jingle softly beside your keys, keeping you company through the everyday — you are not alone.',
  },
 

];

const stores = [
  {
    id: 'dpark',
    name_zh: 'MUKANA · D·PARK 荃灣店',
    name_en: 'MUKANA · D·PARK (Tsuen Wan)',
    address_zh: '新界荃灣青山公路 398 號 D·PARK L3 樓 3030 舖',
    address_en: 'Shop 3030, L3, D·PARK, 398 Castle Peak Rd – Tsuen Wan, N.T., Hong Kong',
    phone: '+852 2984 5739',
  },
  {
    id: 'apm',
    name_zh: 'MUKANA · APM 觀塘店',
    name_en: 'MUKANA · APM (Kwun Tong)',
    address_zh: '九龍觀塘觀塘道 418 號 APM UC 14',
    address_en: 'UC 14, APM, 418 Kwun Tong Rd, Kowloon, Hong Kong',
    phone: '+852 2784 9485',
  },
];

const insertProduct = db.prepare(`
  INSERT OR REPLACE INTO products (id, name_zh, name_en, sku, price_hkd, stock, active, description_zh, description_en)
  VALUES (@id, @name_zh, @name_en, @sku, @price_hkd, @stock, 1, @description_zh, @description_en)
`);
const insertStore = db.prepare(`
  INSERT OR REPLACE INTO stores (id, name_zh, name_en, address_zh, address_en, phone, active)
  VALUES (@id, @name_zh, @name_en, @address_zh, @address_en, @phone, 1)
`);

db.transaction(() => {
  // remove the old single-keychain row (replaced by keyring1 + keyring2)
  // and the removed sticker product
  db.prepare("DELETE FROM products WHERE id = 'keychain'").run();
  db.prepare("DELETE FROM products WHERE id = 'sticker'").run();
  products.forEach((p) => insertProduct.run(p));
  stores.forEach((s) => insertStore.run(s));
})();

console.log(`Seeded ${products.length} products and ${stores.length} stores.`);
