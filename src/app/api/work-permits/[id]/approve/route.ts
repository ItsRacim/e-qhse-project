import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
        { error: "Only a Supervisor or Inspector can approve work permits" },
        { status: 403 }
      );
    }

    const permit = await prisma.report.findUnique({ where: { id: params.id } });
    if (!permit || permit.type !== "PERMIT") {
      return NextResponse.json({ error: "Work permit not found" }, { status: 404 });
    }

    if (permit.status === "APPROVED") {
      return NextResponse.json(
        { error: "Work permit is already approved" },
        { status: 409 }
      );
    }

    if (permit.status !== "PENDING_APPROVAL" && permit.status !== "SUBMITTED") {
      return NextResponse.json(
        { error: "Only pending approval or submitted permits can be approved" },
        { status: 409 }
      );
    }

    // Generate comprehensive cryptographic audit hash for blockchain readiness
    // Includes permitId, approverId, approverName, approvedAt, and core safety checks from details
    const approvedAt = new Date().toISOString();
    const safetyChecksPayload = permit.details ?? "";
    const auditHashInput = `${permit.id}:${approverId}:${approver.name}:${approvedAt}:${safetyChecksPayload}`;
    const auditHash = createHash("sha256").update(auditHashInput).digest("hex");
    const approvedHash = createHash("sha256")
      .update(`${permit.id}:${approverId}:${Date.now()}`)
      .digest("hex");

    const updated = await prisma.report.update({
      where: { id: permit.id },
      data: {
        status: "APPROVED",
        approvedById: approverId,
        approvedHash,
        auditHash,
        approvedAt: new Date(),
      },
      include: {
        createdBy: { select: { id: true, name: true, position: true, role: true } },
        approvedBy: { select: { id: true, name: true, position: true, role: true } },
        authorizedWorkers: {
          select: { id: true, name: true, position: true, department: true },
        },
      },
    });

    return NextResponse.json({ permit: updated });
  } catch {
    return NextResponse.json(
      { error: "Failed to approve work permit" },
      { status: 500 }
    );
  }
}