import Badge from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import { reportStatusVariant, reportTypeVariant } from "@/lib/badges";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getReports() {
  try {
    return await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: true,
        correctiveActions: { select: { id: true, title: true } },
      },
    });
  } catch {
    return [];
  }
}

export default async function ReportsPage() {
  const reports = await getReports();

  return (
    <>
      <PageHeader
        title="Reports"
        description="Daily, incident, inspection and permit reports."
      />

      <div className="rounded-xl border border-border bg-surface">
        {reports.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted">
            No reports found. Run `npx prisma db seed` to load sample data.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Created By</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Approval Hash</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium">{report.title}</p>
                    <p className="max-w-md truncate text-xs text-muted">
                      {report.content}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={reportTypeVariant[report.type]}>
                      {report.type}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {report.createdBy.name}
                    <p className="text-xs">{report.createdBy.position}</p>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={reportStatusVariant[report.status]}>
                      {report.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <code className="rounded bg-slate-500/10 px-1.5 py-0.5 font-mono text-xs text-muted">
                      {report.approvedHash ?? "—"}
                    </code>
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {new Date(report.createdAt).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}