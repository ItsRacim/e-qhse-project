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
    const newEndDateRaw = typeof body?.newEndDate === "string" ? body.newEndDate : "";
    const reason = typeof body?.reason === "string" ? body.reason.trim() : "";

    if (!approverId) {
      return NextResponse.json(
        { error: "approverId is required" },
        { status: 400 }
      );
    }
    const newEndDate = newEndDateRaw ? new Date(newEndDateRaw) : null;
    if (!newEndDate || Number.isNaN(newEndDate.getTime())) {
      return NextResponse.json(
        { error: "newEndDate is required" },
        { status: 400 }
      );
    }
    if (!reason) {
      return NextResponse.json(
        { error: "reason is required" },
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
        { error: "Only a Supervisor or Inspector can extend work permits" },
        { status: 403 }
      );
    }

    const permit = await prisma.report.findUnique({ where: { id: params.id } });
    if (!permit || permit.type !== "PERMIT") {
      return NextResponse.json(
        { error: "Work permit not found" },
        { status: 404 }
      );
    }

    if (permit.status !== "APPROVED" && permit.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Only an active work permit can be extended" },
        { status: 409 }
      );
    }

    if (newEndDate.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "The new end date must be in the future" },
        { status: 400 }
      );
    }

    const updated = await prisma.report.update({
      where: { id: permit.id },
      data: {
        extendedUntil: newEndDate,
        extensionReason: reason,
        extensionCount: { increment: 1 },
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
      { error: "Failed to extend work permit" },
      { status: 500 }
    );
  }
}