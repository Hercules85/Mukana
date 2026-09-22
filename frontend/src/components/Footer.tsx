'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useT, interpolate } from '@/i18n';

export function Footer() {
  const { t } = useT();
  return (
    <footer className="mt-24 border-t border-mukana-line bg-mukana-warm/60">
      <div className="section grid gap-10 py-14 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/images/brand/profile.jpg"
              alt="Mukana"
              width={44}
              height={44}
              className="h-11 w-11 object-cover"
            />
            <span className="font-display text-xl">MUKANA</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-mukana-ink/65">{t.brand.slogan}</p>
        </div>

        <div>
          <p className="label">{t.footer.contactUs}</p>
          <ul className="mt-3 space-y-2 text-sm text-mukana-ink/75">
            <li>
              <a className="hover:text-mukana-coral" href={`mailto:${t.footer.email}`}>
                {t.footer.email}
              </a>
            </li>
            <li>{t.footer.address}</li>
            <li>
              <Link className="hover:text-mukana-coral" href="/locations">
                {t.nav.locations}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="label">{t.footer.followUs}</p>
          <div className="mt-3 flex gap-2">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/mukana_hug?stkn=dXdzc3Y3dHFpYmcw&utm_source=qr"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-mukana-line transition hover:bg-mukana-coral hover:text-white"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-mukana-line">
        <div className="section flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-mukana-ink/55">
          <span>{interpolate(t.common.copyright, { year: 2023 })}</span>
          <span className="flex gap-4">
            <Link className="hover:text-mukana-ink" href="/privacy">
              {t.common.privacy}
            </Link>
            <Link className="hover:text-mukana-ink" href="/terms">
              {t.common.terms}
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
