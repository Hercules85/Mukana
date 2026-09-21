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
    const [stats] = await sql()`
      SELECT
        COUNT(*)::int AS total_orders,
        COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
        COUNT(*) FILTER (WHERE status = 'ready')::int AS ready,
        COUNT(*) FILTER (WHERE status = 'picked_up')::int AS picked_up,
        COALESCE(SUM(CASE WHEN status = 'picked_up' THEN total_hkd ELSE 0 END), 0)::int AS revenue_hkd
      FROM orders`;
    return NextResponse.json(stats);
  } catch (e) {
    return NextResponse.json({ error: 'server_error', detail: String(e) }, { status: 500 });
  }
}
