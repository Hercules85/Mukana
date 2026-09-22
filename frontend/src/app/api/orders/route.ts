import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb, makeCode } from '@/lib/pg';
import { sendOrderConfirmation } from '@/lib/resend';

export const dynamic = 'force-dynamic';

const WINDOWS = new Set(['morning', 'afternoon', 'evening']);
const STORES = new Set(['dpark', 'apm']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type OrderItemBody = { productId: string; qty: number; unitPrice?: number };

type Body = {
  store?: string;
  pickupDate?: string;
  pickupWindow?: string;
  customer?: { name?: string; phone?: string; email?: string; note?: string };
  items?: OrderItemBody[];
  locale?: string;
};

/** Human pickup-window ranges, mirroring WINDOWS_BY_RANGE on the order page */
function windowRange(store: string, win: string): string {
  const wide = store === 'apm'; // APM opens later, so evening runs to 22:00
  const ranges = wide
    ? { morning: '10:00 – 14:00', afternoon: '14:00 – 18:00', evening: '18:00 – 22:00' }
    : { morning: '10:00 – 13:30', afternoon: '13:30 – 17:00', evening: '17:00 – 20:00' };
  return ranges[win as keyof typeof ranges] ?? win;
}

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const body = (await req.json()) as Body;

    // ---- validation ----
    const errors: string[] = [];
    if (!body?.store || !STORES.has(body.store)) errors.push('store');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body?.pickupDate ?? '')) errors.push('pickupDate');
    if (!body?.pickupWindow || !WINDOWS.has(body.pickupWindow)) errors.push('pickupWindow');
    const c = body?.customer;
    if (!c?.name?.trim()) errors.push('name');
    if (!c?.phone?.trim()) errors.push('phone');
    if (!c?.email || !EMAIL_RE.test(c.email)) errors.push('email');
    if (!Array.isArray(body?.items) || body.items.length === 0) errors.push('items');
    if (errors.length) {
      return NextResponse.json({ error: 'validation', fields: errors }, { status: 400 });
    }

    // ---- compute total server-side (never trust client prices) ----
    const priced: { productId: string; qty: number; unitPrice: number }[] = [];
    let total = 0;
    for (const item of body.items!) {
      const [p] = await sql()`SELECT id, price_hkd, active, stock FROM products WHERE id = ${item.productId}`;
      if (!p || !Number(p.active)) {
        return NextResponse.json({ error: 'unknown_product', productId: item.productId }, { status: 400 });
      }
      const qty = Math.max(1, Math.min(20, Number(item.qty) || 1));
      if (Number(p.stock) < qty) {
        return NextResponse.json(
          { error: 'out_of_stock', productId: item.productId, stock: Number(p.stock) },
          { status: 409 },
        );
      }
      total += Number(p.price_hkd) * qty;
      priced.push({ productId: String(p.id), qty, unitPrice: Number(p.price_hkd) });
    }

    // ---- insert (validation above guarantees these fields exist) ----
    const name = c!.name!.trim();
    const phone = c!.phone!.trim();
    const email = c!.email!.trim();
    const note = (c!.note ?? '').trim();
    const code = makeCode();
    const pin = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const inserted = await sql()`
      INSERT INTO orders (code, store_id, pickup_date, pickup_window,
                          customer_name, customer_phone, customer_email, customer_note, total_hkd, pickup_pin)
      VALUES (${code}, ${body.store!}, ${body.pickupDate!}, ${body.pickupWindow!},
              ${name}, ${phone}, ${email}, ${note}, ${total}, ${pin})
      RETURNING id`;
    const orderId = Number(inserted[0].id);
    for (const it of priced) {
      await sql()`INSERT INTO order_items (order_id, product_id, qty, unit_price_hkd)
                 VALUES (${orderId}, ${it.productId}, ${it.qty}, ${it.unitPrice})`;
    }

    // ---- order confirmation email (best-effort, order already saved) ----
    const locale = body.locale === 'en' ? 'en' : 'zh';
    const [store] = await sql()`
      SELECT id, name_zh, name_en, address_zh, address_en, phone
      FROM stores WHERE id = ${body.store!}`;
    const items = [];
    for (const it of priced) {
      const [p] = await sql()`SELECT name_zh, name_en FROM products WHERE id = ${it.productId}`;
      items.push({ name_zh: String(p?.name_zh ?? it.productId), name_en: String(p?.name_en ?? it.productId), qty: it.qty, unitPrice: it.unitPrice });
    }
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/$/, '');
    void sendOrderConfirmation(email, {
      code,
      pin,
      locale,
      customerName: name,
      store: {
        id: String(store?.id ?? body.store),
        name_zh: String(store?.name_zh ?? ''),
        name_en: String(store?.name_en ?? ''),
        address_zh: String(store?.address_zh ?? ''),
        address_en: String(store?.address_en ?? ''),
        phone: String(store?.phone ?? ''),
      },
      pickupDate: body.pickupDate!,
      pickupWindow: windowRange(body.store!, body.pickupWindow!),
      items,
      total,
      logoUrl: `${siteUrl}/images/brand/icon.jpg`,
      siteUrl,
    });

    return NextResponse.json({ ok: true, code, pin, order: { id: orderId, status: 'pending', total } }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'server_error', detail: String(e) }, { status: 500 });
  }
}
