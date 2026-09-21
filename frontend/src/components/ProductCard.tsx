'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useT } from '@/i18n';
import { useCart } from '@/lib/cart';
import { getProduct, type ProductId } from '@/lib/products';

export function ProductCard({ id, featured = false }: { id: ProductId; featured?: boolean }) {
  const { t } = useT();
  const { add } = useCart();
  const p = getProduct(t, id);

  return (
    <article className={`card group flex flex-col overflow-hidden ${featured ? '' : ''}`}>
      <Link
        href={`/merch#${id}`}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-mukana-warm/50"
      >
        <Image
          src={p.photos[0] ?? p.art}
          alt={p.name}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover transition group-hover:scale-[1.02]"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg leading-snug">{p.name}</h3>
            <p className="mt-0.5 text-sm text-mukana-ink/60">{p.tagline}</p>
          </div>
          <span className="whitespace-nowrap font-display text-lg" style={{ color: p.accent }}>
            HK${p.price}
          </span>
        </div>
        <p className="mt-1 line-clamp-3 text-sm text-mukana-ink/70">{p.desc}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <Link href={`/merch#${id}`} className="text-sm font-medium text-mukana-ink/60 underline-offset-4 hover:underline">
            {t.merch.viewDetails}
          </Link>
          <button
            className="btn-primary px-4 py-2 text-[13px]"
            onClick={() => add(id)}
            aria-label={`${t.merch.addToOrder}: ${p.name}`}
          >
            + {t.merch.addToOrder}
          </button>
        </div>
      </div>
    </article>
  );
}
