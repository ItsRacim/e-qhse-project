"use client";

import Link from "next/link";
import {
  BadgeCheck,
  CalendarClock,
  FileText,
  MapPin,
  ShieldCheck,
  ShieldX,
  UserCheck,
  Users,
} from "lucide-react";
import Badge from "@/components/Badge";
import {
  permitTypeVariant,
  reportStatusVariant,
  reportTypeVariant,
} from "@/lib/badges";
import { useLanguage } from "@/lib/i18n/language-context";

type VerifiedReport = {
  title: string;
  content: string;
  location: string | null;
  type: string;
  permitType: string | null;
  status: string;
  approvedHash: string | null;
  createdAt: string;
  createdBy: { name: string; position: string; department: string };
  approvedBy: { name: string; position: string; department: string } | null;
  authorizedWorkers: { name: string; position: string }[];
  correctiveActions: { id: string; title: string }[];
};

export default function VerifyClient({
  hash,
  report,
}: {
  hash: string;
  report: VerifiedReport | null;
}) {
  const { t, tEnum, language } = useLanguage();
  const dateLocale = language === "ar" ? "ar" : language === "fr" ? "fr-FR" : "en-GB";

  if (!report) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-border bg-surface px-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
          <ShieldX className="h-9 w-9 text-rose-500" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-rose-600 dark:text-rose-400">
          {t("verify.tampered")}
        </h1>
        <p className="mt-2 text-sm text-muted">{t("verify.tamperedHint")}</p>
        <code className="mt-4 break-all rounded-lg bg-slate-500/10 px-3 py-2 font-mono text-xs text-muted">
          {hash}
        </code>
        <Link
          href="/"
          className="mt-6 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-orange-500 hover:text-foreground"
        >
          {t("verify.back")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-emerald-500/40 bg-surface">
        <div className="flex items-center gap-4 border-b border-border bg-emerald-500/5 px-6 py-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
            <BadgeCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">
              {t("verify.authenticated")}
            </h1>
            <p className="text-sm text-muted">{t("verify.authenticatedHint")}</p>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">{report.title}</h2>
              {report.location && (
                <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                  <MapPin className="h-3.5 w-3.5" />
                  {report.location}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {report.permitType && (
                <Badge
                  variant={
                    permitTypeVariant[
                      report.permitType as keyof typeof permitTypeVariant
                    ]
                  }
                >
                  {tEnum("permitType", report.permitType)}
                </Badge>
              )}
              <Badge variant={reportTypeVariant[report.type]}>{report.type}</Badge>
              <Badge variant={reportStatusVariant[report.status]}>
                {report.status}
              </Badge>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-foreground/80">
            {report.content}
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                <CalendarClock className="h-3.5 w-3.5" />
                {t("verify.originalTimestamp")}
              </p>
              <p className="mt-1 text-sm font-medium">
                {new Date(report.createdAt).toLocaleString(dateLocale)}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                <ShieldCheck className="h-3.5 w-3.5" />
                {t("verify.approvalHash")}
              </p>
              <code className="mt-1 block break-all font-mono text-xs">
                {report.approvedHash}
              </code>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                <UserCheck className="h-3.5 w-3.5" />
                {t("verify.createdBy")}
              </p>
              <p className="mt-1 text-sm font-medium">{report.createdBy.name}</p>
              <p className="text-xs text-muted">
                {report.createdBy.position} · {report.createdBy.department}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                <BadgeCheck className="h-3.5 w-3.5" />
                {t("verify.approvedBy")}
              </p>
              {report.approvedBy ? (
                <>
                  <p className="mt-1 text-sm font-medium">
                    {report.approvedBy.name}
                  </p>
                  <p className="text-xs text-muted">
                    {report.approvedBy.position} · {report.approvedBy.department}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-muted">{t("verify.notApproved")}</p>
              )}
            </div>
          </div>

          {report.authorizedWorkers.length > 0 && (
            <div className="rounded-lg border border-border p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                <Users className="h-3.5 w-3.5" />
                {t("verify.authorizedWorkers", {
                  count: report.authorizedWorkers.length,
                })}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {report.authorizedWorkers.map((worker) => (
                  <span
                    key={worker.name}
                    className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs"
                  >
                    {worker.name} · {worker.position}
                  </span>
                ))}
              </div>
            </div>
          )}

          {report.correctiveActions.length > 0 && (
            <div className="rounded-lg border border-border p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                <FileText className="h-3.5 w-3.5" />
                {t("verify.linkedActions")}
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {report.correctiveActions.map((action) => (
                  <li key={action.id}>• {action.title}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}