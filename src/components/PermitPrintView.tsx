import { MapPin, ShieldCheck } from "lucide-react";
import { generateQrDataUrl, verifyUrl } from "@/lib/qr";
import {
  parseHeightWorkDetails,
  type HeightWorkDetails,
  type YesNo,
} from "@/lib/height-work";

const PERMIT_TYPE_LABELS: Record<string, string> = {
  HOT_WORK: "Hot Work",
  COLD_WORK: "Cold Work",
  CONFINED_SPACE: "Confined Space",
  HEIGHT_WORK: "Working at Height",
  ELECTRICAL_LOTO: "Electrical LOTO",
  EXCAVATION: "Excavation",
  LIFTING: "Lifting",
};

const PERMIT_TYPE_COLORS: Record<string, string> = {
  HOT_WORK: "bg-orange-600",
  COLD_WORK: "bg-cyan-600",
  CONFINED_SPACE: "bg-indigo-600",
  HEIGHT_WORK: "bg-amber-500",
  ELECTRICAL_LOTO: "bg-red-600",
  EXCAVATION: "bg-emerald-600",
  LIFTING: "bg-teal-600",
};

export type PrintPermit = {
  id: string;
  title: string;
  content: string;
  location: string | null;
  permitType: string | null;
  details: string | null;
  status: string;
  approvedHash: string | null;
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
  extendedUntil: string | null;
  extensionReason: string | null;
  extensionCount: number;
  createdBy: {
    name: string;
    position: string;
    department: string;
    role: string;
  } | null;
  approvedBy: {
    name: string;
    position: string;
    department: string;
    role: string;
  } | null;
  authorizedWorkers: { name: string; position: string; department: string }[];
};

type PermitPrintViewProps = {
  permit: PrintPermit;
  baseUrl: string;
};

function PrintYesNo({ label, value }: { label: string; value: YesNo }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-1.5 text-sm">
      <span>{label}</span>
      <span className="font-medium">
        {value === "oui" ? "Oui" : value === "non" ? "Non" : "—"}
      </span>
    </div>
  );
}

function PrintCheck({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-2 py-0.5 text-sm">
      <span className="w-4 text-center text-slate-700">{checked ? "☑" : "☐"}</span>
      <span>{label}</span>
    </div>
  );
}

function PrintSignature({
  title,
  name,
  dataUrl,
}: {
  title: string;
  name: string;
  dataUrl: string;
}) {
  return (
    <div className="rounded border border-slate-300 p-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <p className="mt-0.5 text-sm font-medium">{name || "—"}</p>
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dataUrl}
          alt={title}
          className="mt-1 h-14 w-full object-contain"
        />
      ) : (
        <p className="py-3 text-center text-[10px] text-slate-400">
          No signature
        </p>
      )}
    </div>
  );
}

function HeightWorkPrintSection({ details }: { details: HeightWorkDetails }) {
  return (
    <section className="mt-6">
      <h3 className="border-b-2 border-slate-900 pb-1 text-sm font-semibold uppercase tracking-wide">
        Working at Height — Permit Details
      </h3>

      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <h4 className="border-b border-slate-300 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            General Information
          </h4>
          <p className="mt-2 text-sm">
            <span className="font-medium">Description:</span>{" "}
            {details.description || "—"}
          </p>
          <p className="text-sm">
            <span className="font-medium">Permit N° / Folio:</span>{" "}
            {details.permitFolio || "—"}
          </p>
          <p className="text-sm">
            <span className="font-medium">Work date:</span>{" "}
            {details.workDate
              ? new Date(details.workDate).toLocaleString("en-GB")
              : "—"}
          </p>
          <p className="text-sm">
            <span className="font-medium">FAR / Fech N°:</span>{" "}
            {details.riskAnalysis.farNumber || "—"}
          </p>
          <div className="mt-2">
            <PrintYesNo
              label="Existing risk analysis"
              value={details.riskAnalysis.existing}
            />
          </div>
        </div>

        <div>
          <h4 className="border-b border-slate-300 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            A. Fall Risk Analysis
          </h4>
          <div className="mt-2">
            <PrintYesNo
              label="Ground-level elimination"
              value={details.fallRisk.eliminationAuSol ? "oui" : ""}
            />
            <PrintYesNo
              label="Fixed collective protection"
              value={details.fallRisk.protectionCollectiveFixe ? "oui" : ""}
            />
            <PrintYesNo
              label="Temporary collective protection"
              value={details.fallRisk.protectionCollectiveTemporaire ? "oui" : ""}
            />
          </div>
          <p className="mt-2 text-sm">
            <span className="font-medium">Future improvements:</span>{" "}
            {details.fallRisk.futureImprovements || "—"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <h4 className="border-b border-slate-300 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            B. Protection Systems
          </h4>
          <div className="mt-1">
            <PrintCheck label="Fall restraint" checked={details.protectionSystems.retenueDeChute} />
            <PrintCheck label="Retractable arrester" checked={details.protectionSystems.stopChuteEnrouleur} />
            <PrintCheck label="Fall arrest" checked={details.protectionSystems.arretDeChute} />
            <PrintCheck label="Rope access work" checked={details.protectionSystems.travauxSurCordes} />
          </div>
        </div>

        <div>
          <h4 className="border-b border-slate-300 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            C. Anchorage & Controls
          </h4>
          <div className="mt-1">
            <PrintCheck label="Anchorage point validated (≤ 40°)" checked={details.anchorRules.validationPointAncrage} />
            <PrintCheck label="Fall clearance validated" checked={details.anchorRules.validationTirantAir} />
            <PrintCheck label="Anchorage point checked" checked={details.anchorRules.verificationEtatPointAncrage} />
            <PrintCheck label="Area marked below" checked={details.anchorRules.confirmationBalissage} />
          </div>
        </div>

        <div>
          <h4 className="border-b border-slate-300 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            D. Rescue & Supervision
          </h4>
          <div className="mt-1">
            <PrintCheck label="Minimum crew (≥ 2)" checked={details.rescue.effectifMinimum} />
            <PrintCheck label="Permanent supervision" checked={details.rescue.supervisionPermanente} />
            <PrintCheck label="Rescue kit available" checked={details.rescue.kitSauvetage} />
          </div>
          <PrintYesNo label="Aerial platform (nacelle)" value={details.rescue.besoinNacelle} />
        </div>
      </div>

      <div className="mt-4">
        <h4 className="border-b border-slate-300 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          E. Authorized Personnel & Qualifications
        </h4>
        {details.personnel.length === 0 ? (
          <p className="py-2 text-sm text-slate-400">No personnel added.</p>
        ) : (
          <table className="mt-2 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-300 text-left text-xs text-slate-500">
                <th className="py-1 pr-2 font-semibold">Name</th>
                <th className="py-1 pr-2 font-semibold">Harness N° / Year</th>
                <th className="py-1 pr-2 font-semibold">Training date</th>
                <th className="py-1 font-semibold">Signature</th>
              </tr>
            </thead>
            <tbody>
              {details.personnel.map((worker, index) => (
                <tr key={index} className="border-b border-slate-200 align-top">
                  <td className="py-1.5 pr-2 font-medium">{worker.name || "—"}</td>
                  <td className="py-1.5 pr-2">{worker.harnessSerial || "—"}</td>
                  <td className="py-1.5 pr-2">{worker.trainingDate || "—"}</td>
                  <td className="py-1.5">
                    {worker.signature ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={worker.signature}
                        alt={`Signature ${index + 1}`}
                        className="h-10 object-contain"
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <PrintSignature
          title="Chargé des Travaux"
          name={details.closing.chargeDesTravaux.name}
          dataUrl={details.closing.chargeDesTravaux.signature}
        />
        <PrintSignature
          title="Responsable Sécurité Secteur"
          name={details.closing.responsableSecurite.name}
          dataUrl={details.closing.responsableSecurite.signature}
        />
      </div>
    </section>
  );
}

export default async function PermitPrintView({
  permit,
  baseUrl,
}: PermitPrintViewProps) {
  const url = verifyUrl(baseUrl, permit.approvedHash ?? "");
  const qrDataUrl = await generateQrDataUrl(url);
  const details =
    permit.permitType === "HEIGHT_WORK"
      ? parseHeightWorkDetails(permit.details)
      : null;

  return (
    <div className="print-sheet mx-auto max-w-3xl bg-white p-8 text-slate-900 shadow-sm">
      <header className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-orange-500 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">E-QHSE PLATFORM</h1>
            <p className="text-xs text-slate-500">
              Quality · Health · Safety · Environment
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-slate-500">
          <p>Permit No: {permit.id}</p>
          <p>Issued: {new Date(permit.createdAt).toLocaleDateString("en-GB")}</p>
          <p>Status: {permit.status}</p>
        </div>
      </header>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">{permit.title}</h2>
        {permit.permitType && (
          <p className="mt-2 inline-block rounded bg-slate-100 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-slate-700">
            Permit Type
            <span
              className={`ml-2 inline-block rounded px-2 py-0.5 text-white ${
                PERMIT_TYPE_COLORS[permit.permitType] ?? "bg-slate-600"
              }`}
            >
              {PERMIT_TYPE_LABELS[permit.permitType] ?? permit.permitType}
            </span>
          </p>
        )}
        {permit.location && (
          <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-600">
            <MapPin className="h-3.5 w-3.5" />
            {permit.location}
          </p>
        )}
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          {permit.content}
        </p>
        {(permit.startDate || permit.endDate || permit.extendedUntil) && (
          <div className="mt-4 rounded border border-slate-300 p-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Validity Period
            </p>
            <div className="mt-2 flex flex-wrap gap-x-8 gap-y-1">
              {permit.startDate && (
                <p>
                  <span className="font-medium">From:</span>{" "}
                  {new Date(permit.startDate).toLocaleString("en-GB")}
                </p>
              )}
              <p>
                <span className="font-medium">To:</span>{" "}
                {(permit.extendedUntil ?? permit.endDate)
                  ? new Date(
                      permit.extendedUntil ?? permit.endDate!
                    ).toLocaleString("en-GB")
                  : "—"}
              </p>
            </div>
            {permit.extensionCount > 0 && (
              <div className="mt-2 border-t border-slate-200 pt-2">
                <p className="font-medium text-orange-700">
                  Extended {permit.extensionCount}x
                  {permit.extendedUntil &&
                    ` — new expiry ${new Date(
                      permit.extendedUntil
                    ).toLocaleString("en-GB")}`}
                </p>
                {permit.extensionReason && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    Reason: {permit.extensionReason}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="mt-6">
        <h3 className="border-b border-slate-300 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Authorized Workers
        </h3>
        <ul className="mt-2 divide-y divide-slate-200">
          {permit.authorizedWorkers.map((worker, index) => (
            <li
              key={`${worker.name}-${index}`}
              className="flex justify-between py-1.5 text-sm"
            >
              <span className="font-medium">{worker.name}</span>
              <span className="text-slate-500">
                {worker.position} · {worker.department}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {details && <HeightWorkPrintSection details={details} />}

      <section className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded border border-slate-300 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Applicant
          </p>
          <p className="mt-1 text-sm font-medium">{permit.createdBy?.name}</p>
          <p className="text-xs text-slate-500">
            {permit.createdBy?.position} · {permit.createdBy?.department}
          </p>
        </div>
        <div className="rounded border border-slate-300 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Approved By
          </p>
          <p className="mt-1 text-sm font-medium">{permit.approvedBy?.name}</p>
          <p className="text-xs text-slate-500">
            {permit.approvedBy?.position} · {permit.approvedBy?.department}
          </p>
        </div>
      </section>

      <section className="mt-6 flex items-end justify-between border-t-2 border-slate-900 pt-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Approver Signature
          </p>
          <p className="text-sm font-medium text-slate-700">
            Electronically signed by {permit.approvedBy?.name ?? "—"} (
            {permit.approvedBy?.role ?? "—"})
          </p>
          <code className="block break-all font-mono text-[10px] text-slate-500">
            {permit.approvedHash}
          </code>
        </div>
        <div className="flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt="Verification QR code"
            className="h-24 w-24"
          />
          <p className="mt-1 text-[10px] text-slate-500">
            Scan to verify document
          </p>
        </div>
      </section>

      <p className="mt-6 text-center text-[10px] text-slate-400">
        Verify this document online at {url}
      </p>
    </div>
  );
}