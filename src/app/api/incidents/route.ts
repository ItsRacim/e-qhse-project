import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const severityValues = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    const location =
      typeof body?.location === "string" && body.location.trim()
        ? body.location.trim()
        : null;
    const immediateActions =
      typeof body?.immediateActions === "string" && body.immediateActions.trim()
        ? body.immediateActions.trim()
        : null;
    const severity =
      typeof body?.severity === "string" ? body.severity : "";
    const reporterId =
      typeof body?.reporterId === "string" ? body.reporterId : "";

    if (!title || !content || !reporterId) {
      return NextResponse.json(
        { error: "title, content and reporterId are required" },
        { status: 400 }
      );
    }
    if (!severityValues.includes(severity)) {
      return NextResponse.json(
        { error: "severity must be LOW, MEDIUM, HIGH or CRITICAL" },
        { status: 400 }
      );
    }

    const reporter = await prisma.employee.findUnique({
      where: { id: reporterId },
    });
    if (!reporter) {
      return NextResponse.json(
        { error: "Reporter not found" },
        { status: 404 }
      );
    }

    const incident = await prisma.report.create({
      data: {
        title,
        content,
        location,
        severity,
        immediateActions,
        type: "INCIDENT",
        status: "SUBMITTED",
        createdById: reporterId,
      },
      include: {
        createdBy: { select: { id: true, name: true, position: true, role: true } },
        approvedBy: { select: { id: true, name: true, position: true, role: true } },
      },
    });

    return NextResponse.json({ incident }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create incident report" },
      { status: 500 }
    );
  }
}