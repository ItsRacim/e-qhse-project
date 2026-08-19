import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AutoPrint from "@/components/AutoPrint";
import PermitPrintView from "@/components/PermitPrintView";
import PrintButton from "@/components/PrintButton";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PrintPageProps = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: "Print Permit · E-QHSE",
};

async function getPermit(id: string) {
  try {
    return await prisma.report.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { name: true, position: true, department: true, role: true },
        },
        approvedBy: {
          select: { name: true, position: true, department: true, role: true },
        },
        authorizedWorkers: {
          select: { name: true, position: true, department: true },
        },
      },
    });
  } catch {
    return null;
  }
}

export default async function PrintPermitPage({ params }: PrintPageProps) {
  const permit = await getPermit(params.id);

  if (
    !permit ||
    permit.type !== "PERMIT" ||
    permit.status !== "APPROVED" ||
    !permit.approvedHash
  ) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div>
      <AutoPrint />
      <PermitPrintView
        permit={{
          id: permit.id,
          title: permit.title,
          content: permit.content,
          location: permit.location,
          permitType: permit.permitType,
          details: permit.details,
          status: permit.status,
          approvedHash: permit.approvedHash,
          createdAt: permit.createdAt.toISOString(),
          startDate: permit.startDate?.toISOString() ?? null,
          endDate: permit.endDate?.toISOString() ?? null,
          extendedUntil: permit.extendedUntil?.toISOString() ?? null,
          extensionReason: permit.extensionReason,
          extensionCount: permit.extensionCount,
          createdBy: permit.createdBy,
          approvedBy: permit.approvedBy,
          authorizedWorkers: permit.authorizedWorkers,
        }}
        baseUrl={baseUrl}
      />
      <div className="print:hidden mt-6 flex justify-center">
        <PrintButton />
      </div>
    </div>
  );
}