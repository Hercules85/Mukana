'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n';
import { ProductCard } from '@/components/ProductCard';

/** External stockists only — our own stores (D·PARK / APM) are on the locations page. */
const PARTNERS = [
  { name: 'Log-on', logo: '/images/stockists/logon.jpg' },
  { name: '7-Eleven HK', logo: '/images/stockists/7eleven.jpg' },
  { name: 'HKTVmall', logo: '/images/stockists/hktvmall.png' },
  { name: 'Pinkoi', logo: '/images/stockists/pinkoi.png' },
  { name: '誠品 eslite', logo: '/images/stockists/eslite.jpg' },
];

/** Photos for the "What we believe" horizontal scroller. */
const VALUE_PHOTOS = [
  { src: '/images/values/value-1.jpg', alt: '陪伴' },
  { src: '/images/values/value-2.jpg', alt: '簡約' },
  { src: '/images/values/value-3.jpg', alt: '真誠' },
];

/**
 * One full-viewport hero panel. Its content fades/slides in when the panel
 * occupies the centre of the viewport, and fades out as it scrolls away.
 */
function HeroPanel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting && entry.intersectionRatio >= 0.5),
      { threshold: [0.25, 0.5, 0.75] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <div
        ref={ref}
        className={`mx-auto max-w-2xl px-6 text-center transition-all duration-700 ease-out ${
          active ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { t } = useT();

  return (
    <div>
      {/* ---------- HERO: pinned photo behind, 3 centre panels on scroll ---------- */}
      <section className="relative h-[300vh]">
        {/* sticky, slightly transparent background photo */}
        <div className="absolute inset-0">
          <div className="sticky top-0 h-screen overflow-hidden">
            <Image
              src="/images/brand/hero.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-55"
            />
            {/* soft paper veil so text stays readable */}
            <div className="absolute inset-0 bg-gradient-to-b from-mukana-paper/80 via-mukana-paper/30 to-mukana-paper/80" />
          </div>
        </div>

        {/* the three scrolling parts */}
        <div className="relative z-10">
          {/* Part 1 — you are not alone */}
          <HeroPanel>
            <div>
              <p className="label">{t.brand.tagline}</p>
              <h1 className="h-display mt-4 text-4xl sm:text-6xl">{t.brand.slogan}</h1>
            </div>
          </HeroPanel>

          {/* Part 2 — the name */}
          <HeroPanel>
            <div>
              <h2 className="font-display text-2xl leading-snug tracking-tight sm:text-4xl">
                {t.home.heroPart2Title}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-mukana-ink/75 sm:text-lg">
                {t.home.heroPart2Body}
              </p>
            </div>
          </HeroPanel>

          {/* Part 3 — since 2018 + CTAs */}
          <HeroPanel>
            <div>
              <p className="label">{t.nav.home}</p>
              <h2 className="h-display mt-4 text-3xl sm:text-5xl">{t.home.heroPart3Title}</h2>
              <p className="mx-auto mt-4 max-w-md text-base text-mukana-ink/70">
                {t.home.heroPart3Body}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/merch" className="btn-primary">
                  {t.home.heroCta}
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link href="/about" className="btn-secondary">
                  {t.home.heroCtaSecondary}
                </Link>
              </div>
            </div>
          </HeroPanel>
        </div>
      </section>

      {/* ---------- FEATURED PRODUCTS ---------- */}
      <section className="section py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label">{t.nav.merch}</p>
            <h2 className="h-section mt-2">{t.home.featuredTitle}</h2>
            <p className="mt-2 text-sm text-mukana-ink/65">{t.home.featuredBody}</p>
          </div>
          <Link href="/merch" className="btn-secondary">
            {t.common.viewAll}
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ProductCard id="notebook" />
          <ProductCard id="toteSmall" />
          <ProductCard id="toteLarge" />
        </div>
      </section>

      {/* ---------- CONCEPT ---------- */}
      <section className="border-y border-mukana-line bg-mukana-warm/50">
        <div className="section grid items-center gap-10 py-16 lg:grid-cols-2">
          <div>
            <p className="label">{t.nav.about}</p>
            <h2 className="h-section mt-2">{t.home.conceptTitle}</h2>
            <p className="mt-4 max-w-lg leading-relaxed text-mukana-ink/70">{t.home.conceptBody}</p>
            <Link href="/about" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-mukana-coral hover:underline">
              {t.common.learnMore} →
            </Link>
          </div>
          <div className="no-scrollbar -mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-3">
            {VALUE_PHOTOS.map((img) => (
              <div
                key={img.src}
                className="relative h-64 w-44 shrink-0 snap-start overflow-hidden rounded-xl bg-mukana-warm ring-1 ring-mukana-line sm:h-72 sm:w-52"
              >
                <Image src={img.src} alt={img.alt} fill sizes="220px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- PARTNERS ---------- */}
      <section className="py-16">
        <div className="section">
          <p className="label">{t.home.partnersTitle}</p>
          <h2 className="h-section mt-2">{t.home.partnersBody}</h2>
        </div>
        {/* auto-scrolling marquee: two copies back-to-back, loops seamlessly */}
        <div className="marquee-hover relative mt-8 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-mukana-paper to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-mukana-paper to-transparent" />
          <div className="animate-marquee flex w-max gap-4">
            {[false, true].map((copy) => (
              <ul key={String(copy)} aria-hidden={copy || undefined} className="flex gap-4">
                {PARTNERS.map((p) => (
                  <li
                    key={p.name + String(copy)}
                    className="card flex h-24 w-48 items-center justify-center gap-3 px-4"
                  >
                    <Image
                      src={p.logo}
                      alt={p.name}
                      width={48}
                      height={48}
                      unoptimized
                      className="max-h-12 max-w-[72px] object-contain"
                    />
                    <span className="text-sm font-semibold text-mukana-ink/75">{p.name}</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
        <div className="section mt-6">
          <Link href="/locations" className="text-sm font-medium text-mukana-coral hover:underline">
            {t.nav.locations} →
          </Link>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="section pb-20">
        <div className="card flex flex-col items-center gap-4 bg-mukana-ink px-6 py-12 text-center text-white">
          <Image
            src="/images/brand/profile.jpg"
            alt="Mukana"
            width={92}
            height={92}
            className="h-[92px] w-[92px] rounded-full object-cover ring-2 ring-white/30"
          />
          <h2 className="font-display text-2xl sm:text-3xl">{t.order.title}</h2>
          <p className="max-w-lg text-sm text-white/70">{t.order.subtitle}</p>
          <Link href="/order" className="btn-primary mt-2">
            {t.order.submit}
          </Link>
        </div>
      </section>
    </div>
  );
}
