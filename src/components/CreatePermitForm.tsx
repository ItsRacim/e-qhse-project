"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  ShieldCheck,
  UserPlus,
  UserCheck,
  X,
} from "lucide-react";
import Badge from "@/components/Badge";
import HeightWorkPermitForm from "@/components/HeightWorkPermitForm";
import QuickAuthModal from "@/components/QuickAuthModal";
import { permitTypeVariant } from "@/lib/badges";
import type { SafeEmployee } from "@/lib/employee";
import {
  emptyHeightWorkDetails,
  type HeightWorkDetails,
} from "@/lib/height-work";
import { validateHeightWorkDetails } from "@/components/HeightWorkPermitForm";
import { useLanguage } from "@/lib/i18n/language-context";

type ModalState = {
  mode: "applicant" | "worker";
} | null;

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500";

export default function CreatePermitForm({
  initialType = "",
}: {
  initialType?: string;
}) {
  const router = useRouter();
  const { t, tEnum } = useLanguage();
  const permitType = initialType;
  const isHeightWork = initialType === "HEIGHT_WORK";
  const [heightDetails, setHeightDetails] = useState<HeightWorkDetails>(
    emptyHeightWorkDetails()
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [applicant, setApplicant] = useState<SafeEmployee | null>(null);
  const [workers, setWorkers] = useState<SafeEmployee[]>([]);
  const [modal, setModal] = useState<ModalState>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialType) {
      setTitle(`[${tEnum("permitType", initialType)}] - `);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const modalTitle = t(
    modal?.mode === "applicant"
      ? "workPermits.applicantTitle"
      : "workPermits.workersTitle"
  );
  const modalDescription = t(
    modal?.mode === "applicant"
      ? "workPermits.applicantDescription"
      : "workPermits.workersDescription"
  );

  function handleVerified(employee: SafeEmployee) {
    if (!modal) return;
    if (modal.mode === "applicant") {
      setApplicant(employee);
    } else {
      if (workers.some((w) => w.id === employee.id)) {
        setFormError(t("workPermits.workersDupe"));
        return;
      }
      if (applicant?.id === employee.id) {
        setFormError(t("workPermits.workersApplicantConflict"));
        return;
      }
      setWorkers((prev) => [...prev, employee]);
    }
  }

  function removeWorker(id: string) {
    setWorkers((prev) => prev.filter((w) => w.id !== id));
  }

  async function handleSubmit() {
    setFormError(null);
    if (!permitType) {
      setFormError(t("workPermits.permitTypeRequired"));
      return;
    }
    if (!applicant) {
      setFormError(t("workPermits.submitError"));
      return;
    }
    if (!title.trim() || !content.trim()) {
      setFormError(t("workPermits.submitTitleError"));
      return;
    }
    if (workers.length === 0) {
      setFormError(t("workPermits.submitWorkersError"));
      return;
    }
    if (!startDate) {
      setFormError(t("workPermits.startDateRequired"));
      return;
    }
    if (!endDate) {
      setFormError(t("workPermits.endDateRequired"));
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end.getTime() <= start.getTime()) {
      setFormError(t("workPermits.endDateAfterStartError"));
      return;
    }
    if (isHeightWork) {
      const validationError = validateHeightWorkDetails(heightDetails, t);
      if (validationError) {
        setFormError(validationError);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/work-permits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          permitType,
          content,
          location,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          details: isHeightWork ? heightDetails : undefined,
          applicantId: applicant.id,
          workerIds: workers.map((w) => w.id),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? t("workPermits.submitFailed"));
        return;
      }
      setSuccess(true);
      router.refresh();
    } catch {
      setFormError(t("workPermits.networkError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">
          {t("workPermits.createTitle")}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t("workPermits.description")}
        </p>
      </div>

      {success && (
        <div className="mb-6 flex flex-col items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-50 px-6 py-6 text-center shadow-sm">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-700">
            {t("workPermits.submitted")}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => window.close()}
              className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-800"
            >
              {t("workPermits.closeTab")}
            </button>
            <Link
              href="/work-permits"
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-sky-500 hover:text-sky-700"
            >
              <ExternalLink className="h-4 w-4" />
              {t("workPermits.title")}
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {permitType && (
          <div className="mb-4 flex items-center gap-2">
            <Badge
              variant={
                permitTypeVariant[permitType as keyof typeof permitTypeVariant]
              }
            >
              {tEnum("permitType", permitType)}
            </Badge>
            <span className="text-xs text-slate-500">
              {t("workPermits.permitTypeSelected")}
            </span>
          </div>
        )}

        <label className="mb-1 block text-xs font-medium text-slate-500">
          {t("common.title")}
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("workPermits.titlePlaceholder")}
          className={`${inputCls} mb-4`}
        />

        <label className="mb-1 block text-xs font-medium text-slate-500">
          {t("workPermits.contentLabel")}
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder={t("workPermits.contentPlaceholder")}
          className={`${inputCls} mb-4 resize-none`}
        />

        <label className="mb-1 block text-xs font-medium text-slate-500">
          {t("workPermits.locationLabel")}
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t("workPermits.locationPlaceholder")}
          className={`${inputCls} mb-4`}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {t("workPermits.startDateLabel")} <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {t("workPermits.endDateLabel")} <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {isHeightWork && <HeightWorkPermitForm onChange={setHeightDetails} />}

        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-slate-500">
            {t("workPermits.applicantLabel")}
          </label>
          {applicant ? (
            <div className="flex items-center justify-between rounded-lg border border-emerald-500/40 bg-emerald-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {applicant.name}
                  </p>
                  <p className="text-xs text-slate-500">{applicant.position}</p>
                </div>
              </div>
              <button
                onClick={() => setApplicant(null)}
                aria-label={t("workPermits.removeApplicant")}
                className="text-slate-400 hover:text-rose-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setModal({ mode: "applicant" })}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-500 transition-colors hover:border-orange-500 hover:text-orange-700"
            >
              <ShieldCheck className="h-4 w-4" />
              {t("workPermits.applicantEmpty")}
            </button>
          )}
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-slate-500">
            {t("workPermits.workersLabel", { count: workers.length })}
          </label>
          {workers.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {workers.map((worker) => (
                <span
                  key={worker.id}
                  className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
                >
                  {worker.name}
                  <button
                    onClick={() => removeWorker(worker.id)}
                    aria-label={t("workPermits.removeWorker", { name: worker.name })}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <button
            onClick={() => setModal({ mode: "worker" })}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-500 transition-colors hover:border-orange-500 hover:text-orange-700"
          >
            <UserPlus className="h-4 w-4" />
            {t("workPermits.workersEmpty")}
          </button>
        </div>

        {formError && (
          <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-center text-sm text-rose-700">
            {formError}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex w-full items-center justify-center rounded-lg bg-orange-600 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-orange-700 disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t("common.submitForApproval")
          )}
        </button>
      </div>

      <QuickAuthModal
        open={modal !== null}
        onClose={() => setModal(null)}
        onVerified={handleVerified}
        title={modalTitle}
        description={modalDescription}
      />
    </>
  );
}