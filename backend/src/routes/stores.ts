import { Router } from 'express';
import db from '../db';

const r = Router();

r.get('/', (_req, res) => {
  const rows = db
    .prepare('SELECT id, name_zh, name_en, address_zh, address_en, phone FROM stores WHERE active = 1')
    .all();
  res.json(rows);
});

export default r;
