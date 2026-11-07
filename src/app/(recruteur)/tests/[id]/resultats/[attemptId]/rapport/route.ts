// Rapport PDF d'un candidat (scores, fiabilité, entretien et correction détaillée).
import { NextResponse, type NextRequest } from "next/server";
import { notFound } from "next/navigation";
import { requireCompany } from "@/lib/tenant";
import { loadCandidateReport, renderReportPdf } from "@/lib/reports/candidate-report";

export async function GET(_req: NextRequest, ctx: RouteContext<"/tests/[id]/resultats/[attemptId]/rapport">) {
  const { id, attemptId } = await ctx.params;
  const user = await requireCompany();
  const loaded = await loadCandidateReport(attemptId, { testId: id, companyId: user.companyId });
  if (!loaded) notFound();
  const pdf = await renderReportPdf(loaded.report);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${loaded.filename}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
