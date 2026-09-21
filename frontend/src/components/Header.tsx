'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useT } from '@/i18n';
import { useCart } from '@/lib/cart';

export function Header() {
  const { t, lang, setLang } = useT();
  const { count } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/', label: t.nav.home },
    { href: '/merch', label: t.nav.merch },
    { href: '/about', label: t.nav.about },
    { href: '/locations', label: t.nav.locations },
    { href: '/order', label: t.nav.order },
  ];

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-mukana-line bg-mukana-paper/85 backdrop-blur transition-colors duration-500">
      <div className="section flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Mukana home" className="flex items-center gap-2">
          <Image
            src="/images/brand/profile.jpg"
            alt="Mukana"
            width={36}
            height={36}
            priority
            className="h-9 w-9 rounded-full object-cover ring-1 ring-mukana-line"
          />
          <span className="font-display text-xl tracking-tight">MUKANA</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-3.5 py-2 text-sm transition ${
                isActive(l.href)
                  ? 'bg-mukana-ink text-white'
                  : 'text-mukana-ink/75 hover:bg-mukana-warm hover:text-mukana-ink'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="btn-ghost border border-mukana-line"
            aria-label={t.nav.language}
          >
            {lang === 'zh' ? 'EN' : '中文'}
          </button>

          <Link href="/order" className="btn-secondary relative hidden sm:inline-flex">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 7h12l-1 12H7L6 7Z" strokeLinejoin="round" />
              <path d="M9 7a3 3 0 0 1 6 0" strokeLinecap="round" />
            </svg>
            {t.nav.cart}
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-mukana-coral px-1 text-[11px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>

          <button
            className="btn-ghost md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none">
              {open ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-mukana-line bg-mukana-paper md:hidden">
          <div className="section flex flex-col py-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-3 py-2.5 text-sm ${
                  isActive(l.href) ? 'bg-mukana-warm font-medium' : 'text-mukana-ink/80'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
