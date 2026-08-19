import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_PERMIT_TYPES = [
  "HOT_WORK",
  "COLD_WORK",
  "CONFINED_SPACE",
  "HEIGHT_WORK",
  "ELECTRICAL_LOTO",
  "EXCAVATION",
  "LIFTING",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    const location =
      typeof body?.location === "string" && body.location.trim()
        ? body.location.trim()
        : null;
    const permitType =
      typeof body?.permitType === "string" ? body.permitType : "";
    const startDateRaw = typeof body?.startDate === "string" ? body.startDate : "";
    const endDateRaw = typeof body?.endDate === "string" ? body.endDate : "";
    const startDate = startDateRaw ? new Date(startDateRaw) : null;
    const endDate = endDateRaw ? new Date(endDateRaw) : null;
    const details =
      body?.details && typeof body.details === "object"
        ? JSON.stringify(body.details)
        : null;
    const applicantId =
      typeof body?.applicantId === "string" ? body.applicantId : "";
    const workerIdsRaw = body?.workerIds;
    const workerIds: string[] = Array.isArray(workerIdsRaw)
      ? workerIdsRaw.filter((id): id is string => typeof id === "string")
      : [];

    if (!title || !content || !applicantId) {
      return NextResponse.json(
        { error: "title, content and applicantId are required" },
        { status: 400 }
      );
    }
    if (!VALID_PERMIT_TYPES.includes(permitType)) {
      return NextResponse.json(
        { error: "permitType is required and must be valid" },
        { status: 400 }
      );
    }
    if (!startDate || Number.isNaN(startDate.getTime()) || !endDate || Number.isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }
    if (endDate.getTime() <= startDate.getTime()) {
      return NextResponse.json(
        { error: "endDate must be after startDate" },
        { status: 400 }
      );
    }

    const applicant = await prisma.employee.findUnique({
      where: { id: applicantId },
    });
    if (!applicant) {
      return NextResponse.json(
        { error: "Applicant not found" },
        { status: 404 }
      );
    }

    const workers = await prisma.employee.findMany({
      where: { id: { in: workerIds } },
    });
    if (workers.length !== workerIds.length) {
      return NextResponse.json(
        { error: "One or more authorized workers not found" },
        { status: 404 }
      );
    }

    const permit = await prisma.report.create({
      data: {
        title,
        content,
        location,
        permitType,
        details,
        startDate,
        endDate,
        type: "PERMIT",
        status: "SUBMITTED",
        createdById: applicantId,
        authorizedWorkers: { connect: workerIds.map((id) => ({ id })) },
      },
      include: {
        createdBy: { select: { id: true, name: true, position: true, role: true } },
        approvedBy: { select: { id: true, name: true, position: true, role: true } },
        authorizedWorkers: {
          select: { id: true, name: true, position: true, department: true },
        },
      },
    });

    return NextResponse.json({ permit }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create work permit" },
      { status: 500 }
    );
  }
}