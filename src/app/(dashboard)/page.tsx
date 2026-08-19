import DashboardClient from "@/components/DashboardClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
        where: { type: "PERMIT", status: "SUBMITTED" },
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
    return {
      employeeCount: 0,
      activePermits: 0,
      pendingApprovals: 0,
      openActions: 0,
      recentSigned: [],
      recentReports: [],
      dbError: true,
    };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return <DashboardClient data={data} />;
}