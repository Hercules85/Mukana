import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/pg';

export const dynamic = 'force-dynamic';

function authed(req: NextRequest) {
  const expected = process.env.ADMIN_TOKEN || 'mukana-dev-token';
  return req.headers.get('x-admin-token') === expected;
}

// PATCH /api/admin/orders/:id — update status (decrement stock when picked up)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!authed(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const allowed = new Set(['pending', 'ready', 'picked_up', 'cancelled']);
    const { status } = (await req.json()) as { status?: string };
    if (!status || !allowed.has(status)) {
      return NextResponse.json({ error: 'bad_status' }, { status: 400 });
    }
    const id = Number(params.id);
    await initDb();

    await sql()`UPDATE orders SET status = ${status}, updated_at = now() WHERE id = ${id}`;
    if (status === 'picked_up') {
      const items = await sql()`SELECT product_id, qty FROM order_items WHERE order_id = ${id}`;
      for (const it of items) {
        await sql()`UPDATE products SET stock = GREATEST(0, stock - ${Number(it.qty)}) WHERE id = ${String(it.product_id)}`;
      }
    }
    const [order] = await sql()`SELECT * FROM orders WHERE id = ${id}`;
    return NextResponse.json(order);
  } catch (e) {
    return NextResponse.json({ error: 'server_error', detail: String(e) }, { status: 500 });
  }
}
