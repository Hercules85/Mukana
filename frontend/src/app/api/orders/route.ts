import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb, makeCode } from '@/lib/pg';

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
};

export async function POST(req: NextRequest) {
  try {
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
    const inserted = await sql()`
      INSERT INTO orders (code, store_id, pickup_date, pickup_window,
                          customer_name, customer_phone, customer_email, customer_note, total_hkd)
      VALUES (${code}, ${body.store!}, ${body.pickupDate!}, ${body.pickupWindow!},
              ${name}, ${phone}, ${email}, ${note}, ${total})
      RETURNING id`;
    const orderId = Number(inserted[0].id);
    for (const it of priced) {
      await sql()`INSERT INTO order_items (order_id, product_id, qty, unit_price_hkd)
                 VALUES (${orderId}, ${it.productId}, ${it.qty}, ${it.unitPrice})`;
    }

    return NextResponse.json({ ok: true, code, order: { id: orderId, status: 'pending', total } }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'server_error', detail: String(e) }, { status: 500 });
  }
}
