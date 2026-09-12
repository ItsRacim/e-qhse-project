"use client";

import LanguageToggle from "@/components/LanguageToggle";
import RoleToggle from "@/components/RoleToggle";
import { useLanguage } from "@/lib/i18n/language-context";
import { useRole, type UserRole } from "@/lib/i18n/role-context";
import { LogOut, ShieldCheck, UserCog, UserCheck, Users, UserKey } from "lucide-react";

export default function TopBar() {
  const { t } = useLanguage();
  const { role, setRole } = useRole();

  const handleLogout = () => {
    localStorage.removeItem("eqhse-active-role");
    setRole("SUPERVISOR");
    window.location.href = "/login";
  };

  const roleLabels: Record<UserRole, string> = {
    SUPERVISOR: t("roles.supervisor"),
    QHSE_ENGINEER: t("roles.qhseEngineer"),
    RESPONSABLE_HSE: t("roles.responsableHse"),
    SUPERVISEUR_HSE: t("roles.superviseurHse"),
    DRH: t("roles.drh"),
    RESPONSABLE_COMMERCIAL: t("roles.responsableCommercial"),
    INGENIEUR_QHSE: t("roles.ingenieurQhse"),
  };

  const roleIcons: Record<UserRole, React.ComponentType<{ className?: string }>> = {
    SUPERVISOR: ShieldCheck,
    QHSE_ENGINEER: UserCog,
    RESPONSABLE_HSE: Users,
    SUPERVISEUR_HSE: UserCheck,
    DRH: UserKey,
    RESPONSABLE_COMMERCIAL: Users,
    INGENIEUR_QHSE: UserCog,
  };

  const RoleIcon = roleIcons[role];

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
      <p className="truncate text-sm font-medium text-slate-500">{t("app.tagline")}</p>
      <div className="flex shrink-0 items-center gap-4">
        <RoleToggle />
        <LanguageToggle />
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-700">
            <RoleIcon className="h-4 w-4 text-orange-500" />
            <span className="font-medium">{roleLabels[role]}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-rose-600"
            title={t("common.logout")}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}