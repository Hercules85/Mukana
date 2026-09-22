/**
 * Renders sample order-confirmation emails so the template can be reviewed
 * in a browser before wiring Resend in.
 *
 *   npx tsx scripts/email-preview.ts
 *   open email-preview/preview-zh.html email-preview/preview-en.html
 */
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOrderConfirmationEmail, type EmailOrderData } from '../src/lib/email';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'email-preview');
mkdirSync(outDir, { recursive: true });
copyFileSync(join(here, '..', 'public', 'images', 'brand', 'icon.jpg'), join(outDir, 'icon.jpg'));

const base: EmailOrderData = {
  code: 'MUK-7KQ2',
  pin: '6284',
  locale: 'zh',
  customerName: 'Wong Wing Yan',
  store: {
    id: 'dpark',
    name_zh: 'MUKANA · D·PARK 店',
    name_en: 'MUKANA · D·PARK',
    address_zh: '新界荃灣青山公路 398 號 D·PARK L3 樓 3030 舖',
    address_en: 'Shop 3030, L3, D·PARK, 398 Castle Peak Rd – Tsuen Wan, N.T., Hong Kong',
    phone: '+852 2984 5739',
  },
  pickupDate: '2025-09-27',
  pickupWindow: '10:00 – 13:30',
  items: [
    { name_zh: '「陪伴」鎖匙扣', name_en: 'Companion Keyring', qty: 1, unitPrice: 89 },
    { name_zh: '「小小的你」咕𠱸', name_en: 'Little You Cushion', qty: 2, unitPrice: 118 },
  ],
  total: 89 + 118 * 2,
  logoUrl: 'icon.jpg', // hug-hands icon, copied next to the previews
  siteUrl: 'https://mukana.example.com', // placeholder so the CTA is visible in previews
};

for (const locale of ['zh', 'en'] as const) {
  const { subject, html } = buildOrderConfirmationEmail({ ...base, locale });
  const file = join(outDir, `preview-${locale}.html`);
  writeFileSync(file, html.replace('<title>', `<!-- subject: ${subject} -->\n<title>`), 'utf8');
  console.log(`wrote ${file}  (subject: ${subject})`);
}
