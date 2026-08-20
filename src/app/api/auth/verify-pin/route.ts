import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toSafeEmployee } from "@/lib/employee";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pinCode =
      typeof body?.pinCode === "string" ? body.pinCode.trim() : "";

    if (!pinCode) {
      return NextResponse.json(
        { error: "pinCode is required" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({ where: { pinCode } });

    if (!employee) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 404 });
    }

    return NextResponse.json({ employee: toSafeEmployee(employee) });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}