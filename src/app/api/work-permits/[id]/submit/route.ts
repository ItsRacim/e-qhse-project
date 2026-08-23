import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const permit = await prisma.report.findUnique({ where: { id: params.id } });
    if (!permit || permit.type !== "PERMIT") {
      return NextResponse.json(
        { error: "Work permit not found" },
        { status: 404 }
      );
    }

    if (permit.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only draft permits can be submitted for approval" },
        { status: 409 }
      );
    }

    const updated = await prisma.report.update({
      where: { id: permit.id },
      data: {
        status: "PENDING_APPROVAL",
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
      { error: "Failed to submit work permit for approval" },
      { status: 500 }
    );
  }
}