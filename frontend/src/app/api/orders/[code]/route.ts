import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/pg';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  try {
    await initDb();
    const code = params.code.toUpperCase();
    const [order] = await sql()`
      SELECT o.id, o.code, o.store_id, o.pickup_date, o.pickup_window, o.status, o.total_hkd, o.created_at,
             s.name_zh AS store_name
      FROM orders o JOIN stores s ON s.id = o.store_id
      WHERE o.code = ${code}`;
    if (!order) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    const items = await sql()`
      SELECT oi.product_id, oi.qty, oi.unit_price_hkd, p.name_zh, p.name_en
      FROM order_items oi JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ${Number(order.id)}`;
    return NextResponse.json({ ...order, items });
  } catch (e) {
    return NextResponse.json({ error: 'server_error', detail: String(e) }, { status: 500 });
  }
}
