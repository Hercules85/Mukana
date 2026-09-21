import { Router } from 'express';
import db from '../db';

const r = Router();

// GET /api/products — active products
r.get('/', (_req, res) => {
  const rows = db
    .prepare('SELECT id, name_zh, name_en, sku, price_hkd, stock, active FROM products WHERE active = 1 ORDER BY id')
    .all();
  res.json(rows);
});

// GET /api/products/:id
r.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'not_found' });
  res.json(row);
});

export default r;
