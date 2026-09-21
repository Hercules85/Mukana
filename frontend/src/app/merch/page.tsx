'use client';
import Image from 'next/image';
import { useState } from 'react';
import { useT } from '@/i18n';
import { useCart } from '@/lib/cart';
import { PRODUCTS, getProduct, type ProductId } from '@/lib/products';

/** Photo carousel for a product (falls back to a single illustration). */
function ProductGallery({ photos, art, name, eager = false }: { photos: string[]; art: string; name: string; eager?: boolean }) {
  const [index, setIndex] = useState(0);
  const slides = photos.length > 0 ? photos : [art];
  const count = slides.length;
  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);
  const isPhoto = photos.length > 0;

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-mukana-warm/40">
      <Image
        key={slides[index]}
        src={slides[index]}
        alt={`${name} — ${index + 1}/${count}`}
        fill
        sizes="(max-width: 640px) 100vw, 560px"
        priority={eager && index === 0}
        className={`object-cover ${isPhoto ? '' : 'object-contain'}`}
      />
      {count > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-mukana-ink shadow transition hover:bg-white"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-mukana-ink shadow transition hover:bg-white"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {/* dots overlaid on the photo — no white strip below */}
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s}
                onClick={() => setIndex(i)}
                aria-label={`Photo ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full shadow-sm transition-all ${
                  i === index ? 'w-6 bg-white' : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function MerchPage() {
  const { t } = useT();
  const { add } = useCart();

  return (
    <div>
      <header className="bg-paper-grain border-b border-mukana-line">
        <div className="section py-14 sm:py-16">
          <p className="chip">{t.nav.merch}</p>
          <h1 className="h-display mt-4">{t.merch.title}</h1>
          <p className="mt-3 max-w-xl text-mukana-ink/70">{t.merch.subtitle}</p>
          <p className="mt-4 text-xs text-mukana-ink/50">{t.merch.note}</p>
        </div>
      </header>

      <div className="section divide-y divide-mukana-line">
        {PRODUCTS.map((meta) => {
          const p = getProduct(t, meta.id as ProductId);
          return (
            <section key={meta.id} id={meta.id} className="grid scroll-mt-24 items-center gap-8 py-12 sm:grid-cols-2">
              <div className={`card overflow-hidden ${meta.id === 'postcard' ? 'sm:order-2' : ''}`}>
                <ProductGallery photos={p.photos} art={p.art} name={p.name} eager={meta.id === 'notebook'} />
              </div>

              <div>
                <div className="flex items-center gap-3">
                </div>
                <h2 className="h-section mt-4">{p.name}</h2>
                <p className="mt-1 text-mukana-ink/60">{p.tagline}</p>
                <p className="mt-5 font-display text-3xl" style={{ color: p.accent }}>
                  HK${p.price}
                </p>
                <p className="mt-5 leading-relaxed text-mukana-ink/75">{p.desc}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button className="btn-primary" onClick={() => add(meta.id)}>
                    + {t.merch.addToOrder}
                  </button>
                  <a href="/order" className="btn-secondary">
                    {t.order.title}
                  </a>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <div className="section pb-16">
        <div className="card flex flex-col items-center gap-3 bg-mukana-warm/60 px-6 py-10 text-center">
          <p className="text-sm text-mukana-ink/70">{t.order.pickupOnlyNote}</p>
        </div>
      </div>
    </div>
  );
}
