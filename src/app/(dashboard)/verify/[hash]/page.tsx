import type { Metadata } from "next";
import VerifyClient from "@/components/VerifyClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type VerifyPageProps = {
  params: { hash: string };
};

export function generateMetadata({ params }: VerifyPageProps): Metadata {
  return {
    title: `Verify Document ${params.hash.slice(0, 8)}… · E-QHSE`,
    description: "Public document verification",
  };
}

async function getVerifiedDocument(hash: string) {
  try {
    return await prisma.report.findUnique({
      where: { approvedHash: hash },
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
        correctiveActions: { select: { id: true, title: true } },
      },
    });
  } catch {
    return null;
  }
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const report = await getVerifiedDocument(params.hash);

  return (
    <VerifyClient
      hash={params.hash}
      report={
        report
          ? {
              title: report.title,
              content: report.content,
              location: report.location,
              type: report.type,
              permitType: report.permitType,
              status: report.status,
              approvedHash: report.approvedHash,
              createdAt: report.createdAt.toISOString(),
              createdBy: {
                name: report.createdBy.name,
                position: report.createdBy.position,
                department: report.createdBy.department,
              },
              approvedBy: report.approvedBy
                ? {
                    name: report.approvedBy.name,
                    position: report.approvedBy.position,
                    department: report.approvedBy.department,
                  }
                : null,
              authorizedWorkers: report.authorizedWorkers.map((worker) => ({
                name: worker.name,
                position: worker.position,
              })),
              correctiveActions: report.correctiveActions.map((action) => ({
                id: action.id,
                title: action.title,
              })),
            }
          : null
      }
    />
  );
}