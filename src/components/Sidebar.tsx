"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  ClipboardCheck,
  ClipboardList,
  FileText,
  LayoutDashboard,
  QrCode,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  useLanguage,
  type TranslationKey,
} from "@/lib/i18n/language-context";

const navItems: { href: string; label: TranslationKey; icon: typeof LayoutDashboard }[] = [
  { href: "/", label: "nav.dashboard", icon: LayoutDashboard },
  { href: "/reports", label: "nav.reports", icon: FileText },
  { href: "/employees", label: "nav.employees", icon: Users },
  { href: "/work-permits", label: "nav.workPermits", icon: ClipboardCheck },
  { href: "/incidents", label: "nav.incidents", icon: AlertTriangle },
  { href: "/action-items", label: "nav.actionItems", icon: ClipboardList },
  { href: "/qr-scanner", label: "nav.qrScanner", icon: QrCode },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-slate-900 text-slate-100">
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wide">E-QHSE</p>
          <p className="text-xs text-slate-400">{t("app.tagline")}</p>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-orange-500 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t(item.label)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 px-6 py-4 text-xs text-slate-500">
        {t("app.footer")}
      </div>
    </aside>
  );
}