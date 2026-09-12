"use client";

import { ShieldCheck, Loader2, UserCheck } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/language-context";
import { useRole, UserRole } from "@/lib/i18n/role-context";

export default function LoginPage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { setRole } = useRole();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [signupFullName, setSignupFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRole, setSignupRole] = useState<
    | "SUPERVISOR"
    | "QHSE_ENGINEER"
    | "RESPONSABLE_HSE"
    | "SUPERVISEUR_HSE"
    | "DRH"
    | "RESPONSABLE_COMMERCIAL"
    | "INGENIEUR_QHSE"
  >("SUPERVISOR");

  const roles = [
    "SUPERVISOR",
    "QHSE_ENGINEER",
    "RESPONSABLE_HSE",
    "SUPERVISEUR_HSE",
    "DRH",
    "RESPONSABLE_COMMERCIAL",
    "INGENIEUR_QHSE",
  ];

  const roleDisplayNames: Record<UserRole, string> = {
    SUPERVISOR: "SUPERVISOR",
    QHSE_ENGINEER: "QHSE_ENGINEER",
    RESPONSABLE_HSE: "RESPONSABLE_HSE",
    SUPERVISEUR_HSE: "SUPERVISEUR_HSE",
    DRH: "DRH",
    RESPONSABLE_COMMERCIAL: "RESPONSABLE_COMMERCIAL",
    INGENIEUR_QHSE: "INGENIEUR_QHSE",
  };

  const handleSignin = async () => {
    setLoading(true);

    if (!signinEmail || !signinPassword) {
      setLoading(false);
      return;
    }

    const determinedRole =
      signinEmail.endsWith("@hse.com")
        ? "SUPERVISOR"
        : signinEmail.endsWith("@drh.com")
        ? "DRH"
        : "SUPERVISOR";

    setRole(determinedRole);

    const hseTechnicalRoles = [
      "SUPERVISOR",
      "QHSE_ENGINEER",
      "RESPONSABLE_HSE",
      "SUPERVISEUR_HSE",
      "INGENIEUR_QHSE",
    ];
    const commercialHrRoles = ["DRH", "RESPONSABLE_COMMERCIAL"];

    if (hseTechnicalRoles.includes(determinedRole)) {
      router.push("/work-permits/new");
    } else if (commercialHrRoles.includes(determinedRole)) {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    setLoading(true);
    setRole(signupRole);
    setLoading(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white"
            >
              <ShieldCheck className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t("app.tagline")}</h1>
          <p className="mt-2 text-slate-500">{t("login.subtitle")}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="space-y-4">
            {/* Tab Switcher */}
            <div className="border-b border-slate-200 mb-4">
              <button
                onClick={() => setTab("signin")}
                className={`px-4 py-2 rounded-t-lg ${tab === "signin" ? "border-b-2 border-orange-500 text-orange-600" : "text-slate-500 hover:text-slate-700"}`}
              >
                {t("login.signin")}
              </button>
              <button
                onClick={() => setTab("signup")}
                className={`px-4 py-2 rounded-t-lg ${tab === "signup" ? "border-b-2 border-orange-500 text-orange-600" : "text-slate-500 hover:text-slate-700"}`}
              >
                {t("login.signup")}
              </button>
            </div>

            {/* Sign In Form */}
            {tab === "signin" && (
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t("common.email")}
                  </label>
                  <input
                    value={signinEmail}
                    onChange={(e) => setSigninEmail(e.target.value)}
                    placeholder="votre.email@entreprise.com"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t("common.password")}
                  </label>
                  <input
                    value={signinPassword}
                    onChange={(e) => setSigninPassword(e.target.value)}
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  onClick={handleSignin}
                  disabled={loading}
                  className="w-full flex items-center gap-4 rounded-xl border border-orange-500 bg-orange-50 px-5 py-4 text-left transition-all hover:bg-orange-100 hover:shadow-md disabled:opacity-50 disabled:cursor-wait"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                    {loading ? (
                      <Loader2 h-6 w-6 animate-spin />
                    ) : (
                      <UserCheck h-6 w-6 />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{t("login.signin")}</p>
                    <p className="text-sm text-slate-500 truncate">Se connecter à votre compte</p>
                  </div>
                  <UserCheck h-5 w-5 text-orange-500 shrink-0 />
                </button>
              </form>
            )}

            {/* Sign Up Form */}
            {tab === "signup" && (
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t("common.fullName")}
                  </label>
                  <input
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    placeholder="Nom complet"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t("common.email")}
                  </label>
                  <input
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="votre.email@entreprise.com"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t("common.password")}
                  </label>
                  <input
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t("login.jobPosition")}
                  </label>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value as UserRole)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  >
                    {roles.map((role) => {
                        const roleKey = role as UserRole;
                        return (
                          <option key={role} value={role}>
                            {roleDisplayNames[roleKey]}
                          </option>
                        );
                      })}
                  </select>
                </div>
                <button
                  type="submit"
                  onClick={handleSignup}
                  disabled={loading}
                  className="w-full flex items-center gap-4 rounded-xl border border-orange-500 bg-orange-50 px-5 py-4 text-left transition-all hover:bg-orange-100 hover:shadow-md disabled:opacity-50 disabled:cursor-wait"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                    {loading ? (
                      <Loader2 h-6 w-6 animate-spin />
                    ) : (
                      <UserCheck h-6 w-6 />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{t("login.signup")}</p>
                    <p className="text-sm text-slate-500">Créer un compte</p>
                  </div>
                  <UserCheck h-5 w-5 text-orange-500 shrink-0 />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-center text-xs text-slate-400">
            {t("login.demoNotice")}
          </p>
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