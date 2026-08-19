"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { en, type Dictionary } from "./dictionaries/en";
import { fr } from "./dictionaries/fr";
import { ar } from "./dictionaries/ar";

export type Language = "en" | "fr" | "ar";

export const SUPPORTED_LANGUAGES: Language[] = ["en", "fr", "ar"];
export const DEFAULT_LANGUAGE: Language = "en";
export const LANGUAGE_STORAGE_KEY = "eqhse-language";

const dictionaries: Record<Language, Dictionary> = { en, fr, ar };

type DotKeys<T, P extends string = ""> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? DotKeys<T[K], `${P}${K & string}.`>
    : `${P}${K & string}`;
}[keyof T];

export type TranslationKey = DotKeys<Dictionary>;

export type EnumGroup = keyof Dictionary["enumLabels"];

type TranslationParams = Record<string, string | number>;

type LanguageContextValue = {
  language: Language;
  dir: "ltr" | "rtl";
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
  tEnum: (group: EnumGroup, value: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function resolveStoredLanguage(): Language {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === "fr" || stored === "ar" ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

function applyDirection(language: Language) {
  const dir = language === "ar" ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", language);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const stored = resolveStoredLanguage();
    setLanguageState(stored);
    applyDirection(stored);
  }, []);

  useEffect(() => {
    applyDirection(language);
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // storage unavailable
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) => {
      let value: unknown = dictionaries[language];
      for (const part of key.split(".")) {
        if (value && typeof value === "object") {
          value = (value as Record<string, unknown>)[part];
        } else {
          value = undefined;
          break;
        }
      }
      if (typeof value !== "string") return key;
      if (!params) return value;
      return value.replace(/\{(\w+)\}/g, (_, name: string) =>
        name in params ? String(params[name]) : `{${name}}`
      );
    },
    [language]
  );

  const dir: "ltr" | "rtl" = language === "ar" ? "rtl" : "ltr";

  const tEnum = useCallback(
    (group: EnumGroup, value: string) => {
      const labels = dictionaries[language].enumLabels[
        group
      ] as Record<string, string>;
      return labels[value] ?? value;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, dir, setLanguage, t, tEnum }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}