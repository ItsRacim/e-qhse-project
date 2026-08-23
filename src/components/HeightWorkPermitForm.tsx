"use client";

import { useState } from "react";
import { CheckSquare, Plus, Trash2, XSquare, Lock, CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";
import {
  emptyHeightWorkDetails,
  type HeightWorkDetails,
  type YesNo,
  type PermitStatus,
} from "@/lib/height-work";
import { useLanguage, type TranslationKey } from "@/lib/i18n/language-context";

type SectionCardProps = {
  title: string;
  step: string;
  children: React.ReactNode;
};

function SectionCard({ title, step, children }: SectionCardProps) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-sky-50/70 px-4 py-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-700 text-xs font-bold text-white">
          {step}
        </span>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="space-y-3 p-4">{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-xs font-medium text-slate-500">
      {children}
    </label>
  );
}

type YesNoFieldProps = {
  label: string;
  value: YesNo;
  onChange: (value: YesNo) => void;
};

function YesNoField({ label, value, onChange }: YesNoFieldProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-sm text-slate-800">{label}</span>
      <div className="flex gap-2">
        {(["oui", "non"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
              value === option
                ? "border-orange-500 bg-orange-50 font-semibold text-orange-700"
                : "border-slate-300 bg-white text-slate-600 hover:border-orange-400 hover:text-orange-700"
            }`}
          >
            {option === "oui" ? t("heightWork.yes") : t("heightWork.no")}
          </button>
        ))}
      </div>
    </div>
  );
}

type CheckFieldProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function CheckField({ label, checked, onChange }: CheckFieldProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-start text-sm transition-colors ${
        checked
          ? "border-orange-500 bg-orange-50 text-slate-800"
          : "border-slate-300 bg-white text-slate-600 hover:border-orange-400"
      }`}
    >
      {checked ? (
        <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
      ) : (
        <XSquare className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      )}
      <span>{label}</span>
    </button>
  );
}

type HeightWorkPermitFormProps = {
  onChange: (details: HeightWorkDetails) => void;
  status: PermitStatus;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  onApprove?: (approverName: string) => Promise<void>;
  onReject?: (reason: string) => Promise<void>;
  isQhseEngineer?: boolean;
};

export default function HeightWorkPermitForm({
  onChange,
  status,
  approvedByName,
  approvedAt,
  rejectionReason,
  onApprove,
  onReject,
  isQhseEngineer,
}: HeightWorkPermitFormProps) {
  const { t } = useLanguage();
  const [details, setDetails] = useState<HeightWorkDetails>(
    emptyHeightWorkDetails()
  );
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(next: HeightWorkDetails) {
    setDetails(next);
    onChange(next);
  }

  function patch<T>(key: keyof HeightWorkDetails, value: T) {
    update({ ...details, [key]: value });
  }

  const isReadOnly = status === "PENDING_APPROVAL" || status === "APPROVED";

  const statusBadgeClasses: Record<PermitStatus, string> = {
    DRAFT: "bg-slate-100 text-slate-700",
    PENDING_APPROVAL: "bg-amber-100 text-amber-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-rose-100 text-rose-700",
  };

  const statusLabels: Record<PermitStatus, string> = {
    DRAFT: t("workPermits.statusDraft"),
    PENDING_APPROVAL: t("workPermits.statusPendingApproval"),
    APPROVED: t("workPermits.statusApproved"),
    REJECTED: t("workPermits.statusRejected"),
  };

  const inputCls = `w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500 ${
    isReadOnly ? "bg-slate-50 cursor-not-allowed" : "bg-white"
  }`;

  const handleApprove = async () => {
    if (!onApprove) return;
    setIsSubmitting(true);
    try {
      await onApprove("Ingénieur QHSE");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!onReject || !rejectReason.trim()) return;
    setIsSubmitting(true);
    try {
      await onReject(rejectReason.trim());
      setShowRejectModal(false);
      setRejectReason("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <span className="text-xs font-medium text-slate-500">
          {t("workPermits.statusLabel")}
        </span>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadgeClasses[status]}`}>
          {statusLabels[status]}
        </span>
        {isReadOnly && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            <Lock className="h-3 w-3" />
            {t("workPermits.formLocked")}
          </span>
        )}
      </div>

      {/* Approval Audit Metadata Banner */}
      {status === "APPROVED" && approvedByName && (
        <div className="mb-4 flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-800">
              {t("workPermits.approvedByBadge", { name: approvedByName, date: formatDate(approvedAt) })}
            </p>
          </div>
        </div>
      )}

      {status === "REJECTED" && rejectionReason && (
        <div className="mb-4 flex items-start gap-3 p-3 rounded-lg bg-rose-50 border border-rose-200">
          <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-rose-800">
              {t("workPermits.rejectedByBadge", { reason: rejectionReason })}
            </p>
          </div>
        </div>
      )}

      {/* QHSE Review Action Box for PENDING_APPROVAL */}
      {status === "PENDING_APPROVAL" && isQhseEngineer && (
        <div className="mb-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-800">
                {t("workPermits.qhseReviewRequired")}
              </h4>
              <p className="mt-1 text-xs text-amber-700">
                {t("workPermits.qhseReviewDescription")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleApprove}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {t("workPermits.approveButton")}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowRejectModal(true)}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              {t("workPermits.rejectButton")}
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {t("workPermits.rejectTitle")}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {t("workPermits.rejectDescription")}
                </p>
              </div>
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(""); }}
                aria-label={t("common.close")}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-slate-500/10 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-slate-500">
                {t("workPermits.rejectReasonLabel")} <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder={t("workPermits.rejectReasonPlaceholder")}
                className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(""); }}
                className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-foreground transition-colors hover:border-orange-500"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleReject}
                disabled={isSubmitting || !rejectReason.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-rose-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    {t("workPermits.rejectConfirm")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <SectionCard step="1" title={t("heightWork.generalTitle")}>
        <div>
          <FieldLabel>{t("heightWork.descriptionLabel")}</FieldLabel>
          <textarea
            rows={3}
            value={details.description}
            onChange={(e) => patch("description", e.target.value)}
            placeholder={t("heightWork.descriptionPlaceholder")}
            className={`${inputCls} resize-none`}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>{t("heightWork.permitFolio")}</FieldLabel>
            <input
              type="text"
              value={details.permitFolio}
              onChange={(e) => patch("permitFolio", e.target.value)}
              placeholder={t("heightWork.permitFolioPlaceholder")}
              className={inputCls}
            />
          </div>
          <div>
            <FieldLabel>{t("heightWork.workDate")}</FieldLabel>
            <input
              type="datetime-local"
              value={details.workDate}
              onChange={(e) => patch("workDate", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <FieldLabel>{t("heightWork.endDate")}</FieldLabel>
            <input
              type="datetime-local"
              value={details.endDate}
              onChange={(e) => patch("endDate", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
          <p className="mb-2 text-sm font-medium text-slate-800">
            {t("heightWork.riskAnalysisExisting")}
          </p>
          <YesNoField
            label=""
            value={details.riskAnalysis.existing}
            onChange={(existing) =>
              update({
                ...details,
                riskAnalysis: { ...details.riskAnalysis, existing },
              })
            }
          />
          <div className="mt-3">
            <FieldLabel>{t("heightWork.riskAnalysisNumber")}</FieldLabel>
            <input
              type="text"
              value={details.riskAnalysis.farNumber}
              onChange={(e) =>
                update({
                  ...details,
                  riskAnalysis: {
                    ...details.riskAnalysis,
                    farNumber: e.target.value,
                  },
                })
              }
              placeholder="FAR / Fech N°"
              className={inputCls}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard step="A" title={t("heightWork.sectionATitle")}>
        <YesNoField
          label={t("heightWork.eliminationAuSol")}
          value={details.fallRisk.eliminationAuSol ? "oui" : "non"}
          onChange={(value) =>
            update({
              ...details,
              fallRisk: {
                ...details.fallRisk,
                eliminationAuSol: value === "oui",
              },
            })
          }
        />
        <YesNoField
          label={t("heightWork.protectionCollectiveFixe")}
          value={details.fallRisk.protectionCollectiveFixe ? "oui" : "non"}
          onChange={(value) =>
            update({
              ...details,
              fallRisk: {
                ...details.fallRisk,
                protectionCollectiveFixe: value === "oui",
              },
            })
          }
        />
        <YesNoField
          label={t("heightWork.protectionCollectiveTemporaire")}
          value={details.fallRisk.protectionCollectiveTemporaire ? "oui" : "non"}
          onChange={(value) =>
            update({
              ...details,
              fallRisk: {
                ...details.fallRisk,
                protectionCollectiveTemporaire: value === "oui",
              },
            })
          }
        />
        <div>
          <FieldLabel>{t("heightWork.futureImprovements")}</FieldLabel>
          <textarea
            rows={2}
            value={details.fallRisk.futureImprovements}
            onChange={(e) =>
              update({
                ...details,
                fallRisk: {
                  ...details.fallRisk,
                  futureImprovements: e.target.value,
                },
              })
            }
            className={`${inputCls} resize-none`}
          />
        </div>
      </SectionCard>

      <SectionCard step="B" title={t("heightWork.sectionBTitle")}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <CheckField
            label={t("heightWork.retenueDeChute")}
            checked={details.protectionSystems.retenueDeChute}
            onChange={(checked) =>
              update({
                ...details,
                protectionSystems: {
                  ...details.protectionSystems,
                  retenueDeChute: checked,
                },
              })
            }
          />
          <CheckField
            label={t("heightWork.stopChuteEnrouleur")}
            checked={details.protectionSystems.stopChuteEnrouleur}
            onChange={(checked) =>
              update({
                ...details,
                protectionSystems: {
                  ...details.protectionSystems,
                  stopChuteEnrouleur: checked,
                },
              })
            }
          />
          <CheckField
            label={t("heightWork.arretDeChute")}
            checked={details.protectionSystems.arretDeChute}
            onChange={(checked) =>
              update({
                ...details,
                protectionSystems: {
                  ...details.protectionSystems,
                  arretDeChute: checked,
                },
              })
            }
          />
          <CheckField
            label={t("heightWork.travauxSurCordes")}
            checked={details.protectionSystems.travauxSurCordes}
            onChange={(checked) =>
              update({
                ...details,
                protectionSystems: {
                  ...details.protectionSystems,
                  travauxSurCordes: checked,
                },
              })
            }
          />
        </div>
      </SectionCard>

      <SectionCard step="C" title={t("heightWork.sectionCTitle")}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <CheckField
            label={t("heightWork.validationPointAncrage")}
            checked={details.anchorRules.validationPointAncrage}
            onChange={(checked) =>
              update({
                ...details,
                anchorRules: { ...details.anchorRules, validationPointAncrage: checked },
              })
            }
          />
          <CheckField
            label={t("heightWork.validationTirantAir")}
            checked={details.anchorRules.validationTirantAir}
            onChange={(checked) =>
              update({
                ...details,
                anchorRules: { ...details.anchorRules, validationTirantAir: checked },
              })
            }
          />
          <CheckField
            label={t("heightWork.verificationEtatPointAncrage")}
            checked={details.anchorRules.verificationEtatPointAncrage}
            onChange={(checked) =>
              update({
                ...details,
                anchorRules: {
                  ...details.anchorRules,
                  verificationEtatPointAncrage: checked,
                },
              })
            }
          />
          <CheckField
            label={t("heightWork.confirmationBalissage")}
            checked={details.anchorRules.confirmationBalissage}
            onChange={(checked) =>
              update({
                ...details,
                anchorRules: { ...details.anchorRules, confirmationBalissage: checked },
              })
            }
          />
        </div>
      </SectionCard>

      <SectionCard step="D" title={t("heightWork.sectionDTitle")}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <CheckField
            label={t("heightWork.effectifMinimum")}
            checked={details.rescue.effectifMinimum}
            onChange={(checked) =>
              update({ ...details, rescue: { ...details.rescue, effectifMinimum: checked } })
            }
          />
          <CheckField
            label={t("heightWork.supervisionPermanente")}
            checked={details.rescue.supervisionPermanente}
            onChange={(checked) =>
              update({ ...details, rescue: { ...details.rescue, supervisionPermanente: checked } })
            }
          />
          <CheckField
            label={t("heightWork.kitSauvetage")}
            checked={details.rescue.kitSauvetage}
            onChange={(checked) =>
              update({ ...details, rescue: { ...details.rescue, kitSauvetage: checked } })
            }
          />
        </div>
        <YesNoField
          label={t("heightWork.besoinNacelle")}
          value={details.rescue.besoinNacelle}
          onChange={(besoinNacelle) =>
            update({ ...details, rescue: { ...details.rescue, besoinNacelle } })
          }
        />
      </SectionCard>

      <SectionCard step="E" title={t("heightWork.sectionETitle")}>
        {details.personnel.length > 0 && (
          <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-slate-700">
                {t("heightWork.workersValidationStatus")}
              </span>
              {details.workersValidated ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  {t("heightWork.workersValidatedBadge", { count: details.personnel.length })}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  {t("heightWork.workersPendingBadge", { count: details.personnel.length })}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() =>
                update({
                  ...details,
                  workersValidated: !details.workersValidated,
                })
              }
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                details.workersValidated
                  ? "bg-green-100 border border-green-300 text-green-700 hover:bg-green-200"
                  : "bg-slate-100 border border-slate-300 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {details.workersValidated ? (
                <>
                  <CheckSquare className="h-4 w-4" />
                  {t("heightWork.workersValidated")}
                </>
              ) : (
                <>
                  <XSquare className="h-4 w-4" />
                  {t("heightWork.validateAllWorkers")}
                </>
              )}
            </button>
          </div>
        )}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead>
              <tr className="bg-sky-700 text-left text-white">
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                  {t("heightWork.workerName")}
                </th>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                  {t("heightWork.harnessSerial")}
                </th>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                  {t("heightWork.trainingDate")}
                </th>
                <th className="w-12 px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {details.personnel.map((worker, index) => (
                <tr
                  key={index}
                  className={
                    index % 2 === 0
                      ? "bg-white"
                      : "bg-amber-50/40"
                  }
                >
                  <td className="px-3 py-2 align-top">
                    <input
                      type="text"
                      value={worker.name}
                      onChange={(e) =>
                        update({
                          ...details,
                          personnel: details.personnel.map((w, i) =>
                            i === index ? { ...w, name: e.target.value } : w
                          ),
                        })
                      }
                      placeholder={t("heightWork.namePlaceholder")}
                      className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      type="text"
                      value={worker.harnessSerial}
                      onChange={(e) =>
                        update({
                          ...details,
                          personnel: details.personnel.map((w, i) =>
                            i === index ? { ...w, harnessSerial: e.target.value } : w
                          ),
                        })
                      }
                      placeholder={t("heightWork.harnessSerialPlaceholder")}
                      className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      type="date"
                      value={worker.trainingDate}
                      onChange={(e) =>
                        update({
                          ...details,
                          personnel: details.personnel.map((w, i) =>
                            i === index ? { ...w, trainingDate: e.target.value } : w
                          ),
                        })
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <button
                      type="button"
                      onClick={() =>
                        update({
                          ...details,
                          personnel: details.personnel.filter((_, i) => i !== index),
                        })
                      }
                      aria-label={t("heightWork.removeIntervener")}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {details.personnel.length === 0 && (
                <tr className="bg-white">
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-sm text-slate-400"
                  >
                    {t("heightWork.noPersonnel")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={() =>
            update({
              ...details,
              personnel: [
                ...details.personnel,
                { name: "", harnessSerial: "", trainingDate: "" },
              ],
            })
          }
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-sky-300 bg-sky-50 py-2 text-sm font-medium text-sky-700 transition-colors hover:border-sky-500 hover:bg-sky-100"
        >
          <Plus className="h-4 w-4" />
          {t("heightWork.addIntervener")}
        </button>
      </SectionCard>

      <SectionCard step="F" title={t("heightWork.sectionFTitle")}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="mb-2 text-sm font-medium text-slate-800">
              {t("heightWork.chargeDesTravaux")}
            </p>
            <input
              type="text"
              value={details.closing.chargeDesTravaux.name}
              onChange={(e) =>
                update({
                  ...details,
                  closing: {
                    ...details.closing,
                    chargeDesTravaux: {
                      ...details.closing.chargeDesTravaux,
                      name: e.target.value,
                    },
                  },
                })
              }
              placeholder={t("heightWork.namePlaceholder")}
              className={inputCls}
            />
            <div className="mt-3">
              
              
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="mb-2 text-sm font-medium text-slate-800">
              {t("heightWork.responsableSecurite")}
            </p>
            <input
              type="text"
              value={details.closing.responsableSecurite.name}
              onChange={(e) =>
                update({
                  ...details,
                  closing: {
                    ...details.closing,
                    responsableSecurite: {
                      ...details.closing.responsableSecurite,
                      name: e.target.value,
                    },
                  },
                })
              }
              placeholder={t("heightWork.namePlaceholder")}
              className={inputCls}
            />
            <div className="mt-3">
              
              
            </div>
          </div>
        </div>
      </SectionCard>
    </>
  );
}

export function validateHeightWorkDetails(
  details: HeightWorkDetails,
  t: (key: TranslationKey) => string
): string | null {
  if (details.personnel.length === 0 || !details.workersValidated) {
    return t("heightWork.validationErrorPersonnelAndValidation");
  }
  return null;
}