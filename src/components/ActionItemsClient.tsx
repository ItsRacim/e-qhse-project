"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ClipboardList,
  Link2,
  Loader2,
  Play,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import Badge from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import QuickAuthModal from "@/components/QuickAuthModal";
import {
  correctiveActionStatusVariant,
  priorityVariant,
} from "@/lib/badges";
import type { SafeEmployee } from "@/lib/employee";
import {
  useLanguage,
  type TranslationKey,
} from "@/lib/i18n/language-context";

type ActionItem = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string;
  createdAt: string;
  assignedTo: {
    id: string;
    name: string;
    position: string;
    department: string;
  } | null;
  report: { id: string; title: string; type: string } | null;
};

type Option = {
  id: string;
  name: string;
  position: string;
  department: string;
};

type LinkableReport = {
  id: string;
  title: string;
  type: string;
};

type ModalState = {
  mode: "status";
  itemId: string;
  nextStatus: string;
} | null;

const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

const transition: Record<
  string,
  { status: string; labelKey: TranslationKey; managerOnly: boolean }
> = {
  OPEN: {
    status: "IN_PROGRESS",
    labelKey: "actionItems.startWork",
    managerOnly: false,
  },
  IN_PROGRESS: {
    status: "RESOLVED",
    labelKey: "actionItems.markResolved",
    managerOnly: false,
  },
  RESOLVED: {
    status: "VERIFIED",
    labelKey: "actionItems.verifyClosure",
    managerOnly: true,
  },
};

export default function ActionItemsClient({
  actionItems,
  employees,
  reports,
}: {
  actionItems: ActionItem[];
  employees: Option[];
  reports: LinkableReport[];
}) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const dateLocale = language === "ar" ? "ar" : language === "fr" ? "fr-FR" : "en-GB";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<string>("MEDIUM");
  const [reportId, setReportId] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleVerified(employee: SafeEmployee) {
    if (!modal || modal.mode !== "status") return;
    updateStatus(modal.itemId, modal.nextStatus, employee);
  }

  async function handleSubmit() {
    setFormError(null);
    setSuccess(null);
    if (!title.trim() || !assignedToId || !dueDate) {
      setFormError(t("actionItems.error"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/action-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          assignedToId,
          dueDate: new Date(dueDate).toISOString(),
          priority,
          reportId: reportId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? t("actionItems.createFailed"));
        return;
      }
      setSuccess(t("actionItems.created"));
      setTitle("");
      setDescription("");
      setAssignedToId("");
      setDueDate("");
      setPriority("MEDIUM");
      setReportId("");
      router.refresh();
    } catch {
      setFormError(t("actionItems.networkError"));
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(
    itemId: string,
    nextStatus: string,
    verifier: SafeEmployee
  ) {
    setUpdatingId(itemId);
    setFormError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/action-items/${itemId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, verifierId: verifier.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? t("actionItems.statusFailed"));
        return;
      }
      setSuccess(t("actionItems.statusUpdate", { name: verifier.name }));
      router.refresh();
    } catch {
      setFormError(t("actionItems.networkErrorStatus"));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <>
      <PageHeader
        title={t("actionItems.title")}
        description={t("actionItems.description")}
      />
      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold">{t("actionItems.createTitle")}</h2>

          <label className="mb-1 block text-xs font-medium text-muted">
            {t("common.title")}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("actionItems.titlePlaceholder")}
            className="mb-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
          />

          <label className="mb-1 block text-xs font-medium text-muted">
            {t("actionItems.descriptionLabel")}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder={t("actionItems.descriptionPlaceholder")}
            className="mb-4 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
          />

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                {t("actionItems.assignedToLabel")}
              </label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
              >
                <option value="">{t("actionItems.assigneeSelect")}</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} — {employee.position}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                {t("actionItems.dueDateLabel")}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                {t("actionItems.priorityLabel")}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                {t("actionItems.linkLabel")}
              </label>
              <select
                value={reportId}
                onChange={(e) => setReportId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
              >
                <option value="">{t("actionItems.linkNone")}</option>
                {reports.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.type} — {report.title.slice(0, 40)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formError && (
            <p className="mb-3 rounded-lg bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-600 dark:text-rose-400">
              {formError}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("actionItems.createButton")
            )}
          </button>
        </div>

        <div className="space-y-4">
          {actionItems.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
              <ClipboardList className="h-8 w-8 text-muted" />
              <p className="mt-2 text-sm text-muted">{t("actionItems.noItems")}</p>
            </div>
          )}

          {actionItems.map((item) => {
            const next = transition[item.status];
            const managerOnly = next?.managerOnly ?? false;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    {item.description && (
                      <p className="mt-0.5 text-sm text-muted">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge
                      variant={
                        priorityVariant[
                          item.priority as keyof typeof priorityVariant
                        ]
                      }
                    >
                      {item.priority}
                    </Badge>
                    <Badge
                      variant={
                        correctiveActionStatusVariant[
                          item.status as keyof typeof correctiveActionStatusVariant
                        ]
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    {item.assignedTo?.name ?? "—"} ({item.assignedTo?.position ?? "—"})
                  </span>
                  <span>
                    {t("actionItems.due", {
                      date: new Date(item.dueDate).toLocaleDateString(dateLocale),
                    })}
                  </span>
                  {item.report && (
                    <span className="flex items-center gap-1">
                      <Link2 className="h-3 w-3" />
                      {item.report.type}: {item.report.title}
                    </span>
                  )}
                </div>

                {next && (
                  <button
                    onClick={() =>
                      setModal({
                        mode: "status",
                        itemId: item.id,
                        nextStatus: next.status,
                      })
                    }
                    disabled={updatingId === item.id}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-medium text-foreground transition-colors hover:border-orange-500 disabled:opacity-50"
                  >
                    {updatingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {managerOnly ? (
                          <ShieldCheck className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                        {t(next.labelKey)}
                        {managerOnly
                          ? t("actionItems.managerOnly")
                          : t("actionItems.verified")}
                      </>
                    )}
                  </button>
                )}

                {!next && (
                  <p className="mt-3 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    {t("actionItems.closedVerified")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <QuickAuthModal
        open={modal !== null}
        onClose={() => setModal(null)}
        onVerified={handleVerified}
        title={
          modal?.nextStatus === "VERIFIED"
            ? t("actionItems.verifyTitle")
            : t("actionItems.confirmTitle")
        }
        description={
          modal?.nextStatus === "VERIFIED"
            ? t("actionItems.verifyDescription")
            : t("actionItems.confirmDescription")
        }
        allowedRoles={
          modal?.nextStatus === "VERIFIED" ? ["SUPERVISOR", "INSPECTOR"] : undefined
        }
      />
    </>
  );
}