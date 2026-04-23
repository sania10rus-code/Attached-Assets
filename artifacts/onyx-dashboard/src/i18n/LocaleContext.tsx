import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DICTS, DEFAULT_LOCALE, type Locale } from "./dictionaries";

const STORAGE_KEY = "onix_locale_v1";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LocaleCtx = createContext<Ctx | null>(null);

function readStored(): Locale {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "ru" || v === "en") return v;
  } catch {}
  return DEFAULT_LOCALE;
}

function format(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (params[k] != null ? String(params[k]) : `{${k}}`));
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStored());

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const dict = DICTS[locale];
      const tmpl = dict[key] ?? DICTS[DEFAULT_LOCALE][key] ?? key;
      return format(tmpl, params);
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
}

export function useTranslation(): Ctx {
  const ctx = useContext(LocaleCtx);
  if (!ctx) throw new Error("useTranslation must be used inside LocaleProvider");
  return ctx;
}

/**
 * Read the current locale outside of React (for storage/format helpers).
 * Falls back to default if not yet loaded.
 */
export function getCurrentLocale(): Locale {
  return readStored();
}
