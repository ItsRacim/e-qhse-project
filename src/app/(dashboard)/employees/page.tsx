import EmployeesClient from "@/components/EmployeesClient";
import { parseCertifications } from "@/lib/employee";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getEmployees() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { reportsCreated: true, correctiveActions: true },
        },
      },
    });

    return employees.map((employee) => ({
      id: employee.id,
      name: employee.name,
      position: employee.position,
      department: employee.department,
      role: employee.role,
      status: employee.status,
      qrCodeData: employee.qrCodeData,
      pinCode: employee.pinCode,
      certifications: parseCertifications(employee.certifications),
      reportsCount: employee._count.reportsCreated,
      actionsCount: employee._count.correctiveActions,
    }));
  } catch {
    return [];
  }
}

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return <EmployeesClient employees={employees} />;
}