import express from 'express';
import cors from 'cors';
import path from 'node:path';
import productsRouter from './routes/products';
import storesRouter from './routes/stores';
import ordersRouter from './routes/orders';
import adminRouter from './routes/admin';

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

// ---- API ----
app.use('/api/products', productsRouter);
app.use('/api/stores', storesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'mukana-backend' }));

// ---- Admin UI (static) ----
// Run from the backend directory (npm run dev/start); override with MUKANA_ADMIN_DIR.
const adminDir = process.env.MUKANA_ADMIN_DIR || path.join(process.cwd(), 'admin');
app.use('/admin', express.static(adminDir));
app.get('/admin', (_req, res) => res.sendFile(path.join(adminDir, 'index.html')));

app.listen(PORT, () => {
  console.log(`Mukana backend listening on http://localhost:${PORT}`);
});
