"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, UserCog, Loader2, Shield, UserCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { useRole } from "@/lib/i18n/role-context";

export default function LoginPage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { setRole } = useRole();
  const [loading, setLoading] = useState<"SUPERVISOR" | "QHSE_ENGINEER" | null>(null);

  const handleLogin = async (role: "SUPERVISOR" | "QHSE_ENGINEER") => {
    setLoading(role);
    setRole(role);
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (role === "SUPERVISOR") {
      router.push("/work-permits/new");
    } else {
      router.push("/");
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <ShieldCheck className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t("app.tagline")}</h1>
          <p className="mt-2 text-slate-500">{t("login.subtitle")}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="space-y-4">
            <button
              onClick={() => handleLogin("SUPERVISOR")}
              disabled={loading !== null}
              className="w-full flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-left transition-all hover:border-orange-300 hover:bg-orange-50 hover:shadow-md disabled:opacity-50 disabled:cursor-wait"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                {loading === "SUPERVISOR" ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Shield className="h-6 w-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{t("login.supervisor")}</p>
                <p className="text-sm text-slate-500 truncate">{t("login.supervisorDesc")}</p>
              </div>
              <UserCheck className="h-5 w-5 text-amber-500 shrink-0" />
            </button>

            <button
              onClick={() => handleLogin("QHSE_ENGINEER")}
              disabled={loading !== null}
              className="w-full flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-left transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-md disabled:opacity-50 disabled:cursor-wait"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                {loading === "QHSE_ENGINEER" ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <UserCog className="h-6 w-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{t("login.qhseEngineer")}</p>
                <p className="text-sm text-slate-500 truncate">{t("login.qhseEngineerDesc")}</p>
              </div>
              <UserCheck className="h-5 w-5 text-blue-500 shrink-0" />
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-center text-xs text-slate-400">
              {t("login.demoNotice")}
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-slate-500">{t("common.language")}</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "fr" | "ar")}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}