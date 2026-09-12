import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, name, role" },
        { status: 400 }
      );
    }

    // Validate role is one of the allowed organizational roles
    const allowedRoles = [
      "RESPONSABLE_HSE",
      "SUPERVISEUR_HSE",
      "DRH",
      "RESPONSABLE_COMMERCIAL",
      "INGENIEUR_QHSE",
    ];

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Allowed roles: ${allowedRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // Check if user already exists with this email
    const existingUser = await prisma.employee.findUnique({
      where: { pinCode: email }, // Using pinCode as unique identifier like the existing auth system
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Create the employee record with the provided details
    const employee = await prisma.employee.create({
      data: {
        name,
        position: role,
        department: "QHSE", // Default department
        pinCode: email, // Using email as pinCode for simplicity in this fallback mode
        qrCodeData: "",
        certifications: "",
        role,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        name: employee.name,
        position: employee.position,
        role: employee.role,
        email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user. Please try again." },
      { status: 500 }
    );
  }
}