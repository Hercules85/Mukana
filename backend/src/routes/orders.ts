import { Router } from 'express';
import crypto from 'node:crypto';
import db from '../db';
import type { OrderPayload } from '../shared/types';

const r = Router();

const WINDOWS = new Set(['morning', 'afternoon', 'evening']);
const STORES = new Set(['dpark', 'apm']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function makeCode() {
  // MUK-XXXX (unambiguous alphabet)
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 4; i++) s += alphabet[crypto.randomInt(alphabet.length)];
  return `MUK-${s}`;
}

// POST /api/orders — create a pickup pre-order
r.post('/', (req, res) => {
  const body = req.body as OrderPayload;

  // ---- validation ----
  const errors: string[] = [];
  if (!STORES.has(body?.store)) errors.push('store');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body?.pickupDate ?? '')) errors.push('pickupDate');
  if (!WINDOWS.has(body?.pickupWindow ?? '')) errors.push('pickupWindow');
  const c = body?.customer;
  if (!c?.name?.trim()) errors.push('name');
  if (!c?.phone?.trim()) errors.push('phone');
  if (!c?.email || !EMAIL_RE.test(c.email)) errors.push('email');
  if (!Array.isArray(body?.items) || body.items.length === 0) errors.push('items');
  if (errors.length) return res.status(400).json({ error: 'validation', fields: errors });

  // ---- compute total server-side (never trust client prices) ----
  type ProductRow = { id: string; price_hkd: number; active: number; stock: number };
  const getProduct = db.prepare<[string], ProductRow>('SELECT id, price_hkd, active, stock FROM products WHERE id = ?');
  let total = 0;
  const priced = [] as { productId: string; qty: number; unitPrice: number }[];
  for (const item of body.items) {
    const p = getProduct.get(item.productId);
    if (!p || !p.active) return res.status(400).json({ error: 'unknown_product', productId: item.productId });
    const qty = Math.max(1, Math.min(20, Number(item.qty) || 1));
    if (p.stock !== null && p.stock < qty) {
      return res.status(409).json({ error: 'out_of_stock', productId: item.productId, stock: p.stock });
    }
    total += p.price_hkd * qty;
    priced.push({ productId: p.id, qty, unitPrice: p.price_hkd });
  }

  // ---- insert ----
  const code = makeCode();
  const insertOrder = db.prepare(`
    INSERT INTO orders (code, store_id, pickup_date, pickup_window,
                        customer_name, customer_phone, customer_email, customer_note, total_hkd)
    VALUES (@code, @store, @pickupDate, @pickupWindow, @name, @phone, @email, @note, @total)
  `);
  const insertItem = db.prepare(
    'INSERT INTO order_items (order_id, product_id, qty, unit_price_hkd) VALUES (?, ?, ?, ?)',
  );

  const tx = db.transaction(() => {
    const info = insertOrder.run({
      code,
      store: body.store,
      pickupDate: body.pickupDate,
      pickupWindow: body.pickupWindow,
      name: c.name.trim(),
      phone: c.phone.trim(),
      email: c.email.trim(),
      note: (c.note ?? '').trim(),
      total,
    });
    for (const it of priced) insertItem.run(info.lastInsertRowid, it.productId, it.qty, it.unitPrice);
    return info.lastInsertRowid;
  });

  const orderId = tx();

  res.status(201).json({
    ok: true,
    code,
    order: { id: orderId, status: 'pending', total },
  });
});

// GET /api/orders/:code — customer checks a pickup code
r.get('/:code', (req, res) => {
  const order = db
    .prepare(
      `SELECT o.id, o.code, o.store_id, o.pickup_date, o.pickup_window, o.status, o.total_hkd, o.created_at,
              s.name_zh AS store_name
       FROM orders o JOIN stores s ON s.id = o.store_id
       WHERE o.code = ?`,
    )
    .get(req.params.code.toUpperCase());
  if (!order) return res.status(404).json({ error: 'not_found' });
  const items = db
    .prepare(
      `SELECT oi.product_id, oi.qty, oi.unit_price_hkd, p.name_zh, p.name_en
       FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?`,
    )
    .all((order as { id: number }).id);
  res.json({ ...order, items });
});

export default r;
