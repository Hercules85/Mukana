'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useT, interpolate } from '@/i18n';
import { useCart } from '@/lib/cart';
import { PRODUCTS, getProduct, type ProductId } from '@/lib/products';
import { apiPost } from '@/lib/api';
import type { OrderResponse } from '@/lib/types';

type Store = 'dpark' | 'apm';
type Window = 'morning' | 'afternoon' | 'evening';

/** Opening hours per store per weekday (0=Sun … 6=Sat). null = closed. */
const STORE_HOURS: Record<Store, (day: number) => { open: string; close: string } | null> = {
  // D·PARK: Mon–Wed closed, Thu–Sun 10:00–20:00
  dpark: (day) => ([1, 2, 3].includes(day) ? null : { open: '10:00', close: '20:00' }),
  // APM: Mon–Fri 10:00–20:00, Sat–Sun 10:00–22:00
  apm: (day) => (day === 0 || day === 6 ? { open: '10:00', close: '22:00' } : { open: '10:00', close: '20:00' }),
};

/** Nice, human pickup windows for a day's open/close pair. */
const WINDOWS_BY_RANGE: Record<string, { id: Window; start: string; end: string }[]> = {
  '10:00-20:00': [
    { id: 'morning', start: '10:00', end: '13:30' },
    { id: 'afternoon', start: '13:30', end: '17:00' },
    { id: 'evening', start: '17:00', end: '20:00' },
  ],
  '10:00-22:00': [
    { id: 'morning', start: '10:00', end: '14:00' },
    { id: 'afternoon', start: '14:00', end: '18:00' },
    { id: 'evening', start: '18:00', end: '22:00' },
  ],
};

function nextDates(n: number): Date[] {
  const out: Date[] = [];
  const d = new Date();
  d.setDate(d.getDate() + 1); // start tomorrow
  for (let i = 0; i < n; i++) {
    out.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export default function OrderPage() {
  const { t } = useT();
  const { lines, setQty, remove, clear, count } = useCart();
  const [store, setStore] = useState<Store | ''>('');
  const [date, setDate] = useState('');
  const [win, setWin] = useState<Window | ''>('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dates = useMemo(() => nextDates(21), []);
  const detailed = lines.map((l) => ({ ...l, p: getProduct(t, l.id) }));
  const total = detailed.reduce((sum, l) => sum + l.p.price * l.qty, 0);

  /** Opening hours of the chosen store on the chosen date (null if closed). */
  const dayHours = useMemo(() => {
    if (!store || !date) return null;
    const d = new Date(date + 'T12:00:00');
    return STORE_HOURS[store](d.getDay()) ?? null;
  }, [store, date]);

  const windows = useMemo(
    () => (dayHours ? WINDOWS_BY_RANGE[`${dayHours.open}-${dayHours.close}`] ?? [] : []),
    [dayHours],
  );

  // Reset date/window when the store changes (different closed days).
  useEffect(() => {
    setDate('');
    setWin('');
  }, [store]);
  // Drop the window if the date changed to a closed day.
  useEffect(() => {
    setWin('');
  }, [date]);

  async function submit() {
    setError(null);
    if (!store) return setError(t.order.errors.store);
    if (!date) return setError(t.order.errors.date);
    if (!win) return setError(t.order.errors.window);
    if (!name.trim()) return setError(t.order.errors.name);
    if (!phone.trim()) return setError(t.order.errors.phone);
    if (!email.trim()) return setError(t.order.errors.email);
    if (detailed.length === 0) return setError(t.order.errors.items);

    setBusy(true);
    try {
      const res = await apiPost<OrderResponse>('/orders', {
        store,
        pickupDate: date,
        pickupWindow: win,
        customer: { name: name.trim(), phone: phone.trim(), email: email.trim(), note: note.trim() },
        items: detailed.map((l) => ({ productId: l.id as string, qty: l.qty, unitPrice: l.p.price })),
        locale: 'zh',
      });
      clear();
      window.location.href = `/order/success?code=${encodeURIComponent(res.code)}`;
    } catch {
      setError(t.order.errors.submit);
    } finally {
      setBusy(false);
    }
  }

  if (count === 0) {
    return (
      <div className="section py-24 text-center">
        <p className="mx-auto max-w-sm text-mukana-ink/65">{t.order.empty}</p>
        <Link href="/merch" className="btn-primary mt-6">
          {t.order.backToMerch}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <header className="bg-paper-grain border-b border-mukana-line">
        <div className="section py-12">
          <p className="chip">{t.nav.order}</p>
          <h1 className="h-display mt-4">{t.order.title}</h1>
          <p className="mt-3 max-w-xl text-mukana-ink/70">{t.order.subtitle}</p>
          <p className="mt-2 text-sm text-mukana-coral">{t.order.pickupOnlyNote}</p>
        </div>
      </header>

      <div className="section grid gap-10 py-12 lg:grid-cols-[1.2fr_0.8fr]">
        {/* left: steps */}
        <div className="space-y-10">
          {/* store */}
          <section>
            <h2 className="h-section">{t.order.stepPickStore}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(['dpark', 'apm'] as Store[]).map((key) => (
                <label
                  key={key}
                  className={`card cursor-pointer p-4 transition ${
                    store === key ? 'ring-2 ring-mukana-coral' : 'hover:ring-mukana-coral/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="store"
                    className="peer sr-only"
                    checked={store === key}
                    onChange={() => setStore(key)}
                  />
                  <p className="font-medium">{t.locations.stores[key].name}</p>
                  <p className="mt-1 text-xs text-mukana-ink/60">{t.locations.stores[key].address}</p>
                  <p className="mt-1 text-xs text-mukana-ink/60">{t.locations.stores[key].hours}</p>
                </label>
              ))}
            </div>
          </section>

          {/* items */}
          <section>
            <h2 className="h-section">{t.order.stepPickItems}</h2>
            <ul className="mt-4 divide-y divide-mukana-line">
              {detailed.map((l) => (
                <li key={l.id} className="flex items-center gap-4 py-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-mukana-warm ring-1 ring-mukana-line">
                    <Image src={l.p.art} alt={l.p.name} width={56} height={56} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{l.p.name}</p>
                    <p className="text-xs text-mukana-ink/55">HK${l.p.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn-ghost h-8 w-8 !px-0" onClick={() => setQty(l.id as ProductId, l.qty - 1)}>
                      −
                    </button>
                    <span className="w-8 text-center text-sm tabular-nums">{l.qty}</span>
                    <button className="btn-ghost h-8 w-8 !px-0" onClick={() => setQty(l.id as ProductId, l.qty + 1)}>
                      +
                    </button>
                  </div>
                  <button
                    className="text-xs text-mukana-ink/40 hover:text-mukana-coral"
                    onClick={() => remove(l.id as ProductId)}
                    aria-label={t.order.remove}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-mukana-ink/60">{t.order.subtotal}</span>
              <span className="font-semibold">HK${total}</span>
            </div>
          </section>

          {/* time */}
          <section>
            <h2 className="h-section">{t.order.stepPickTime}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="pickup-date">{t.order.pickDate}</label>
                <select
                  id="pickup-date"
                  className="field mt-1.5"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={!store}
                >
                  <option value="">{store ? '—' : t.order.pickWindowFirst}</option>
                  {dates.map((d) => {
                    const hours = store ? STORE_HOURS[store](d.getDay()) : null;
                    const disabled = !hours;
                    return (
                      <option key={d.toISOString()} value={d.toISOString().slice(0, 10)} disabled={disabled}>
                        {d.toLocaleDateString('zh-HK', { month: 'short', day: 'numeric', weekday: 'short' })}
                        {disabled ? ` · ${t.order.closedDay}` : ''}
                      </option>
                    );
                  })}
                </select>
                {!store && <p className="mt-1.5 text-xs text-mukana-ink/50">{t.order.pickWindowFirst}</p>}
              </div>
              <div>
                <label className="label" htmlFor="pickup-window">{t.order.pickWindow}</label>
                <select
                  id="pickup-window"
                  className="field mt-1.5"
                  value={win}
                  onChange={(e) => setWin(e.target.value as Window)}
                  disabled={!dayHours}
                >
                  <option value="">{windows.length ? '—' : t.order.pickWindowFirst}</option>
                  {windows.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.start} – {w.end}
                    </option>
                  ))}
                </select>
                {dayHours && (
                  <p className="mt-1.5 text-xs text-mukana-ink/50">
                    {interpolate(t.order.dayHours, { range: `${dayHours.open} – ${dayHours.close}` })}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* contact */}
          <section>
            <h2 className="h-section">{t.order.stepYourInfo}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="name">{t.order.fullName}</label>
                <input id="name" className="field mt-1.5" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </div>
              <div>
                <label className="label" htmlFor="phone">{t.order.phone}</label>
                <input id="phone" className="field mt-1.5" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" />
              </div>
              <div>
                <label className="label" htmlFor="email">{t.order.email}</label>
                <input id="email" type="email" className="field mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="note">{t.order.note}</label>
                <textarea id="note" rows={3} className="field mt-1.5 resize-none" placeholder={t.order.notePlaceholder} value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>
          </section>
        </div>

        {/* right: summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h3 className="font-display text-lg">{t.order.review}</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {detailed.map((l) => (
                <li key={l.id} className="flex justify-between gap-3">
                  <span className="text-mukana-ink/75">
                    {l.p.name} × {l.qty}
                  </span>
                  <span className="tabular-nums">HK${l.p.price * l.qty}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-mukana-line pt-4 font-display text-lg">
              <span>{t.order.total}</span>
              <span>HK${total}</span>
            </div>

            <p className="mt-3 text-xs text-mukana-ink/55">{t.order.pickupOnlyNote}</p>

            {error && <p className="mt-4 rounded-lg bg-mukana-coral/10 px-3 py-2 text-sm text-mukana-coral">{error}</p>}

            <button className="btn-primary mt-5 w-full" onClick={submit} disabled={busy}>
              {busy ? t.order.submitting : t.order.submit}
            </button>
            <Link href="/merch" className="btn-ghost mt-2 w-full">
              {t.order.backToMerch}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
