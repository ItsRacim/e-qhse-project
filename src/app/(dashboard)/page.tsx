import DashboardClient from "@/components/DashboardClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const LOCAL_STORAGE_KEY = "eqhse-permits-store";

interface LocalPermit {
  id: string;
  title: string;
  type: string;
  permitType: string | null;
  content: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  createdByName: string | null;
  approvedByName: string | null;
  approvedByRole: string | null;
  approvedHash: string | null;
  workerCount: number;
}

function getLocalPermits(): LocalPermit[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

async function getDashboardData() {
  try {
    const [
      employeeCount,
      activePermits,
      pendingApprovals,
      openActions,
      recentSigned,
      recentReports,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.report.count({
        where: { type: "PERMIT", status: "APPROVED" },
      }),
      prisma.report.count({
        where: { type: "PERMIT", status: "PENDING_APPROVAL" },
      }),
      prisma.correctiveAction.count({
        where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
      }),
      prisma.report.findMany({
        where: { type: "PERMIT", status: "APPROVED", approvedHash: { not: null } },
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: {
          createdBy: { select: { name: true, position: true } },
          approvedBy: { select: { name: true, position: true, role: true } },
          authorizedWorkers: { select: { name: true } },
        },
      }),
      prisma.report.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { createdBy: { select: { name: true } } },
      }),
    ]);

    return {
      employeeCount,
      activePermits,
      pendingApprovals,
      openActions,
      recentSigned: recentSigned.map((permit) => ({
        id: permit.id,
        title: permit.title,
        type: permit.type,
        permitType: permit.permitType,
        status: permit.status,
        approvedHash: permit.approvedHash,
        updatedAt: permit.updatedAt.toISOString(),
        approvedByName: permit.approvedBy?.name ?? null,
        approvedByRole: permit.approvedBy?.role ?? null,
        workerCount: permit.authorizedWorkers.length,
      })),
      recentReports: recentReports.map((report) => ({
        id: report.id,
        title: report.title,
        type: report.type,
        permitType: report.permitType,
        status: report.status,
        createdAt: report.createdAt.toISOString(),
        createdByName: report.createdBy?.name ?? null,
      })),
      dbError: false,
    };
  } catch {
    const localPermits = getLocalPermits();
    const approvedPermits = localPermits.filter((p) => p.status === "APPROVED");
    const pendingPermits = localPermits.filter((p) => p.status === "PENDING_APPROVAL");
    const recentLocal = localPermits
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      employeeCount: 0,
      activePermits: approvedPermits.length,
      pendingApprovals: pendingPermits.length,
      openActions: 0,
      recentSigned: approvedPermits.slice(0, 6).map((permit) => ({
        id: permit.id,
        title: permit.title,
        type: permit.type,
        permitType: permit.permitType,
        status: permit.status,
        approvedHash: permit.approvedHash,
        updatedAt: permit.updatedAt || permit.createdAt,
        approvedByName: permit.approvedByName ?? null,
        approvedByRole: permit.approvedByRole ?? null,
        workerCount: permit.workerCount ?? 0,
      })),
      recentReports: recentLocal.map((report) => ({
        id: report.id,
        title: report.title,
        type: report.type,
        permitType: report.permitType,
        status: report.status,
        createdAt: report.createdAt,
        createdByName: report.createdByName ?? null,
      })),
      dbError: true,
    };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return <DashboardClient data={data} />;
}