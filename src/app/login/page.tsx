"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/language-context";
import { useRole, UserRole } from "@/lib/i18n/role-context";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { setRole } = useRole();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<boolean | null>(null);

  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [_signinError, setSigninError] = useState<string | null>(null);
  const [signupFullName, setSignupFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  // eslint-disable-line
const [signupPassword, setSignupPassword] = useState("");

  const roles = [
    "SUPERVISOR",
    "QHSE_ENGINEER",
    "RESPONSABLE_HSE",
    "SUPERVISEUR_HSE",
    "DRH",
    "RESPONSABLE_COMMERCIAL",
    "INGENIEUR_QHSE",
  ];

  const roleDisplayNames: Record<string, string> = {
    SUPERVISOR: "SUPERVISOR",
    QHSE_ENGINEER: "QHSE_ENGINEER",
    RESPONSABLE_HSE: "RESPONSABLE_HSE",
    SUPERVISEUR_HSE: "Superviseur HSE",
    DRH: "DRH",
    RESPONSABLE_COMMERCIAL: "Responsable Commercial",
    INGENIEUR_QHSE: "Ingenieur QHSE",
  };

  // Sign in with Supabase Auth
  const handleSignin = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signinEmail,
        password: signinPassword,
      });

      if (error) {
        setSignupError("Erreur de connexion. Vérifiez vos identifiants.");
        return;
      }

      if (data.session?.user?.app_metadata?.role) {
        setRole(data.session.user.app_metadata.role as UserRole);
      }

      // Role-based redirection
      const hseTechnicalRoles = ["SUPERVISOR", "QHSE_ENGINEER", "RESPONSABLE_HSE", "SUPERVISEUR_HSE", "INGENIEUR_QHSE"];
      const commercialHrRoles = ["DRH", "RESPONSABLE_COMMERCIAL"];

      if (hseTechnicalRoles.includes(data.session.user.app_metadata.role as UserRole)) {
        router.push("/work-permits/new");
      } else if (commercialHrRoles.includes(data.session.user.app_metadata.role as UserRole)) {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } catch (_error) {
      setSignupError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Sign up with fallback to local API route
  const handleSignup = async () => {
    setLoading(true);
    setSignupError(null);
    setSignupSuccess(null);

    // First try Supabase Auth
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            fullName: signupFullName,
            role: "SUPERVISOR",
          },
        },
      });

      if (error) {
        // If Supabase throws a network/fetch error, fallback to local API
        if (error instanceof Error && (error.message.includes("network") || error.message.includes("fetch"))) {
          // Fallback to local Prisma-based registration
          try {
            const fallbackUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            const fallbackResponse = await fetch(fallbackUrl + "/api/auth/register", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: signupEmail,
                password: signupPassword,
                name: signupFullName,
                role: "SUPERVISOR",
              }),
            });

            const fallbackData = await fallbackResponse.json();

            if (fallbackData.success) {
              setRole("SUPERVISOR" as UserRole);
              router.push("/dashboard");
              setLoading(false);
              return;
            } else {
              setSignupError(fallbackData.error || "Échec de l'inscription. Veuillez réessayer.");
              setLoading(false);
              return;
            }
          } catch (_err) {
            // Both Supabase and fallback failed
            setSignupError("Erreur réseau. Veuillez réessayer plus tard.");
            setLoading(false);
            return;
          }
        }

        // Supabase error but not a network error - show it
        setSignupError(_error instanceof Error ? _error.message : "Échec de l'inscription. Veuillez réessayer.");
        setLoading(false);
        return;
      }

      // Supabase signUp succeeded
      if (data.user) {
        // User created via Supabase - set role and redirect
        if (data.session?.user?.app_metadata?.role) {
          setRole(data.session.user.app_metadata.role as UserRole);
        } else {
          setRole("SUPERVISOR" as UserRole);
        }
        router.push("/dashboard");
        setLoading(false);
        return;
      }

      // Check if user was created but needs email verification
      setSignupSuccess(true);
    } catch (error) {
      // Network error or other unexpected error
      setSignupError("Erreur réseau. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white"
            >
              <i className="ShieldCheck h-8 w-8" />
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
                      <i className="Loader2 h-6 w-6 animate-spin" />
                    ) : (
                      <i className="UserCheck h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{t("login.signin")}</p>
                    <p className="text-sm text-slate-500 truncate">Se connecter à votre compte</p>
                  </div>
                  <i className="iCheck h-5 w-5 text-orange-500 shrink-0" />
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
                    {t("login.jobPosition")}
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {roleDisplayNames[role]}
                      </option>
                    ))}
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
                      <i className="Loader2 h-6 w-6 animate-spin" />
                    ) : (
                      <i className="UserCheck h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{t("login.signup")}</p>
                    <p className="text-sm text-slate-500">Créer un compte</p>
                  </div>
                  <i className="iCheck h-5 w-5 text-orange-500 shrink-0" />
                </button>
              </form>
            )}

            {/* Confirmation Feedback */}
            {signupSuccess === true && (
              <div className="mt-6 p-6 rounded-2xl bg-green-50 border border-green-200 text-center">
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  {t("login.check_email")}
                </h3>
                <p className="text-slate-600 mb-4">
                  {t("login.email_sent")}
                </p>
                <p className="text-sm text-slate-500">
                  {t("login.demoNotice")}
                </p>
              </div>
            )}

            {signupError && (
              <div className="mt-6 p-6 rounded-2xl bg-red-50 border border-red-200 text-center">
                <h3 className="text-xl font-bold text-red-800 mb-2">Erreur</h3>
                <p className="text-slate-600 mb-4">{signupError}</p>
                <p className="text-sm text-slate-500">{t("login.demoNotice")}</p>
              </div>
            )}

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
      </div>
    </div>
  );
}