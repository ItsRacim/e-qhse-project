"use client";

import { ShieldCheck, X } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/lib/i18n/language-context";

export default function StandalonePermitLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-sky-600" />
            <span className="text-sm font-bold tracking-wide text-slate-800">
              E-QHSE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={() => window.close()}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-sky-500 hover:text-sky-700"
            >
              <X className="h-3.5 w-3.5" />
              {t("workPermits.closeTab")}
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}