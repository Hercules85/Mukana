'use client';
import { useT } from '@/i18n';
import type { Dict } from '@/i18n/zh';

export function LegalPage({ doc }: { doc: (t: Dict) => Dict['legal']['privacy'] | Dict['legal']['terms'] }) {
  const { t } = useT();
  const d = doc(t);

  return (
    <div>
      <header className="bg-paper-grain border-b border-mukana-line">
        <div className="section py-12 sm:py-14">
          <p className="chip">{d.updated}</p>
          <h1 className="h-display mt-4">{d.title}</h1>
          <p className="mt-3 max-w-2xl text-mukana-ink/70">{d.intro}</p>
        </div>
      </header>

      <div className="section max-w-3xl py-12">
        <ol className="space-y-10">
          {d.sections.map((s, i) => (
            <li key={s.title} className="grid gap-2 sm:grid-cols-[3rem_1fr] sm:gap-6">
              <span className="font-display text-2xl text-mukana-coral/80">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h2 className="font-display text-xl tracking-tight">{s.title}</h2>
                <div className="mt-2 space-y-3 leading-relaxed text-mukana-ink/75">
                  {s.body.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
