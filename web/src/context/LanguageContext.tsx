"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import en from "@/locales/en.json";
import ta from "@/locales/ta.json";

export type Language = "en" | "ta";

type Translations = typeof en;

const LOCALES: Record<Language, Translations> = { en, ta } as Record<Language, Translations>;

const STORAGE_KEY = "cft-lang";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (path: string, vars?: Record<string, string | number | boolean>) => any;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: (path) => path,
});

function getNestedValue(obj: Record<string, unknown>, path: string): any {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Return key path if not found
    }
  }
  return current !== undefined ? current : path;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  // Read from localStorage on mount (client only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored === "en" || stored === "ta") {
        setLangState(stored);
      }
    } catch {
      // localStorage not available
    }
    setMounted(true);
  }, []);

  // Update <html lang> attribute and localStorage when language changes
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    document.documentElement.setAttribute("lang", lang);
  }, [lang, mounted]);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
  }, []);

  const t = useCallback(
    (path: string, vars?: Record<string, string | number | boolean>): any => {
      const locale = LOCALES[lang] as Record<string, unknown>;
      let value = getNestedValue(locale, path);

      // Fallback to English if not found in Tamil
      if (value === path && lang !== "en") {
        value = getNestedValue(LOCALES["en"] as Record<string, unknown>, path);
      }

      // Variable substitution: replace {key} with vars[key]
      if (vars && typeof value === "string") {
        Object.entries(vars).forEach(([k, v]) => {
          value = value.replace(`{${k}}`, String(v));
        });
      }

      return value;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
