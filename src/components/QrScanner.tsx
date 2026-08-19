"use client";

import { useState } from "react";
import { BadgeCheck, QrCode, ScanLine, UserX } from "lucide-react";
import Badge from "@/components/Badge";
import { employeeRoleVariant, employeeStatusVariant } from "@/lib/badges";

type QrEmployee = {
  id: string;
  name: string;
  position: string;
  department: string;
  qrCodeData: string;
  certifications: string[];
  role: string;
  status: string;
};

type QrScannerProps = {
  employees: QrEmployee[];
};

export default function QrScanner({ employees }: QrScannerProps) {
  const [payload, setPayload] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<QrEmployee | null>(null);
  const [notFound, setNotFound] = useState(false);

  function lookup(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    const match = employees.find((e) => e.qrCodeData === trimmed);
    setResult(match ?? null);
    setNotFound(!match);
  }

  function handleScan() {
    setScanning(true);
    setNotFound(false);
    setResult(null);
    setTimeout(() => {
      setScanning(false);
      lookup(payload || "EQHSE-EMP-0001");
    }, 1200);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold">Scanner</h2>
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-500/40 bg-slate-500/5">
          <QrCode className="h-16 w-16 text-slate-400" />
          {scanning && (
            <ScanLine className="absolute left-4 right-4 animate-pulse text-amber-500" />
          )}
          <span className="absolute bottom-3 text-xs text-muted">
            Camera feed placeholder — wire a QR reader here
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            placeholder="Paste QR payload (e.g. EQHSE-EMP-0001)"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={handleScan}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
          >
            Scan
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold">Identity Result</h2>
        {!result && !notFound && (
          <p className="text-sm text-muted">
            No scan yet. Press Scan or enter a QR payload on the left.
          </p>
        )}
        {notFound && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <UserX className="h-10 w-10 text-rose-500" />
            <p className="text-sm text-muted">
              No employee matches payload{" "}
              <code className="rounded bg-slate-500/10 px-1.5 py-0.5 font-mono text-xs">
                {payload}
              </code>
            </p>
          </div>
        )}
        {result && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-lg font-semibold">{result.name}</h3>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {result.position} · {result.department}
                </p>
              </div>
              <Badge variant={employeeRoleVariant[result.role as keyof typeof employeeRoleVariant]}>
                {result.role}
              </Badge>
              <Badge variant={employeeStatusVariant[result.status as keyof typeof employeeStatusVariant]}>
                {result.status}
              </Badge>
            </div>
            <code className="block rounded-lg bg-slate-500/10 px-3 py-2 font-mono text-xs text-muted">
              {result.qrCodeData}
            </code>
            <div className="flex flex-wrap gap-1.5">
              {result.certifications.map((cert) => (
                <span
                  key={cert}
                  className="rounded-md border border-border px-2 py-0.5 text-xs text-muted"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}