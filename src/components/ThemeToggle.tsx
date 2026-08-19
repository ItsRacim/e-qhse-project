"use client";

import { Moon, Sun } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function ThemeToggle() {
  const { t } = useLanguage();

  function toggle() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label={t("theme.toggle")}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:text-foreground"
    >
      <Sun className="hidden h-4 w-4 dark:block" />
      <Moon className="h-4 w-4 dark:hidden" />
    </button>
  );
}