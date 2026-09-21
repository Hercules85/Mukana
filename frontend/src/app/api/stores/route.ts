import { NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/pg';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDb();
    const rows = await sql()`SELECT id, name_zh, name_en, address_zh, address_en, phone FROM stores WHERE active = 1`;
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: 'db_error', detail: String(e) }, { status: 500 });
  }
}
