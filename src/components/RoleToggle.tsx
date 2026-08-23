"use client";

import { ShieldCheck, UserCog } from "lucide-react";
import { useRole, type UserRole } from "@/lib/i18n/role-context";
import { useLanguage } from "@/lib/i18n/language-context";

export default function RoleToggle() {
  const { t } = useLanguage();
  const { role, setRole } = useRole();

  const roleOptions: { value: UserRole; label: string; icon: typeof ShieldCheck }[] = [
    { value: "SUPERVISOR", label: t("roles.supervisor"), icon: ShieldCheck },
    { value: "QHSE_ENGINEER", label: t("roles.qhseEngineer"), icon: UserCog },
  ];

  return (
    <div className="relative">
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as UserRole)}
        className="appearance-none w-40 rounded-lg border border-slate-300 bg-white px-3 py-1.5 pr-8 text-sm text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
      >
        {roleOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <UserCog className="h-4 w-4" />
      </div>
    </div>
  );
}