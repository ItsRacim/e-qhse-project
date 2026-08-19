import IncidentClient from "@/components/IncidentClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getIncidents() {
  try {
    const incidents = await prisma.report.findMany({
      where: { type: "INCIDENT" },
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { id: true, name: true, position: true, role: true },
        },
        approvedBy: {
          select: { id: true, name: true, position: true, role: true },
        },
      },
    });

    return incidents.map((incident) => ({
      ...incident,
      createdAt: incident.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export default async function IncidentsPage() {
  const incidents = await getIncidents();

  return <IncidentClient incidents={incidents} />;
}