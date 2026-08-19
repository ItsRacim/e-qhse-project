import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCertifications } from "@/lib/employee";

const VALID_ROLES = ["WORKER", "SUPERVISOR", "INSPECTOR"];
const CODE_PREFIX = "EQHSE-EMP-";

async function generateEmployeeCode(): Promise<string> {
  const employees = await prisma.employee.findMany({
    select: { qrCodeData: true },
  });
  let max = 0;
  for (const employee of employees) {
    const match = new RegExp(`^${CODE_PREFIX}(\\d+)$`).exec(employee.qrCodeData);
    if (match) {
      max = Math.max(max, parseInt(match[1], 10));
    }
  }
  return `${CODE_PREFIX}${String(max + 1).padStart(4, "0")}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const role = typeof body?.role === "string" ? body.role : "";
    const department =
      typeof body?.department === "string" ? body.department.trim() : "";
    const jobTitle = typeof body?.jobTitle === "string" ? body.jobTitle.trim() : "";
    const pinCode = typeof body?.pinCode === "string" ? body.pinCode.trim() : "";
    const certificationsRaw = body?.certifications;
    const certifications: string[] = Array.isArray(certificationsRaw)
      ? certificationsRaw
          .map((cert) => String(cert).trim())
          .filter(Boolean)
      : [];

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "role is invalid" }, { status: 400 });
    }
    if (!/^\d{4}$/.test(pinCode)) {
      return NextResponse.json(
        { error: "pinCode must be exactly 4 digits" },
        { status: 400 }
      );
    }

    const existingPin = await prisma.employee.findUnique({
      where: { pinCode },
      select: { id: true },
    });
    if (existingPin) {
      return NextResponse.json({ error: "PIN already in use" }, { status: 409 });
    }

    const qrCodeData = await generateEmployeeCode();

    const employee = await prisma.employee.create({
      data: {
        name,
        role,
        department: department || "General",
        position: jobTitle || "Employee",
        pinCode,
        qrCodeData,
        status: "ACTIVE",
        certifications: certifications.join(", "),
      },
    });

    return NextResponse.json(
      {
        employee: {
          ...employee,
          certifications: parseCertifications(employee.certifications),
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}