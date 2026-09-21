import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/pg';

export const dynamic = 'force-dynamic';

function authed(req: NextRequest) {
  const expected = process.env.ADMIN_TOKEN || 'mukana-dev-token';
  return req.headers.get('x-admin-token') === expected;
}

export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    await initDb();
    const status = req.nextUrl.searchParams.get('status');
    const store = req.nextUrl.searchParams.get('store');

    const rows = await sql()`
      SELECT o.*, s.name_zh AS store_name, s.name_en AS store_name_en
      FROM orders o JOIN stores s ON s.id = o.store_id
      ORDER BY o.created_at DESC
      LIMIT 200`;

    let filtered = rows as Record<string, unknown>[];
    if (status) filtered = filtered.filter((o) => o.status === status);
    if (store) filtered = filtered.filter((o) => o.store_id === store);

    const withItems = await Promise.all(
      filtered.map(async (o) => ({
        ...o,
        items: await sql()`SELECT oi.product_id, oi.qty, oi.unit_price_hkd, p.name_zh, p.name_en
                          FROM order_items oi JOIN products p ON p.id = oi.product_id
                          WHERE oi.order_id = ${Number(o.id)}`,
      })),
    );
    return NextResponse.json(withItems);
  } catch (e) {
    return NextResponse.json({ error: 'server_error', detail: String(e) }, { status: 500 });
  }
}
