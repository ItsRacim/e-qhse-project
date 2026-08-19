"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  CheckCircle2,
  Delete,
  KeyRound,
  Loader2,
  ScanLine,
  X,
} from "lucide-react";
import type { SafeEmployee } from "@/lib/employee";
import { useLanguage } from "@/lib/i18n/language-context";

type Tab = "qr" | "pin";

type QuickAuthModalProps = {
  open: boolean;
  onClose: () => void;
  onVerified: (employee: SafeEmployee) => void;
  title?: string;
  description?: string;
  allowedRoles?: string[];
};

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "CLR", "0", "⌫"];

export default function QuickAuthModal({
  open,
  onClose,
  onVerified,
  title,
  description,
  allowedRoles,
}: QuickAuthModalProps) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("qr");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<SafeEmployee | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const wasOpenRef = useRef(false);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner) {
      try {
        await scanner.stop();
        scanner.clear();
      } catch {
        // scanner already stopped
      }
    }
  }, []);

  function accept(employee: SafeEmployee) {
    if (
      allowedRoles &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(employee.role)
    ) {
      setError(t("auth.roleNotPermitted", { roles: allowedRoles.join(" or ") }));
      setTab("pin");
      return;
    }
    setSuccess(employee);
    setTimeout(() => {
      onVerified(employee);
      onClose();
    }, 700);
  }

  async function verifyQr(qrData: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrData }),
      });
      const data = await res.json();
      if (res.ok && data.employee) {
        accept(data.employee);
      } else {
        setError(data.error ?? t("auth.qrNotFound"));
      }
    } catch {
      setError(t("auth.verifyFailed"));
    } finally {
      setLoading(false);
    }
  }

  const verifyQrRef = useRef(verifyQr);
  verifyQrRef.current = verifyQr;

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setPin("");
      setError(null);
      setCameraError(null);
      setLoading(false);
      setSuccess(null);
      setTab("qr");
    }
    if (!open && wasOpenRef.current) {
      stopScanner();
    }
    wasOpenRef.current = open;
  }, [open, stopScanner]);

  useEffect(() => {
    if (!open || tab !== "qr") return;

    let cancelled = false;
    const timer = setTimeout(() => {
      const element = document.getElementById("qr-reader");
      if (!element || cancelled) return;
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          async (decodedText) => {
            if (cancelled) return;
            await stopScanner();
            await verifyQrRef.current(decodedText);
          },
          () => {}
        )
        .catch(() => {
          if (!cancelled) {
            setCameraError(t("auth.cameraError"));
          }
        });
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      stopScanner();
    };
  }, [open, tab, stopScanner, t]);

  async function verifyPin() {
    if (pin.length !== 4) {
      setError(t("auth.pinLengthError"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinCode: pin }),
      });
      const data = await res.json();
      if (res.ok && data.employee) {
        accept(data.employee);
      } else {
        setError(data.error ?? t("auth.invalidPin"));
        setPin("");
      }
    } catch {
      setError(t("auth.verifyFailed"));
    } finally {
      setLoading(false);
    }
  }

  function press(key: string) {
    setError(null);
    if (key === "CLR") setPin("");
    else if (key === "⌫") setPin((prev) => prev.slice(0, -1));
    else if (pin.length < 4) setPin((prev) => prev + key);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{title ?? t("auth.title")}</h3>
            {description && (
              <p className="mt-1 text-sm text-muted">{description}</p>
            )}
            {allowedRoles && allowedRoles.length > 0 && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                {t("common.requiredRole", { roles: allowedRoles.join(" or ") })}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label={t("auth.close")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-slate-500/10 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-1 rounded-lg bg-slate-500/10 p-1">
          <button
            onClick={() => setTab("qr")}
            className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === "qr"
                ? "bg-surface text-foreground shadow"
                : "text-muted hover:text-foreground"
            }`}
          >
            <ScanLine className="h-4 w-4" />
            {t("common.scanQr")}
          </button>
          <button
            onClick={() => setTab("pin")}
            className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === "pin"
                ? "bg-surface text-foreground shadow"
                : "text-muted hover:text-foreground"
            }`}
          >
            <KeyRound className="h-4 w-4" />
            {t("common.enterPin")}
          </button>
        </div>

        {success ? (
          <div className="mt-6 flex flex-col items-center gap-2 py-6">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="font-semibold">{success.name}</p>
            <p className="text-sm text-muted">{success.position}</p>
          </div>
        ) : tab === "qr" ? (
          <div className="mt-4">
            <div className="relative overflow-hidden rounded-xl border border-border bg-slate-500/5">
              <div id="qr-reader" className="mx-auto w-full max-w-[260px]" />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>
            <p className="mt-2 text-center text-xs text-muted">
              {t("auth.qrHint")}
            </p>
            {cameraError && (
              <p className="mt-2 rounded-lg bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-600 dark:text-rose-400">
                {cameraError}
              </p>
            )}
            <button
              onClick={() => setTab("pin")}
              className="mt-3 w-full rounded-lg border border-border py-2 text-sm font-medium text-muted transition-colors hover:border-orange-500 hover:text-foreground"
            >
              {t("auth.qrFallback")}
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder={t("auth.pinPlaceholder")}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-center text-2xl tracking-[0.5em] outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
            />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {keys.map((key) => (
                <button
                  key={key}
                  onClick={() => press(key)}
                  className="flex h-12 items-center justify-center rounded-lg border border-slate-300 bg-white text-lg font-medium text-foreground transition-colors active:bg-orange-500/10"
                >
                  {key === "⌫" ? <Delete className="h-5 w-5" /> : key}
                </button>
              ))}
            </div>
            <button
              onClick={verifyPin}
              disabled={loading || pin.length !== 4}
              className="mt-3 flex w-full items-center justify-center rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("auth.verifyPin")
              )}
            </button>
          </div>
        )}

        {error && !success && (
          <p className="mt-3 rounded-lg bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}