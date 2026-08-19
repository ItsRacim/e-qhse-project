import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const approverId =
      typeof body?.approverId === "string" ? body.approverId : "";

    if (!approverId) {
      return NextResponse.json(
        { error: "approverId is required" },
        { status: 400 }
      );
    }

    const approver = await prisma.employee.findUnique({
      where: { id: approverId },
    });
    if (!approver) {
      return NextResponse.json({ error: "Approver not found" }, { status: 404 });
    }

    if (approver.role !== "SUPERVISOR" && approver.role !== "INSPECTOR") {
      return NextResponse.json(
        { error: "Only a Supervisor or Inspector can approve incidents" },
        { status: 403 }
      );
    }

    const incident = await prisma.report.findUnique({ where: { id: params.id } });
    if (!incident || incident.type !== "INCIDENT") {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    if (incident.status === "APPROVED") {
      return NextResponse.json(
        { error: "Incident is already approved" },
        { status: 409 }
      );
    }

    const approvedHash = createHash("sha256")
      .update(`${incident.id}:${approverId}:${Date.now()}`)
      .digest("hex");

    const updated = await prisma.report.update({
      where: { id: incident.id },
      data: {
        status: "APPROVED",
        approvedById: approverId,
        approvedHash,
      },
      include: {
        createdBy: { select: { id: true, name: true, position: true, role: true } },
        approvedBy: { select: { id: true, name: true, position: true, role: true } },
      },
    });

    return NextResponse.json({ incident: updated });
  } catch {
    return NextResponse.json(
      { error: "Failed to approve incident" },
      { status: 500 }
    );
  }
}