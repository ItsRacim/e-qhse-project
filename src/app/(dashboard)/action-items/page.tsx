import ActionItemsClient from "@/components/ActionItemsClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    const [actionItems, employees, reports] = await Promise.all([
      prisma.correctiveAction.findMany({
        orderBy: { dueDate: "asc" },
        include: {
          assignedTo: {
            select: { id: true, name: true, position: true, department: true },
          },
          report: { select: { id: true, title: true, type: true } },
        },
      }),
      prisma.employee.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, position: true, department: true },
      }),
      prisma.report.findMany({
        where: { type: { in: ["INCIDENT", "INSPECTION"] } },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, type: true },
      }),
    ]);

    return {
      actionItems: actionItems.map((item) => ({
        ...item,
        dueDate: item.dueDate.toISOString(),
        createdAt: item.createdAt.toISOString(),
      })),
      employees,
      reports,
    };
  } catch {
    return { actionItems: [], employees: [], reports: [] };
  }
}

export default async function ActionItemsPage() {
  const { actionItems, employees, reports } = await getData();

  return (
    <ActionItemsClient
      actionItems={actionItems}
      employees={employees}
      reports={reports}
    />
  );
}