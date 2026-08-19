"use client";

import { Printer } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function PrintButton() {
  const { t } = useLanguage();

  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
    >
      <Printer className="h-4 w-4" />
      {t("common.printPdf")}
    </button>
  );
}