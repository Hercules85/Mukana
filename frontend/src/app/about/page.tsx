'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n';
import { InstagramEmbed } from '@/components/InstagramEmbed';

const IG_POSTS = ['CwK6kpDSaG4', 'CwAAVJqrDqv', 'CvzIWc8rLox'];

/**
 * Scroll-reveal wrapper: content fades/slides in when it reaches the centre
 * of the viewport (same feel as the landing hero panels), and fades out as
 * it scrolls away.
 */
function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting && entry.intersectionRatio >= 0.35),
      { threshold: [0.15, 0.35, 0.6] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        active ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function AboutPage() {
  const { t } = useT();
  const regionRef = useRef<HTMLDivElement>(null);

  // While the pinned photo region sits beneath the fixed top nav, make the
  // nav transparent so the photo shows through (see body.photo-under-header
  // in globals.css).
  useEffect(() => {
    const onScroll = () => {
      const r = regionRef.current?.getBoundingClientRect();
      const under = !!r && r.top <= 64 && r.bottom >= 64;
      document.body.classList.toggle('photo-under-header', under);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.body.classList.remove('photo-under-header');
    };
  }, []);

  return (
    <div>
      {/* ---------- PINNED PHOTO REGION: title + our story → our journey ---------- */}
      <div ref={regionRef} className="relative">
        {/* sticky, slightly transparent background photo (runs under the nav too) */}
        <div className="absolute inset-0">
          <div className="sticky top-0 h-screen overflow-hidden">
            <Image
              src="/images/brand/story.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-contain object-top opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-mukana-paper/85 via-mukana-paper/40 to-mukana-paper/85" />
          </div>
        </div>

        <div className="relative z-10">
          {/* page title over the photo */}
          <div className="section flex flex-col items-start gap-6 py-14 sm:flex-row sm:items-center sm:justify-between sm:py-16">
            <div>
              <p className="chip bg-white/75">{t.nav.about}</p>
              <h1 className="h-display mt-4">{t.about.title}</h1>
              <p className="mt-3 max-w-xl text-mukana-ink/70">{t.about.subtitle}</p>
            </div>
          </div>

          {/* story: 01 the city → 02 what we see → 03 what we make → 04 the promise */}
          <div className="section py-16">
            <Reveal>
              <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="lg:sticky lg:top-24 lg:self-start">
                  <p className="label">{t.about.storyTitle}</p>
                  <h2 className="h-section mt-2">
                    {t.brand.tagline}
                    <span className="text-mukana-coral"> · </span>
                    {t.brand.slogan}
                  </h2>
                  <p className="mt-4 text-sm text-mukana-ink/55">Est. 2018 · Hong Kong</p>
                </div>
                <div className="space-y-8">
                  {t.about.storyBody.map((p, i) => (
                    <Reveal key={i}>
                      <div className="grid grid-cols-[auto_1fr] gap-4 sm:gap-6">
                        <div className="flex flex-col items-center">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-display text-sm font-semibold text-mukana-coral shadow-sm ring-1 ring-mukana-line">
                            0{i + 1}
                          </span>
                          {i < t.about.storyBody.length - 1 && (
                            <span className="mt-2 w-px flex-1 bg-mukana-ink/10" aria-hidden />
                          )}
                        </div>
                        <div className="pb-2">
                          <p className="label">{t.about.storySteps[i]}</p>
                          <p className="mt-2 rounded-xl bg-white/85 p-4 leading-relaxed text-mukana-ink/80 shadow-sm backdrop-blur-sm sm:p-5">
                            {p}
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          {/* journey timeline: 2018 → now */}
          <div className="section py-16">
            <Reveal>
              <h2 className="h-section">{t.about.timelineTitle}</h2>
              <p className="mt-2 text-sm text-mukana-ink/65">{t.about.timelineBody}</p>
            </Reveal>
            <div className="mt-10">
              {t.about.timeline.map((m, i) => (
                <Reveal key={m.years}>
                  <div className="relative grid grid-cols-[auto_1fr] gap-4 sm:gap-8">
                    {/* year column */}
                    <div className="flex w-24 shrink-0 flex-col items-end sm:w-32">
                      <span className="rounded-full bg-white px-3 py-1 font-display text-xs font-semibold tracking-wide text-mukana-coral shadow-sm ring-1 ring-mukana-line sm:text-sm">
                        {m.years}
                      </span>
                      {i < t.about.timeline.length - 1 && (
                        <span className="mt-1 w-px flex-1 bg-mukana-ink/10" aria-hidden />
                      )}
                    </div>
                    {/* milestone card */}
                    <div className="pb-8">
                      <div className="card bg-white/85 p-5 backdrop-blur-sm">
                        <h3 className="font-display text-lg">{m.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-mukana-ink/75">{m.body}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* values with photos */}
      <section className="border-y border-mukana-line bg-mukana-warm/50">
        <div className="section py-14">
          <h2 className="h-section">{t.about.valuesTitle}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {t.about.values.map((v, i) => (
              <div key={v.title} className="card overflow-hidden">
                <div className="relative h-44 bg-mukana-warm">
                  <Image
                    src={v.img}
                    alt={v.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <span className="font-display text-4xl text-mukana-coral/80">0{i + 1}</span>
                  <h3 className="mt-3 font-display text-xl">{v.title}</h3>
                  <p className="mt-2 text-sm text-mukana-ink/70">{v.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* moments: Instagram posts */}
      <section className="section py-16">
        <h2 className="h-section">{t.about.momentsTitle}</h2>
        <p className="mt-2 text-sm text-mukana-ink/65">{t.about.momentsBody}</p>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {IG_POSTS.map((post) => (
            <InstagramEmbed key={post} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
