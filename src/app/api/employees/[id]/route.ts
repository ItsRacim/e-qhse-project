import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCertifications } from "@/lib/employee";

const VALID_ROLES = ["WORKER", "SUPERVISOR", "INSPECTOR"];
const VALID_STATUSES = ["ACTIVE", "ON_LEAVE", "INACTIVE"];

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.employee.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : undefined;
    const role = typeof body?.role === "string" ? body.role : undefined;
    const status = typeof body?.status === "string" ? body.status : undefined;
    const department =
      typeof body?.department === "string" ? body.department.trim() : undefined;
    const jobTitle =
      typeof body?.jobTitle === "string" ? body.jobTitle.trim() : undefined;
    const pinCode = typeof body?.pinCode === "string" ? body.pinCode.trim() : undefined;
    const certificationsRaw = body?.certifications;
    const certifications: string[] | undefined = Array.isArray(certificationsRaw)
      ? certificationsRaw.map((cert) => String(cert).trim()).filter(Boolean)
      : undefined;

    if (name !== undefined && !name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (role !== undefined && !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "role is invalid" }, { status: 400 });
    }
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "status is invalid" }, { status: 400 });
    }
    if (pinCode !== undefined && !/^\d{4}$/.test(pinCode)) {
      return NextResponse.json(
        { error: "pinCode must be exactly 4 digits" },
        { status: 400 }
      );
    }

    if (pinCode !== undefined) {
      const pinOwner = await prisma.employee.findUnique({
        where: { pinCode },
        select: { id: true },
      });
      if (pinOwner && pinOwner.id !== params.id) {
        return NextResponse.json({ error: "PIN already in use" }, { status: 409 });
      }
    }

    const updated = await prisma.employee.update({
      where: { id: params.id },
      data: {
        name: name ?? existing.name,
        role: role ?? existing.role,
        status: status ?? existing.status,
        department: department ?? existing.department,
        position: jobTitle ?? existing.position,
        pinCode: pinCode ?? existing.pinCode,
        certifications: certifications?.join(", ") ?? existing.certifications,
      },
    });

    return NextResponse.json({
      employee: {
        ...updated,
        certifications: parseCertifications(updated.certifications),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.employee.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    await prisma.employee.update({
      where: { id: params.id },
      data: { status: "INACTIVE" },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete employee" },
      { status: 500 }
    );
  }
}