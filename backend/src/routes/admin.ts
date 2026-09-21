import { Router, type Request, type Response, type NextFunction } from 'express';
import crypto from 'node:crypto';
import db from '../db';

/**
 * Minimal admin API. Protect with ADMIN_TOKEN (sent as X-Admin-Token header).
 * The bundled /admin UI asks for the token and stores it in localStorage.
 */
const r = Router();

function auth(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.ADMIN_TOKEN || 'mukana-dev-token';
  const got = req.header('x-admin-token');
  if (got !== expected) return res.status(401).json({ error: 'unauthorized' });
  next();
}

r.use(auth);

// GET /api/admin/orders?status=&store=
r.get('/orders', (req, res) => {
  const { status, store } = req.query as { status?: string; store?: string };
  let sql = `
    SELECT o.*, s.name_zh AS store_name, s.name_en AS store_name_en
    FROM orders o JOIN stores s ON s.id = o.store_id WHERE 1=1`;
  const params: Record<string, string> = {};
  if (status) {
    sql += ' AND o.status = @status';
    params.status = status;
  }
  if (store) {
    sql += ' AND o.store_id = @store';
    params.store = store;
  }
  sql += ' ORDER BY o.created_at DESC LIMIT 200';
  const orders = db.prepare(sql).all(params);

  const itemsStmt = db.prepare(
    `SELECT oi.product_id, oi.qty, oi.unit_price_hkd, p.name_zh, p.name_en
     FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?`,
  );
  const withItems = (orders as any[]).map((o) => ({ ...o, items: itemsStmt.all(o.id) }));
  res.json(withItems);
});

// PATCH /api/admin/orders/:id — update status
r.patch('/orders/:id', (req, res) => {
  const allowed = new Set(['pending', 'ready', 'picked_up', 'cancelled']);
  const { status } = req.body as { status?: string };
  if (!status || !allowed.has(status)) return res.status(400).json({ error: 'bad_status' });

  const tx = db.transaction(() => {
    db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, req.params.id);
    // decrement stock when picked up
    if (status === 'picked_up') {
      const items = db.prepare('SELECT product_id, qty FROM order_items WHERE order_id = ?').all(req.params.id) as {
        product_id: string;
        qty: number;
      }[];
      const dec = db.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?');
      for (const it of items) dec.run(it.qty, it.product_id);
    }
  });
  tx();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  res.json(order);
});

// GET /api/admin/stats
r.get('/stats', (_req, res) => {
  const stats = db
    .prepare(
      `SELECT
         COUNT(*) AS total_orders,
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) AS ready,
         SUM(CASE WHEN status = 'picked_up' THEN 1 ELSE 0 END) AS picked_up,
         COALESCE(SUM(CASE WHEN status = 'picked_up' THEN total_hkd ELSE 0 END), 0) AS revenue_hkd
       FROM orders`,
    )
    .get();
  res.json(stats);
});

export default r;
