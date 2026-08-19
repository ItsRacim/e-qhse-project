"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  MapPin,
  ShieldCheck,
  TriangleAlert,
  UserCheck,
  X,
} from "lucide-react";
import Badge from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import QuickAuthModal from "@/components/QuickAuthModal";
import { priorityVariant, reportStatusVariant } from "@/lib/badges";
import type { SafeEmployee } from "@/lib/employee";
import { useLanguage } from "@/lib/i18n/language-context";

type Incident = {
  id: string;
  title: string;
  content: string;
  location: string | null;
  severity: string | null;
  immediateActions: string | null;
  status: string;
  approvedHash: string | null;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    position: string;
    role: string;
  } | null;
  approvedBy: {
    id: string;
    name: string;
    position: string;
    role: string;
  } | null;
};

type ModalState = { mode: "reporter" | "approve"; incidentId?: string } | null;

const severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export default function IncidentClient({ incidents }: { incidents: Incident[] }) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState<string>("MEDIUM");
  const [content, setContent] = useState("");
  const [immediateActions, setImmediateActions] = useState("");
  const [reporter, setReporter] = useState<SafeEmployee | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [submitting, setSubmitting] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const dateLocale = language === "ar" ? "ar" : language === "fr" ? "fr-FR" : "en-GB";

  const modalTitle =
    modal?.mode === "reporter"
      ? t("incidents.reporterTitle")
      : t("incidents.approveTitle");
  const modalDescription =
    modal?.mode === "reporter"
      ? t("incidents.reporterDescription")
      : t("incidents.approveDescription");

  function handleVerified(employee: SafeEmployee) {
    if (!modal) return;
    if (modal.mode === "reporter") {
      setReporter(employee);
    } else if (modal.mode === "approve" && modal.incidentId) {
      approveIncident(modal.incidentId, employee);
    }
  }

  async function handleSubmit() {
    setFormError(null);
    setSuccess(null);
    if (!reporter) {
      setFormError(t("incidents.reporterError"));
      return;
    }
    if (!title.trim() || !content.trim()) {
      setFormError(t("incidents.submitError"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          location,
          severity,
          immediateActions,
          reporterId: reporter.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? t("incidents.submitFailed"));
        return;
      }
      setSuccess(t("incidents.submitted"));
      setTitle("");
      setLocation("");
      setSeverity("MEDIUM");
      setContent("");
      setImmediateActions("");
      setReporter(null);
      router.refresh();
    } catch {
      setFormError(t("incidents.networkError"));
    } finally {
      setSubmitting(false);
    }
  }

  async function approveIncident(incidentId: string, approver: SafeEmployee) {
    setApprovingId(incidentId);
    setFormError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approverId: approver.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? t("incidents.approveFailed"));
        return;
      }
      setSuccess(t("incidents.approvedPin", { name: approver.name }));
      router.refresh();
    } catch {
      setFormError(t("incidents.approveNetworkError"));
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <>
      <PageHeader
        title={t("incidents.title")}
        description={t("incidents.description")}
      />
      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold">{t("incidents.createTitle")}</h2>

          <label className="mb-1 block text-xs font-medium text-muted">
            {t("common.title")}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("incidents.titlePlaceholder")}
            className="mb-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
          />

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                {t("incidents.locationLabel")}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t("incidents.locationPlaceholder")}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                {t("incidents.severityLabel")}
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
              >
                {severities.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="mb-1 block text-xs font-medium text-muted">
            {t("incidents.contentLabel")}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder={t("incidents.contentPlaceholder")}
            className="mb-4 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
          />

          <label className="mb-1 block text-xs font-medium text-muted">
            {t("incidents.immediateActionsLabel")}
          </label>
          <textarea
            value={immediateActions}
            onChange={(e) => setImmediateActions(e.target.value)}
            rows={2}
            placeholder={t("incidents.immediateActionsPlaceholder")}
            className="mb-4 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
          />

          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-muted">
              {t("incidents.reporterLabel")}
            </label>
            {reporter ? (
              <div className="flex items-center justify-between rounded-lg border border-emerald-500/40 bg-emerald-500/5 px-3 py-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium">{reporter.name}</p>
                    <p className="text-xs text-muted">{reporter.position}</p>
                  </div>
                </div>
                <button
                  onClick={() => setReporter(null)}
                  aria-label={t("incidents.removeReporter")}
                  className="text-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setModal({ mode: "reporter" })}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-sm text-muted transition-colors hover:border-orange-500 hover:text-foreground"
              >
                <ShieldCheck className="h-4 w-4" />
                {t("incidents.reporterEmpty")}
              </button>
            )}
          </div>

          {formError && (
            <p className="mb-3 rounded-lg bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-600 dark:text-rose-400">
              {formError}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-lg bg-rose-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-500 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("incidents.submit")
            )}
          </button>
        </div>

        <div className="space-y-4">
          {incidents.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
              <TriangleAlert className="h-8 w-8 text-muted" />
              <p className="mt-2 text-sm text-muted">{t("incidents.noIncidents")}</p>
            </div>
          )}

          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{incident.title}</h3>
                  <p className="mt-0.5 text-sm text-muted">{incident.content}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {incident.severity && (
                    <Badge
                      variant={
                        priorityVariant[
                          incident.severity as keyof typeof priorityVariant
                        ]
                      }
                    >
                      {incident.severity}
                    </Badge>
                  )}
                  <Badge
                    variant={
                      reportStatusVariant[
                        incident.status as keyof typeof reportStatusVariant
                      ]
                    }
                  >
                    {incident.status}
                  </Badge>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
                {incident.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {incident.location}
                  </span>
                )}
                <span>
                  {t("incidents.reportedBy", { name: incident.createdBy?.name ?? "—" })}
                </span>
                <span>
                  {incident.approvedBy
                    ? t("incidents.approvedBy", { name: incident.approvedBy.name })
                    : t("incidents.awaitingApproval")}
                </span>
                <span>
                  {new Date(incident.createdAt).toLocaleDateString(dateLocale)}
                </span>
              </div>

              {incident.immediateActions && (
                <p className="mt-3 rounded-lg bg-slate-500/5 px-3 py-2 text-sm text-foreground/80">
                  <span className="font-medium">
                    {t("incidents.immediateActionsLabelInline")}
                  </span>
                  {incident.immediateActions}
                </p>
              )}

              {incident.approvedHash && (
                <code className="mt-3 block break-all rounded-lg bg-slate-500/10 px-3 py-2 font-mono text-xs text-muted">
                  {t("incidents.auditHash", { hash: incident.approvedHash })}
                </code>
              )}

              {incident.status === "SUBMITTED" && (
                <button
                  onClick={() =>
                    setModal({ mode: "approve", incidentId: incident.id })
                  }
                  disabled={approvingId === incident.id}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  {approvingId === incident.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      {t("incidents.approveButton")}
                    </>
                  )}
                </button>
              )}

              {incident.status === "APPROVED" && (
                <div className="mt-3 flex gap-2">
                  <p className="flex flex-1 items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    {t("incidents.sealed")}
                  </p>
                  {incident.approvedHash && (
                    <a
                      href={`/verify/${incident.approvedHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-orange-500 hover:text-foreground"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {t("common.verify")}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <QuickAuthModal
        open={modal !== null}
        onClose={() => setModal(null)}
        onVerified={handleVerified}
        title={modalTitle}
        description={modalDescription}
        allowedRoles={modal?.mode === "approve" ? ["SUPERVISOR", "INSPECTOR"] : undefined}
      />
    </>
  );
}