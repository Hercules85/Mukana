/**
 * Bilingual order-confirmation email for MUKANA in-store pickup pre-orders.
 *
 * Design mirrors the website (frontend/src/app/globals.css):
 *   - paper `#fbf7f1` page with a white rounded "card" (`.card` ring/border)
 *   - serif display headings (`.h-display` → Georgia fallback, tight tracking)
 *   - uppercase letter-spaced labels (`.label`) and warm chip pills (`.chip`)
 *   - coral pill CTA (`.btn-primary`)
 *
 * buildOrderConfirmationEmail() returns { subject, html, text } in the
 * customer's order language ('zh' Traditional Chinese | 'en' English).
 * Plain-table, inline-styled only — safe for Gmail, Outlook, Apple Mail.
 */

export type EmailOrderData = {
  code: string; // order number, e.g. MUK-7KQ2
  pin: string; // 4-digit pickup PIN, e.g. "6284"
  locale: 'zh' | 'en';
  customerName: string;
  store: {
    id: string;
    name_zh: string;
    name_en: string;
    address_zh: string;
    address_en: string;
    phone: string;
  };
  pickupDate: string; // YYYY-MM-DD
  pickupWindow: string; // e.g. "10:00 – 13:30"
  items: { name_zh: string; name_en: string; qty: number; unitPrice: number }[];
  total: number; // HKD
  logoUrl?: string; // absolute or preview-relative URL of the hug-hands icon
  siteUrl?: string; // e.g. "https://mukana.example.com" — enables the CTA button
};

type Copy = {
  slogan: string;
  heading: string;
  greeting: (name: string) => string;
  intro: string;
  orderLabel: string;
  pinLabel: string;
  pickupSection: string;
  timeSection: string;
  itemsSection: string;
  tableItem: string;
  tableQty: string;
  tablePrice: string;
  totalRow: string;
  atStore: string;
  showCode: string;
  payInStore: string;
  cta: string;
  footerContact: string;
  footerAuto: string;
  subject: (code: string) => string;
};

const COPY: Record<'zh' | 'en', Copy> = {
  zh: {
    slogan: '你並不孤單',
    heading: '謝謝你的預訂！',
    greeting: (n) => `${n}，你好：`,
    intro: '我們已收到你的門市自取預訂，商品會為你保留。以下是你的訂單資料：',
    orderLabel: '訂單編號',
    pinLabel: '取貨 PIN',
    pickupSection: '取貨地點',
    timeSection: '取貨時間',
    itemsSection: '預訂商品',
    tableItem: '商品',
    tableQty: '數量',
    tablePrice: '價格',
    totalRow: '合計',
    atStore: '（門市付款）',
    showCode: '取貨當日請向店員出示此電郵或取貨 PIN。',
    payInStore: '款項將於門市取貨時收取，本店只提供門市自取，不作郵寄或送貨。',
    cta: '查看訂單',
    footerContact: '如需更改或取消預訂，請致電門市與我們聯絡。',
    footerAuto: '此電郵由系統自動發出，請勿直接回覆。',
    subject: (c) => `MUKANA 預訂確認 · ${c}`,
  },
  en: {
    slogan: 'You are not alone',
    heading: 'Thanks for your order!',
    greeting: (n) => `Hi ${n},`,
    intro: 'We have received your in-store pickup order — your items are reserved. Here are your order details:',
    orderLabel: 'Order number',
    pinLabel: 'Pickup PIN',
    pickupSection: 'Pickup location',
    timeSection: 'Pickup time',
    itemsSection: 'Your items',
    tableItem: 'Item',
    tableQty: 'Qty',
    tablePrice: 'Price',
    totalRow: 'Total',
    atStore: '(pay in store)',
    showCode: 'Please show this email or your pickup PIN to our staff when you collect.',
    payInStore: 'Payment is collected in store at pickup. We offer in-store pickup only — no shipping or delivery.',
    cta: 'View your order',
    footerContact: 'To change or cancel your order, please call the store.',
    footerAuto: 'This is an automated message — please do not reply.',
    subject: (c) => `MUKANA order confirmation · ${c}`,
  },
};

// ---- palette (mirrors tailwind.config.ts mukana tokens) ----
const INK = '#1a1a1a';
const PAPER = '#fbf7f1';
const WARM = '#f6ece1';
const LINE = '#e8dfd1';
const CORAL = '#e85a4f';
const CORAL_HOVER = '#d44a40';
const MUTED = 'rgba(26,26,26,0.55)';
const SOFT = 'rgba(26,26,26,0.7)';

const SERIF = "Georgia,'Noto Serif TC','PingFang HK','Times New Roman',serif";
const SANS = "-apple-system,'Helvetica Neue','PingFang HK','Noto Sans HK',Arial,sans-serif";

const WEEKDAY_ZH = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** 2025-09-24 → 「2025年9月24日（星期三）」| "Wed, 24 Sep 2025" */
function formatDate(iso: string, locale: 'zh' | 'en'): string {
  const [y, m, d] = iso.split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  if (locale === 'zh') return `${y}年${m}月${d}日（星期${WEEKDAY_ZH[wd]}）`;
  return `${DAYS_EN[wd]}, ${d} ${MONTHS_EN[m - 1]} ${y}`;
}

const money = (n: number) => `HK$ ${n}`;

/** `.chip` equivalent: warm pill with a hairline ring, used for section labels */
function chip(text: string): string {
  return `<span style="display:inline-block;padding:6px 14px;border-radius:999px;background-color:${WARM};border:1px solid ${LINE};font-family:${SANS};font-size:11px;letter-spacing:0.14em;color:${SOFT};text-transform:uppercase;">${text}</span>`;
}

export function buildOrderConfirmationEmail(d: EmailOrderData): {
  subject: string;
  html: string;
  text: string;
} {
  const c = COPY[d.locale];
  const zh = d.locale === 'zh';
  const storeName = zh ? d.store.name_zh : d.store.name_en;
  const storeAddress = zh ? d.store.address_zh : d.store.address_en;
  const pinSpaced = d.pin.split('').join(' ');

  const logo = d.logoUrl
    ? `<img src="${d.logoUrl}" alt="MUKANA" width="72" height="72" style="display:block;margin:0 auto;border-radius:50%;width:72px;height:72px;border:1px solid ${LINE};"/>`
    : '';
  const wordmark = `<div style="font-family:${SERIF};font-size:24px;letter-spacing:0.02em;color:${INK};margin-top:${d.logoUrl ? '14px' : '0'};">MUKANA</div>`;
  const slogan = `<div style="font-family:${SANS};font-size:12px;letter-spacing:0.08em;color:${MUTED};margin-top:6px;">${c.slogan}</div>`;

  const rows = d.items
    .map(
      (it) => /* html */ `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid ${LINE};font-family:${SANS};font-size:15px;color:${INK};">${zh ? it.name_zh : it.name_en}</td>
        <td style="padding:12px 0;border-bottom:1px solid ${LINE};font-family:${SANS};font-size:15px;color:${SOFT};text-align:center;">×${it.qty}</td>
        <td style="padding:12px 0;border-bottom:1px solid ${LINE};font-family:${SANS};font-size:15px;color:${INK};text-align:right;">HK$ ${it.unitPrice * it.qty}</td>
      </tr>`,
    )
    .join('');

  const cta = d.siteUrl
    ? /* html */ `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;">
        <tr><td align="center" bgcolor="${CORAL}" style="border-radius:999px;">
          <a href="${d.siteUrl}/order/success?code=${encodeURIComponent(d.code)}"
             style="display:inline-block;padding:12px 28px;border-radius:999px;background-color:${CORAL};color:#ffffff;font-family:${SANS};font-size:14px;font-weight:600;text-decoration:none;">
            ${c.cta} →
          </a>
        </td></tr>
      </table>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="${zh ? 'zh-Hant' : 'en'}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${c.subject(d.code)}</title></head>
<body style="margin:0;padding:0;background-color:${PAPER};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${PAPER};">
  <tr><td align="center" style="padding:32px 16px;">
    <!-- white card on paper, like the site's .card -->
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background-color:#ffffff;border:1px solid rgba(26,26,26,0.10);border-radius:20px;overflow:hidden;">
      <!-- header: hug-hands icon + wordmark on paper band -->
      <tr><td align="center" bgcolor="${PAPER}" style="padding:36px 24px 30px;border-bottom:1px solid ${LINE};">
        ${logo}
        ${wordmark}
        ${slogan}
      </td></tr>
      <tr><td style="padding:36px 40px 0;">
        <div style="font-family:${SERIF};font-size:26px;letter-spacing:-0.01em;color:${INK};">${c.heading}</div>
        <div style="font-family:${SANS};font-size:15px;line-height:1.75;color:${SOFT};margin-top:14px;">
          ${c.greeting(d.customerName)}<br/>${c.intro}
        </div>
      </td></tr>
      <!-- order number + pin, inset like a warm panel -->
      <tr><td style="padding:20px 40px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${WARM};border:1px solid ${LINE};border-radius:16px;">
          <tr><td style="padding:20px 24px 18px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:top;">
                  <div style="font-family:${SANS};font-size:11px;letter-spacing:0.18em;color:${MUTED};text-transform:uppercase;">${c.orderLabel}</div>
                  <div style="font-family:${SERIF};font-size:24px;letter-spacing:0.12em;color:${INK};margin-top:6px;">${d.code}</div>
                </td>
                <td style="vertical-align:top;text-align:right;">
                  <div style="font-family:${SANS};font-size:11px;letter-spacing:0.18em;color:${MUTED};text-transform:uppercase;">${c.pinLabel}</div>
                  <div style="font-family:${SERIF};font-size:34px;letter-spacing:0.5em;color:${CORAL};margin-top:2px;">${pinSpaced}</div>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>
      <!-- pickup location -->
      <tr><td style="padding:32px 40px 0;">
        ${chip(c.pickupSection)}
        <div style="font-family:${SANS};font-size:16px;font-weight:600;color:${INK};margin-top:12px;">${storeName}</div>
        <div style="font-family:${SANS};font-size:14px;line-height:1.65;color:${MUTED};margin-top:4px;">${storeAddress}<br/>Tel&nbsp;${d.store.phone}</div>
      </td></tr>
      <!-- pickup time -->
      <tr><td style="padding:24px 40px 0;">
        ${chip(c.timeSection)}
        <div style="font-family:${SANS};font-size:15px;color:${INK};margin-top:12px;">${formatDate(d.pickupDate, d.locale)} &nbsp;·&nbsp; ${d.pickupWindow}</div>
      </td></tr>
      <!-- items -->
      <tr><td style="padding:24px 40px 0;">
        ${chip(c.itemsSection)}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
          <tr>
            <th align="left" style="padding:8px 0;border-bottom:2px solid ${INK};font-family:${SANS};font-size:11px;letter-spacing:0.18em;color:${MUTED};font-weight:normal;text-transform:uppercase;">${c.tableItem}</th>
            <th align="center" style="padding:8px 0;border-bottom:2px solid ${INK};font-family:${SANS};font-size:11px;letter-spacing:0.18em;color:${MUTED};font-weight:normal;text-transform:uppercase;width:70px;">${c.tableQty}</th>
            <th align="right" style="padding:8px 0;border-bottom:2px solid ${INK};font-family:${SANS};font-size:11px;letter-spacing:0.18em;color:${MUTED};font-weight:normal;text-transform:uppercase;width:110px;">${c.tablePrice}</th>
          </tr>
          ${rows}
          <tr>
            <td colspan="2" style="padding:14px 0 4px;text-align:right;font-family:${SANS};font-size:15px;color:${INK};">${c.totalRow} ${c.atStore}</td>
            <td style="padding:14px 0 4px;text-align:right;font-family:${SERIF};font-size:20px;color:${CORAL};">HK$ ${d.total}</td>
          </tr>
        </table>
        ${cta}
      </td></tr>
      <!-- notes -->
      <tr><td style="padding:28px 40px 36px;">
        <div style="font-family:${SANS};font-size:13px;line-height:1.75;color:${MUTED};border-top:1px solid ${LINE};padding-top:18px;">
          ${c.showCode}<br/>${c.payInStore}
        </div>
      </td></tr>
      <!-- footer -->
      <tr><td bgcolor="${PAPER}" style="border-top:1px solid ${LINE};padding:22px 40px;">
        <div style="font-family:${SANS};font-size:12px;line-height:1.75;color:${MUTED};">
          ${c.footerContact}<br/>${c.footerAuto}
        </div>
      </td></tr>
    </table>
    <!-- hidden preheader -->
    <div style="display:none;max-height:0;overflow:hidden;">${c.heading} ${c.orderLabel} ${d.code}</div>
  </td></tr>
</table>
</body></html>`;

  const text = [
    'MUKANA — ' + c.slogan,
    '',
    c.heading,
    c.greeting(d.customerName),
    c.intro,
    '',
    `${c.orderLabel}: ${d.code}`,
    `${c.pinLabel}: ${d.pin.split('').join(' ')}`,
    '',
    `${c.pickupSection}: ${storeName}`,
    storeAddress,
    `Tel ${d.store.phone}`,
    '',
    `${c.timeSection}: ${formatDate(d.pickupDate, d.locale)} · ${d.pickupWindow}`,
    '',
    `${c.itemsSection}:`,
    ...d.items.map((it) => `  - ${zh ? it.name_zh : it.name_en} ×${it.qty}  HK$ ${it.unitPrice * it.qty}`),
    `${c.totalRow} ${c.atStore}: HK$ ${d.total}`,
    '',
    c.showCode,
    c.payInStore,
    ...(d.siteUrl ? [`${c.cta}: ${d.siteUrl}/order/success?code=${d.code}`] : []),
    '',
    c.footerContact,
    c.footerAuto,
  ].join('\n');

  return { subject: c.subject(d.code), html, text };
}
