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
    const rejectionReason =
      typeof body?.rejectionReason === "string" ? body.rejectionReason.trim() : "";

    if (!approverId) {
      return NextResponse.json(
        { error: "approverId is required" },
        { status: 400 }
      );
    }
    if (!rejectionReason) {
      return NextResponse.json(
        { error: "rejectionReason is required" },
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
        { error: "Only a Supervisor or Inspector can reject work permits" },
        { status: 403 }
      );
    }

    const permit = await prisma.report.findUnique({ where: { id: params.id } });
    if (!permit || permit.type !== "PERMIT") {
      return NextResponse.json({ error: "Work permit not found" }, { status: 404 });
    }

    if (permit.status === "REJECTED") {
      return NextResponse.json(
        { error: "Work permit is already rejected" },
        { status: 409 }
      );
    }

    if (permit.status !== "PENDING_APPROVAL") {
      return NextResponse.json(
        { error: "Only pending approval permits can be rejected" },
        { status: 409 }
      );
    }

    const updated = await prisma.report.update({
      where: { id: permit.id },
      data: {
        status: "REJECTED",
        approvedById: approverId,
        approvedAt: new Date(),
        rejectionReason,
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
      { error: "Failed to reject work permit" },
      { status: 500 }
    );
  }
}