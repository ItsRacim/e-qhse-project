"use client";

import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/lib/i18n/language-context";

export default function TopBar() {
  const { t } = useLanguage();

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
      <p className="truncate text-sm font-medium text-slate-500">{t("app.tagline")}</p>
      <div className="flex shrink-0 items-center gap-2">
        <LanguageToggle />
      </div>
    </header>
  );
}