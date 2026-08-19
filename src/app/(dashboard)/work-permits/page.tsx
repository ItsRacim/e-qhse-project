import WorkPermitClient from "@/components/WorkPermitClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getPermits() {
  try {
    const permits = await prisma.report.findMany({
      where: { type: "PERMIT" },
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true, position: true, role: true } },
        approvedBy: { select: { id: true, name: true, position: true, role: true } },
        authorizedWorkers: {
          select: { id: true, name: true, position: true, department: true },
        },
      },
    });

    return permits.map((permit) => ({
      ...permit,
      createdAt: permit.createdAt.toISOString(),
      startDate: permit.startDate?.toISOString() ?? null,
      endDate: permit.endDate?.toISOString() ?? null,
      extendedUntil: permit.extendedUntil?.toISOString() ?? null,
    }));
  } catch {
    return [];
  }
}

export default async function WorkPermitsPage() {
  const permits = await getPermits();

  return <WorkPermitClient permits={permits} />;
}