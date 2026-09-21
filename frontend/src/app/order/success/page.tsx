'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useT } from '@/i18n';
import Image from 'next/image';

function SuccessInner() {
  const { t } = useT();
  const code = useSearchParams().get('code') ?? '';

  return (
    <div className="section flex flex-col items-center py-24 text-center">
      <Image
        src="/images/brand/profile.jpg"
        alt="Mukana"
        width={140}
        height={140}
        priority
        className="h-[140px] w-[140px] rounded-full object-cover ring-1 ring-mukana-line"
      />
      <h1 className="h-display mt-6">{t.order.success.title}</h1>
      <p className="mt-3 max-w-md text-mukana-ink/70">{t.order.success.body}</p>
      <div className="card mt-8 px-8 py-6">
        <p className="label">{t.order.success.code}</p>
        <p className="mt-2 font-display text-4xl tracking-[0.2em] text-mukana-coral">{code}</p>
        <p className="mt-3 text-xs text-mukana-ink/55">{t.order.success.saved}</p>
      </div>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-secondary">
          {t.order.success.backHome}
        </Link>
        <Link href="/merch" className="btn-ghost">
          {t.order.backToMerch}
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessInner />
    </Suspense>
  );
}
