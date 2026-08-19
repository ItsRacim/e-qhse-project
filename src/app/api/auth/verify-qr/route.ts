import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toSafeEmployee } from "@/lib/employee";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const qrData = typeof body?.qrData === "string" ? body.qrData.trim() : "";

    if (!qrData) {
      return NextResponse.json(
        { error: "qrData is required" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { qrCodeData: qrData },
    });

    if (!employee) {
      return NextResponse.json({ error: "QR code not recognized" }, { status: 404 });
    }

    return NextResponse.json({ employee: toSafeEmployee(employee) });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}