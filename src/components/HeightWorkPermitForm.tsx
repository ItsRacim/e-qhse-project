"use client";

import { useState } from "react";
import { CheckSquare, Plus, Trash2, XSquare } from "lucide-react";
import {
  emptyHeightWorkDetails,
  type HeightWorkDetails,
  type YesNo,
} from "@/lib/height-work";
import { useLanguage } from "@/lib/i18n/language-context";

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
            onClick={() => onChange(value === option ? "" : option)}
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
};

export default function HeightWorkPermitForm({
  onChange,
}: HeightWorkPermitFormProps) {
  const { t } = useLanguage();
  const [details, setDetails] = useState<HeightWorkDetails>(
    emptyHeightWorkDetails()
  );

  function update(next: HeightWorkDetails) {
    setDetails(next);
    onChange(next);
  }

  function patch<T>(key: keyof HeightWorkDetails, value: T) {
    update({ ...details, [key]: value });
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500";

  return (
    <>
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
          value={details.fallRisk.eliminationAuSol ? "oui" : ""}
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
          value={details.fallRisk.protectionCollectiveFixe ? "oui" : ""}
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
          value={details.fallRisk.protectionCollectiveTemporaire ? "oui" : ""}
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
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide w-32">
                  {t("heightWork.validated")}
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
                  <td className="px-3 py-2 align-top">
                    <button
                      type="button"
                      onClick={() =>
                        update({
                          ...details,
                          personnel: details.personnel.map((w, i) =>
                            i === index ? { ...w, validated: !w.validated } : w
                          ),
                        })
                      }
                      className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                        worker.validated
                          ? "bg-green-100 border border-green-300 text-green-700 hover:bg-green-200"
                          : "bg-slate-100 border border-slate-300 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {worker.validated ? (
                        <CheckSquare className="h-3.5 w-3.5" />
                      ) : (
                        <XSquare className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {worker.validated
                          ? t("heightWork.validated")
                          : t("heightWork.notValidated")}
                      </span>
                    </button>
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
                    colSpan={5}
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
                { name: "", harnessSerial: "", trainingDate: "", validated: false },
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