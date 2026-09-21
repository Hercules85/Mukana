'use client';
import Image from 'next/image';
import { useT } from '@/i18n';

type StoreView = {
  key: 'dpark' | 'apm';
  /** query for the embedded map (the mall itself) */
  mapQuery: string;
  /** external "get directions" link */
  mapUrl: string;
};

const STORES: StoreView[] = [
  {
    key: 'dpark',
    mapQuery: 'D·PARK 荃灣廣場 青山公路398號 荃灣',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=D%C2%B7PARK+398+Castle+Peak+Road+Tsuen+Wan+Hong+Kong',
  },
  {
    key: 'apm',
    mapQuery: 'apm 創紀之城5期 觀塘道418號 觀塘',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=APM+418+Kwun+Tong+Road+Hong+Kong',
  },
];

/** Real stockist logos (assets in /public/images/stockists/). */
const DISTRIBUTORS = [
  { name: '誠品 Eslite', logo: '/images/stockists/eslite.jpg' },
  { name: 'Pinkoi', logo: '/images/stockists/pinkoi.png' },
  { name: 'HKTVmall', logo: '/images/stockists/hktvmall.png' },
  { name: '7-Eleven HK', logo: '/images/stockists/7eleven.jpg' },
  { name: 'Log-on', logo: '/images/stockists/logon.jpg' },
];

export default function LocationsPage() {
  const { t } = useT();

  return (
    <div>
      <header className="bg-paper-grain border-b border-mukana-line">
        <div className="section py-14 sm:py-16">
          <p className="chip">{t.nav.locations}</p>
          <h1 className="h-display mt-4">{t.locations.title}</h1>
          <p className="mt-3 max-w-xl text-mukana-ink/70">{t.locations.subtitle}</p>
        </div>
      </header>

      {/* our stores */}
      <section className="section py-14">
        <h2 className="h-section">{t.locations.ourStores}</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {STORES.map((s) => {
            const store = t.locations.stores[s.key];
            return (
              <article key={s.key} className="card overflow-hidden">
                {/* real mall map embed */}
                <iframe
                  title={`${store.name} map`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(s.mapQuery)}&z=16&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-48 w-full border-0"
                />
                <div className="p-6">
                  <h3 className="font-display text-xl">{store.name}</h3>
                  <dl className="mt-4 space-y-2 text-sm text-mukana-ink/75">
                    <div>
                      <dt className="label">{t.locations.addressLabel}</dt>
                      <dd className="mt-0.5">{store.address}</dd>
                    </div>
                    <div>
                      <dt className="label">{t.locations.hoursLabel}</dt>
                      <dd className="mt-0.5">{store.hours}</dd>
                    </div>
                    <div>
                      <dt className="label">{t.locations.phoneLabel}</dt>
                      <dd className="mt-0.5">
                        <a href={`tel:${store.phone.replace(/\s/g, '')}`} className="hover:text-mukana-coral">
                          {store.phone}
                        </a>
                      </dd>
                    </div>
                  </dl>
                  <a
                    href={s.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary mt-5"
                  >
                    {t.locations.directions}
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none">
                      <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* distributors */}
      <section className="border-t border-mukana-line bg-mukana-warm/50">
        <div className="section py-14">
          <h2 className="h-section">{t.locations.distributors}</h2>
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {DISTRIBUTORS.map((d) => (
              <li key={d.name} className="card flex flex-col items-center justify-center gap-3 px-4 py-6 text-center">
                <span className="flex h-16 w-full items-center justify-center">
                  <Image
                    src={d.logo}
                    alt={d.name}
                    width={120}
                    height={48}
                    className="max-h-12 max-w-[70%] object-contain"
                    unoptimized
                  />
                </span>
                <span className="text-xs font-semibold text-mukana-ink/70">{d.name}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-mukana-ink/50">{t.locations.distributorNote}</p>
        </div>
      </section>
    </div>
  );
}
