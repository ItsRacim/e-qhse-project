"use client";

import Link from "next/link";
import Badge from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import {
  AlertTriangle,
  BadgeCheck,
  ChevronRight,
  ClipboardCheck,
  Clock,
  ExternalLink,
  FileText,
  Users,
} from "lucide-react";
import { permitTypeVariant, reportStatusVariant, reportTypeVariant } from "@/lib/badges";
import { useLanguage } from "@/lib/i18n/language-context";

type RecentSigned = {
  id: string;
  title: string;
  type: string;
  permitType: string | null;
  status: string;
  approvedHash: string | null;
  updatedAt: string;
  approvedByName: string | null;
  approvedByRole: string | null;
  workerCount: number;
};

type RecentReport = {
  id: string;
  title: string;
  type: string;
  permitType: string | null;
  status: string;
  createdAt: string;
  createdByName: string | null;
};

type DashboardData = {
  employeeCount: number;
  activePermits: number;
  pendingApprovals: number;
  openActions: number;
  recentSigned: RecentSigned[];
  recentReports: RecentReport[];
  dbError: boolean;
};

export default function DashboardClient({ data }: { data: DashboardData }) {
  const { t, tEnum, language } = useLanguage();
  const {
    employeeCount,
    activePermits,
    pendingApprovals,
    openActions,
    recentSigned,
    recentReports,
    dbError,
  } = data;

  const dateLocale = language === "ar" ? "ar" : language === "fr" ? "fr-FR" : "en-GB";

  const reportHref = (report: RecentReport): string => {
    if (report.type === "PERMIT" && report.status === "APPROVED") {
      return `/work-permits/${report.id}/print`;
    }
    if (report.type === "INCIDENT") return "/incidents";
    if (report.type === "PERMIT") return "/work-permits";
    return "/reports";
  };

  return (
    <>
      <PageHeader
        title={t("dashboard.title")}
        description={t("dashboard.description")}
      />

      {dbError && (
        <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          {t("dashboard.dbError")}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("dashboard.activePermits")}
          value={activePermits}
          icon={ClipboardCheck}
          accent="amber"
          href="/work-permits"
        />
        <StatCard
          label={t("dashboard.pendingApprovals")}
          value={pendingApprovals}
          icon={Clock}
          accent="blue"
          href="/work-permits"
        />
        <StatCard
          label={t("dashboard.totalEmployees")}
          value={employeeCount}
          icon={Users}
          accent="green"
          href="/employees"
        />
        <StatCard
          label={t("dashboard.openActionItems")}
          value={openActions}
          icon={AlertTriangle}
          accent="red"
          href="/action-items"
        />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">{t("dashboard.recentReports")}</h2>
            <p className="mt-0.5 text-xs text-muted">
              {t("dashboard.recentReportsHint")}
            </p>
          </div>
          <Link
            href="/reports"
            className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-orange-500 hover:text-foreground"
          >
            {t("common.seeMore")}
          </Link>
        </div>
        {recentReports.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted">{t("dashboard.noReports")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {recentReports.map((report) => (
              <li key={report.id}>
                <Link
                  href={reportHref(report)}
                  className="group flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-muted" />
                      <p className="truncate font-medium">{report.title}</p>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                      <span>
                        {t("dashboard.reportsCreatedBy", {
                          name: report.createdByName ?? "—",
                        })}
                      </span>
                      <span>
                        {new Date(report.createdAt).toLocaleString(dateLocale)}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
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
                    <Badge variant={reportTypeVariant[report.type]}>
                      {tEnum("reportType", report.type)}
                    </Badge>
                    <Badge variant={reportStatusVariant[report.status]}>
                      {tEnum("reportStatus", report.status)}
                    </Badge>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-orange-500" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">{t("dashboard.recentActivity")}</h2>
          <span className="text-xs text-muted">
            {t("dashboard.recentActivityHint")}
          </span>
        </div>
        {recentSigned.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted">{t("dashboard.noActivity")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {recentSigned.map((permit) => (
              <li
                key={permit.id}
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                    <p className="truncate font-medium">{permit.title}</p>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                    <span>
                      {t("dashboard.signedBy", {
                        name: permit.approvedByName ?? "—",
                        role: permit.approvedByRole ?? "—",
                      })}
                    </span>
                    <span>{new Date(permit.updatedAt).toLocaleString(dateLocale)}</span>
                    {permit.workerCount > 0 && (
                      <span>
                        {t("dashboard.workersCount", { count: permit.workerCount })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
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
                  <Badge variant={reportTypeVariant[permit.type]}>
                    {tEnum("reportType", permit.type)}
                  </Badge>
                  <Badge variant={reportStatusVariant[permit.status]}>
                    {tEnum("reportStatus", permit.status)}
                  </Badge>
                  <a
                    href={`/work-permits/${permit.id}/print`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-orange-500 hover:text-foreground"
                  >
                    {t("common.view")}
                  </a>
                  {permit.approvedHash && (
                    <Link
                      href={`/verify/${permit.approvedHash}`}
                      className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-orange-500 hover:text-foreground"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {t("common.verify")}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}