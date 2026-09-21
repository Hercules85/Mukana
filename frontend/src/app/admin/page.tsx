'use client';
import { useCallback, useEffect, useState } from 'react';

/* Admin panel for Mukana pre-orders.
   Sign in with the ADMIN_TOKEN (default: mukana-dev-token). */

type OrderItem = { product_id: string; qty: number; unit_price_hkd: number; name_zh?: string; name_en?: string };
type Order = {
  id: number;
  code: string;
  store_id: string;
  pickup_date: string;
  pickup_window: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_note: string | null;
  total_hkd: number;
  status: 'pending' | 'ready' | 'picked_up' | 'cancelled';
  created_at: string;
  items: OrderItem[];
};
type Stats = {
  total_orders: number;
  pending: number;
  ready: number;
  picked_up: number;
  revenue_hkd: number;
};

const STATUS_LABEL: Record<Order['status'], string> = {
  pending: '待取貨',
  ready: '已備好',
  picked_up: '已取貨',
  cancelled: '已取消',
};

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  const headers = useCallback((): HeadersInit => ({ 'x-admin-token': token, 'content-type': 'application/json' }), [token]);

  const load = useCallback(async () => {
    setError(null);
    const qs = new URLSearchParams();
    if (statusFilter) qs.set('status', statusFilter);
    if (storeFilter) qs.set('store', storeFilter);
    const [oRes, sRes] = await Promise.all([
      fetch(`/api/admin/orders?${qs}`, { headers: headers() }),
      fetch('/api/admin/stats', { headers: headers() }),
    ]);
    if (!oRes.ok) {
      setError('載入失敗 — 請檢查 Admin Token');
      return;
    }
    setOrders(await oRes.json());
    setStats(await sRes.json());
  }, [headers, statusFilter, storeFilter]);

  const unlock = useCallback(() => {
    localStorage.setItem('mukana.admin.token', token.trim());
    load();
  }, [token, load]);

  useEffect(() => {
    const saved = localStorage.getItem('mukana.admin.token');
    if (saved) {
      setToken(saved);
      setUnlocked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (unlocked && token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, statusFilter, storeFilter]);

  async function setStatus(id: number, status: Order['status']) {
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ status }),
    });
    load();
  }

  if (!unlocked) {
    return (
      <div className="section py-24">
        <div className="card mx-auto max-w-sm p-8 text-center">
          <h1 className="font-display text-2xl">MUKANA · Admin</h1>
          <p className="mt-2 text-sm text-mukana-ink/60">請輸入 Admin Token</p>
          <input
            type="password"
            className="field mt-4 text-center"
            placeholder="Admin token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && unlock()}
          />
          <button className="btn-primary mt-4 w-full" onClick={unlock}>
            登入
          </button>
          {error && <p className="mt-3 text-sm text-mukana-coral">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="section py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl">MUKANA · Admin</h1>
        <div className="flex gap-2">
          <select className="field !w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">全部狀態</option>
            <option value="pending">待取貨</option>
            <option value="ready">已備好</option>
            <option value="picked_up">已取貨</option>
            <option value="cancelled">已取消</option>
          </select>
          <select className="field !w-auto" value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)}>
            <option value="">所有門市</option>
            <option value="dpark">D·PARK</option>
            <option value="apm">APM</option>
          </select>
          <button className="btn-secondary" onClick={load}>
            重新整理
          </button>
        </div>
      </div>

      {stats && (
        <div className="mt-6 grid gap-3 sm:grid-cols-5">
          {[
            ['總訂單', stats.total_orders],
            ['待取貨', stats.pending],
            ['已備好', stats.ready],
            ['已取貨', stats.picked_up],
            ['已收款 HK$', stats.revenue_hkd],
          ].map(([label, v]) => (
            <div key={String(label)} className="card p-4">
              <b className="font-display text-2xl">{v ?? 0}</b>
              <p className="mt-0.5 text-xs text-mukana-ink/60">{label}</p>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-4 rounded-lg bg-mukana-coral/10 px-3 py-2 text-sm text-mukana-coral">{error}</p>}

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-mukana-line bg-mukana-warm/60 text-left text-xs uppercase tracking-wider text-mukana-ink/60">
              <th className="px-4 py-3">取貨編號</th>
              <th className="px-4 py-3">門市</th>
              <th className="px-4 py-3">取貨時間</th>
              <th className="px-4 py-3">顧客</th>
              <th className="px-4 py-3">商品</th>
              <th className="px-4 py-3">金額</th>
              <th className="px-4 py-3">狀態</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-mukana-line/70 align-top">
                <td className="px-4 py-3">
                  <span className="font-semibold text-mukana-coral">{o.code}</span>
                  <p className="mt-0.5 text-xs text-mukana-ink/50">{String(o.created_at).slice(0, 16).replace('T', ' ')}</p>
                </td>
                <td className="px-4 py-3">{o.store_id === 'dpark' ? 'D·PARK' : 'APM'}</td>
                <td className="px-4 py-3">
                  {o.pickup_date}
                  <p className="text-xs text-mukana-ink/50">{o.pickup_window}</p>
                </td>
                <td className="px-4 py-3">
                  {o.customer_name}
                  <p className="text-xs text-mukana-ink/50">{o.customer_phone}</p>
                  <p className="text-xs text-mukana-ink/50">{o.customer_email}</p>
                  {o.customer_note && <p className="mt-0.5 text-xs">{o.customer_note}</p>}
                </td>
                <td className="px-4 py-3">
                  <ul className="list-disc pl-4">
                    {o.items.map((i, j) => (
                      <li key={j}>
                        {i.name_zh || i.name_en} × {i.qty}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-3 tabular-nums">HK${o.total_hkd}</td>
                <td className="px-4 py-3">
                  <span className="chip">{STATUS_LABEL[o.status]}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {o.status === 'pending' && (
                      <button className="btn-secondary px-3 py-1 text-xs" onClick={() => setStatus(o.id, 'ready')}>
                        備好貨
                      </button>
                    )}
                    {o.status === 'ready' && (
                      <button className="btn-primary px-3 py-1 text-xs" onClick={() => setStatus(o.id, 'picked_up')}>
                        已取貨
                      </button>
                    )}
                    {o.status !== 'cancelled' && o.status !== 'picked_up' && (
                      <button
                        className="btn-ghost border border-mukana-line px-3 py-1 text-xs"
                        onClick={() => setStatus(o.id, 'cancelled')}
                      >
                        取消
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-mukana-ink/50">
                  暫無訂單
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
