"use client";

import {
  SUPPORTED_LANGUAGES,
  useLanguage,
  type Language,
} from "@/lib/i18n/language-context";

const labels: Record<Language, string> = { en: "EN", fr: "FR", ar: "AR" };

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("language.toggle")}
      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1"
    >
      {SUPPORTED_LANGUAGES.map((code) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          aria-pressed={language === code}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
            language === code
              ? "bg-sky-700 text-white"
              : "text-slate-500 hover:text-sky-700"
          }`}
        >
          {labels[code]}
        </button>
      ))}
    </div>
  );
}