import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const priorityValues = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const description =
      typeof body?.description === "string" && body.description.trim()
        ? body.description.trim()
        : null;
    const assignedToId =
      typeof body?.assignedToId === "string" ? body.assignedToId : "";
    const reportId =
      typeof body?.reportId === "string" && body.reportId
        ? body.reportId
        : null;
    const dueDateRaw = typeof body?.dueDate === "string" ? body.dueDate : "";
    const priority =
      typeof body?.priority === "string" ? body.priority : "MEDIUM";

    const dueDate = new Date(dueDateRaw);
    if (!title || !assignedToId || !dueDateRaw || Number.isNaN(dueDate.getTime())) {
      return NextResponse.json(
        { error: "title, assignedToId and a valid dueDate are required" },
        { status: 400 }
      );
    }
    if (!priorityValues.includes(priority)) {
      return NextResponse.json(
        { error: "priority must be LOW, MEDIUM, HIGH or CRITICAL" },
        { status: 400 }
      );
    }

    const assignee = await prisma.employee.findUnique({
      where: { id: assignedToId },
    });
    if (!assignee) {
      return NextResponse.json({ error: "Assignee not found" }, { status: 404 });
    }

    if (reportId) {
      const report = await prisma.report.findUnique({ where: { id: reportId } });
      if (!report || !["INCIDENT", "INSPECTION"].includes(report.type)) {
        return NextResponse.json(
          { error: "Linked report must be an INCIDENT or INSPECTION" },
          { status: 400 }
        );
      }
    }

    const action = await prisma.correctiveAction.create({
      data: {
        title,
        description,
        assignedToId,
        dueDate,
        priority,
        reportId,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, position: true, department: true },
        },
        report: { select: { id: true, title: true, type: true } },
      },
    });

    return NextResponse.json({ action }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create action item" },
      { status: 500 }
    );
  }
}