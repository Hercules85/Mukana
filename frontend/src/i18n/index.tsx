'use client';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { zh, type Dict } from './zh';
import { en } from './en';

export type Lang = 'zh' | 'en';
const DICTS: Record<Lang, Dict> = { zh, en };

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
};
const LangCtx = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('zh');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('mukana.lang') : null;
    if (saved === 'zh' || saved === 'en') setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== 'undefined') window.localStorage.setItem('mukana.lang', l);
    if (typeof document !== 'undefined') document.documentElement.lang = l === 'zh' ? 'zh-Hant' : 'en';
  };

  const value = useMemo(() => ({ lang, setLang, t: DICTS[lang] }), [lang]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useT(): { t: Dict; lang: Lang; setLang: (l: Lang) => void } {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error('useT must be used inside LanguageProvider');
  return ctx;
}

export function interpolate(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}
