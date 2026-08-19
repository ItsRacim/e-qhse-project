import PageHeader from "@/components/PageHeader";
import QrScanner from "@/components/QrScanner";
import { parseCertifications } from "@/lib/employee";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getEmployees() {
  try {
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        position: true,
        department: true,
        qrCodeData: true,
        certifications: true,
        role: true,
        status: true,
      },
    });

    return employees.map((employee) => ({
      ...employee,
      certifications: parseCertifications(employee.certifications),
    }));
  } catch {
    return [];
  }
}

export default async function QrScannerPage() {
  const employees = await getEmployees();

  return (
    <>
      <PageHeader
        title="QR Scanner"
        description="Scan an employee badge or enter the QR payload to verify identity."
      />
      <QrScanner employees={employees} />
    </>
  );
}