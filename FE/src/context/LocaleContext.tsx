import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en, type Messages } from "@/i18n/locales/en";
import { vi } from "@/i18n/locales/vi";

export type Locale = "en" | "vi";

const STORAGE_KEY = "cinemax-locale";

const dictionaries: Record<Locale, Messages> = { en, vi };

type Vars = Record<string, string | number>;

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Vars) => string;
  messages: Messages;
};

const LocaleCtx = createContext<Ctx | null>(null);

function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce((acc: unknown, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

function interpolate(template: string, vars?: Vars) {
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, String(v)),
    template,
  );
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored === "en" || stored === "vi") setLocaleState(stored);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
    document.documentElement.style.setProperty(
      "--font-display-active",
      locale === "vi"
        ? '"Be Vietnam Pro", "Outfit", system-ui, sans-serif'
        : '"Bebas Neue", "Impact", sans-serif',
    );
  }, [locale]);

  const messages = dictionaries[locale];

  const t = useCallback(
    (key: string, vars?: Vars) => {
      const value = getByPath(messages, key);
      if (typeof value === "string") return interpolate(value, vars);
      return key;
    },
    [messages],
  );

  const value = useMemo(() => ({ locale, setLocale, t, messages }), [locale, setLocale, t, messages]);

  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleCtx);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
