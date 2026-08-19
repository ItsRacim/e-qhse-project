"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  CalendarClock,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Forklift,
  Hammer,
  Loader2,
  MapPin,
  Mountain,
  Printer,
  ShieldCheck,
  Snowflake,
  TimerReset,
  X,
  Zap,
} from "lucide-react";
import Badge from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import QuickAuthModal from "@/components/QuickAuthModal";
import { permitTypeVariant, reportStatusVariant } from "@/lib/badges";
import type { SafeEmployee } from "@/lib/employee";
import { useLanguage } from "@/lib/i18n/language-context";

const permitTypes = [
  "HOT_WORK",
  "COLD_WORK",
  "CONFINED_SPACE",
  "HEIGHT_WORK",
  "ELECTRICAL_LOTO",
  "EXCAVATION",
  "LIFTING",
] as const;

const permitTypeIcons: Record<string, typeof Flame> = {
  HOT_WORK: Flame,
  COLD_WORK: Snowflake,
  CONFINED_SPACE: Box,
  HEIGHT_WORK: Mountain,
  ELECTRICAL_LOTO: Zap,
  EXCAVATION: Hammer,
  LIFTING: Forklift,
};

const EXPIRING_SOON_MS = 2 * 60 * 60 * 1000;

type PermitPerson = {
  id: string;
  name: string;
  position: string;
  role: string;
};

type Permit = {
  id: string;
  title: string;
  content: string;
  location: string | null;
  permitType: string | null;
  status: string;
  approvedHash: string | null;
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
  extendedUntil: string | null;
  extensionReason: string | null;
  extensionCount: number;
  createdBy: PermitPerson | null;
  approvedBy: PermitPerson | null;
  authorizedWorkers: { id: string; name: string; position: string }[];
};

type ModalState = {
  mode: "approve" | "extend";
  permitId?: string;
} | null;

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function effectiveEnd(permit: Permit): Date | null {
  if (!permit.endDate) return null;
  if (permit.extendedUntil) return new Date(permit.extendedUntil);
  return new Date(permit.endDate);
}

function effectiveStatus(permit: Permit): string {
  const end = effectiveEnd(permit);
  if (
    (permit.status === "APPROVED" || permit.status === "ACTIVE") &&
    end &&
    end.getTime() <= Date.now()
  ) {
    return "EXPIRED";
  }
  return permit.status;
}

function isExpiringSoon(permit: Permit): boolean {
  const end = effectiveEnd(permit);
  if (!end || permit.status !== "APPROVED") return false;
  const remaining = end.getTime() - Date.now();
  return remaining > 0 && remaining < EXPIRING_SOON_MS;
}

export default function WorkPermitClient({ permits }: { permits: Permit[] }) {
  const router = useRouter();
  const { t, tEnum, language } = useLanguage();
  const [modal, setModal] = useState<ModalState>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [extending, setExtending] = useState<Permit | null>(null);
  const [newEndDate, setNewEndDate] = useState("");
  const [extReason, setExtReason] = useState("");

  const dateLocale =
    language === "ar" ? "ar" : language === "fr" ? "fr-FR" : "en-GB";

  const authTitle = t(
    modal?.mode === "extend"
      ? "workPermits.extendApproverTitle"
      : "workPermits.approveTitle"
  );
  const authDescription = t(
    modal?.mode === "extend"
      ? "workPermits.extendApproverDescription"
      : "workPermits.approveDescription"
  );

  function handleVerified(employee: SafeEmployee) {
    if (modal?.mode === "approve" && modal.permitId) {
      approvePermit(modal.permitId, employee);
    } else if (modal?.mode === "extend" && modal.permitId && extending) {
      extendPermit(extending, employee);
    }
  }

  async function approvePermit(permitId: string, approver: SafeEmployee) {
    setApprovingId(permitId);
    setFormError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/work-permits/${permitId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approverId: approver.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? t("workPermits.approveFailed"));
        return;
      }
      setSuccess(t("workPermits.approvedPin", { name: approver.name }));
      router.refresh();
    } catch {
      setFormError(t("workPermits.approveNetworkError"));
    } finally {
      setApprovingId(null);
    }
  }

  function openExtend(permit: Permit) {
    setFormError(null);
    setSuccess(null);
    setExtending(permit);
    const base = effectiveEnd(permit) ?? new Date();
    setNewEndDate(toLocalInputValue(new Date(base.getTime() + 60 * 60 * 1000)));
    setExtReason("");
  }

  function confirmExtend() {
    if (!extending) return;
    setFormError(null);
    if (!newEndDate) {
      setFormError(t("workPermits.extendNewEndDateRequired"));
      return;
    }
    if (new Date(newEndDate).getTime() <= Date.now()) {
      setFormError(t("workPermits.extendFutureError"));
      return;
    }
    if (!extReason.trim()) {
      setFormError(t("workPermits.extendReasonRequired"));
      return;
    }
    setModal({ mode: "extend", permitId: extending.id });
  }

  async function extendPermit(permit: Permit, approver: SafeEmployee) {
    setApprovingId(permit.id);
    setFormError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/work-permits/${permit.id}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approverId: approver.id,
          newEndDate: new Date(newEndDate).toISOString(),
          reason: extReason.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? t("workPermits.extendFailed"));
        return;
      }
      setSuccess(t("workPermits.extendSuccess"));
      setExtending(null);
      setNewEndDate("");
      setExtReason("");
      router.refresh();
    } catch {
      setFormError(t("workPermits.extendNetworkError"));
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <>
      <PageHeader
        title={t("workPermits.title")}
        description={t("workPermits.description")}
      />
      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}
      {formError && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-400">
          {formError}
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface p-5">
        <div>
          <h2 className="text-sm font-semibold">
            {t("workPermits.selectPermitTypeTitle")}
          </h2>
          <p className="mt-1 text-xs text-muted">
            {t("workPermits.selectPermitTypeHint")}{" "}
            {t("workPermits.permitTypeNewTabHint")}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {permitTypes.map((type) => {
            const Icon = permitTypeIcons[type];
            return (
              <a
                key={type}
                href={`/work-permits/new?type=${type}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-500/60 hover:shadow-lg"
              >
                <div className="flex items-center gap-1.5 border-b border-border bg-slate-100 px-2.5 py-1.5 dark:bg-slate-800/70">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="ms-auto text-muted">
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
                <div className="flex items-start gap-3 p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-500/10 text-muted transition-colors group-hover:text-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">
                      {tEnum("permitType", type)}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted">
                      {t(`workPermits.permitTypeCards.${type}.description`)}
                    </span>
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {permits.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
            <MapPin className="h-8 w-8 text-muted" />
            <p className="mt-2 text-sm text-muted">{t("workPermits.noPermits")}</p>
          </div>
        )}

        {permits.map((permit) => {
          const status = effectiveStatus(permit);
          const end = effectiveEnd(permit);
          const isActive = permit.status === "APPROVED" || permit.status === "ACTIVE";
          const expiring = isExpiringSoon(permit);
          return (
            <div
              key={permit.id}
              className="rounded-xl border border-border bg-surface p-5"
            >
              {expiring && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-xs font-medium text-orange-700 dark:text-orange-400">
                  <Clock className="h-4 w-4 shrink-0" />
                  {t("workPermits.expiringSoon")}
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{permit.title}</h3>
                  <p className="mt-0.5 text-sm text-muted">{permit.content}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {permit.permitType && (
                    <Badge
                      variant={
                        permitTypeVariant[
                          permit.permitType as keyof typeof permitTypeVariant
                        ]
                      }
                    >
                      {tEnum("permitType", permit.permitType)}
                    </Badge>
                  )}
                  <Badge
                    variant={
                      reportStatusVariant[status as keyof typeof reportStatusVariant]
                    }
                  >
                    {tEnum("reportStatus", status)}
                  </Badge>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-muted">
                {permit.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {permit.location}
                  </span>
                )}
                <span>
                  {t("workPermits.applicant", {
                    name: permit.createdBy?.name ?? "—",
                  })}
                </span>
                <span>
                  {permit.approvedBy
                    ? t("workPermits.approvedBy", { name: permit.approvedBy.name })
                    : t("common.awaitingApproval")}
                </span>
                <span>
                  {new Date(permit.createdAt).toLocaleDateString(dateLocale)}
                </span>
                {permit.startDate && (
                  <span className="flex items-center gap-1">
                    <CalendarClock className="h-3 w-3" />
                    {t("workPermits.startDateLabel")}:{" "}
                    {new Date(permit.startDate).toLocaleString(dateLocale)}
                  </span>
                )}
                {end && (
                  <span className="flex flex-wrap items-center gap-1.5">
                    {t("workPermits.endDateLabel")}:{" "}
                    {end.toLocaleString(dateLocale)}
                    {permit.extensionCount > 0 && (
                      <Badge variant="orange">
                        {t("workPermits.extendedBadge", {
                          count: permit.extensionCount,
                        })}
                      </Badge>
                    )}
                  </span>
                )}
              </div>

              {permit.authorizedWorkers.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {permit.authorizedWorkers.map((worker) => (
                    <span
                      key={worker.id}
                      className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs text-muted"
                    >
                      {worker.name}
                    </span>
                  ))}
                </div>
              )}

              {permit.approvedHash && (
                <code className="mt-3 block rounded-lg bg-slate-500/10 px-3 py-2 font-mono text-xs text-muted">
                  {t("workPermits.signature")}: {permit.approvedHash}
                </code>
              )}

              {permit.status === "SUBMITTED" && (
                <button
                  onClick={() =>
                    setModal({ mode: "approve", permitId: permit.id })
                  }
                  disabled={approvingId === permit.id}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  {approvingId === permit.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      {t("workPermits.approveButton")}
                    </>
                  )}
                </button>
              )}

              {permit.status === "APPROVED" && (
                <>
                  {status === "EXPIRED" && (
                    <p className="mt-3 flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400">
                      <Clock className="h-4 w-4" />
                      {t("workPermits.expired")}
                    </p>
                  )}
                  {status !== "EXPIRED" && (
                    <p className="mt-3 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      {t("workPermits.approved")}
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <a
                      href={`/work-permits/${permit.id}/print`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-medium text-foreground transition-colors hover:border-orange-500"
                    >
                      <Printer className="h-4 w-4" />
                      {t("common.printPdf")}
                    </a>
                    {permit.approvedHash && (
                      <a
                        href={`/verify/${permit.approvedHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-medium text-foreground transition-colors hover:border-orange-500"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {t("workPermits.verifyDocument")}
                      </a>
                    )}
                  </div>
                  {isActive && status !== "EXPIRED" && (
                    <button
                      onClick={() => openExtend(permit)}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-orange-500/60 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-500/10 dark:text-orange-400"
                    >
                      <TimerReset className="h-4 w-4" />
                      {t("workPermits.extendButton")}
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {extending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {t("workPermits.extendTitle")}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {t("workPermits.extendDescription")}
                </p>
              </div>
              <button
                onClick={() => setExtending(null)}
                aria-label={t("workPermits.closeExtend")}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-slate-500/10 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-slate-500">
                {t("workPermits.extendNewEndDate")}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-slate-500">
                {t("workPermits.extendReasonLabel")}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={extReason}
                onChange={(e) => setExtReason(e.target.value)}
                rows={3}
                placeholder={t("workPermits.extendReasonPlaceholder")}
                className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {formError && (
              <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-center text-sm text-rose-700">
                {formError}
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setExtending(null)}
                className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-foreground transition-colors hover:border-orange-500"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={confirmExtend}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
              >
                <ShieldCheck className="h-4 w-4" />
                {t("workPermits.extendConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      <QuickAuthModal
        open={modal !== null}
        onClose={() => setModal(null)}
        onVerified={handleVerified}
        title={authTitle}
        description={authDescription}
        allowedRoles={["SUPERVISOR", "INSPECTOR"]}
      />
    </>
  );
}