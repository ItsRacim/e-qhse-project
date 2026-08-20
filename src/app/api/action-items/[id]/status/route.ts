import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusValues = ["OPEN", "IN_PROGRESS", "RESOLVED", "VERIFIED"];

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const newStatus = typeof body?.status === "string" ? body.status : "";
    const verifierId =
      typeof body?.verifierId === "string" ? body.verifierId : "";

    if (!statusValues.includes(newStatus)) {
      return NextResponse.json(
        { error: "Invalid action status" },
        { status: 400 }
      );
    }
    if (!verifierId) {
      return NextResponse.json(
        { error: "verifierId is required" },
        { status: 400 }
      );
    }

    const action = await prisma.correctiveAction.findUnique({
      where: { id: params.id },
    });
    if (!action) {
      return NextResponse.json(
        { error: "Action item not found" },
        { status: 404 }
      );
    }

    const verifier = await prisma.employee.findUnique({
      where: { id: verifierId },
    });
    if (!verifier) {
      return NextResponse.json({ error: "Verifier not found" }, { status: 404 });
    }

    const isManager = verifier.role === "SUPERVISOR" || verifier.role === "INSPECTOR";
    const isAssignee = verifier.id === action.assignedToId;

    if (newStatus === "VERIFIED") {
      if (!isManager) {
        return NextResponse.json(
          {
            error:
              "Only a Supervisor or Inspector can verify closure of an action item",
          },
          { status: 403 }
        );
      }
    } else if (!isAssignee && !isManager) {
      return NextResponse.json(
        {
          error:
            "Only the assigned employee or a Supervisor/Inspector can update this action item",
        },
        { status: 403 }
      );
    }

    const updated = await prisma.correctiveAction.update({
      where: { id: action.id },
      data: { status: newStatus },
      include: {
        assignedTo: {
          select: { id: true, name: true, position: true, department: true },
        },
        report: { select: { id: true, title: true, type: true } },
      },
    });

    return NextResponse.json({ action: updated });
  } catch {
    return NextResponse.json(
      { error: "Failed to update action item" },
      { status: 500 }
    );
  }
}