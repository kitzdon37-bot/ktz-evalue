// Rapport PDF d'un candidat.
import { NextResponse, type NextRequest } from "next/server";
import { notFound } from "next/navigation";
import * as z from "zod";
import { db } from "@/lib/db";
import { requireCompany } from "@/lib/tenant";
import { formatDuration, RECRUITER_STATUS_LABELS } from "@/lib/results-view";
import { RELIABILITY_LABELS, type ReliabilityLevel } from "@/lib/scoring/reliability";
import { renderCandidateReport } from "@/lib/reports/candidate-pdf";
import { decodeLogo, isInternalLogo } from "@/lib/company/logo";

async function fetchLogo(url: string | null, logoData: string | null): Promise<Buffer | null> {
  if (!url) return null;
  if (isInternalLogo(url)) return decodeLogo(logoData)?.bytes ?? null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!/image\/(png|jpe?g)/.test(type)) return null; // PDFKit ne lit que PNG et JPEG
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

export async function GET(_req: NextRequest, ctx: RouteContext<"/tests/[id]/resultats/[attemptId]/rapport">) {
  const { id, attemptId } = await ctx.params;
  const user = await requireCompany();
  const a = await db.attempt.findFirst({
    where: { id: attemptId, testId: id, companyId: user.companyId },
    include: {
      candidate: true,
      company: { select: { name: true, primaryColor: true, logoUrl: true, logoData: true } },
      test: { include: { skills: { orderBy: { position: "asc" } } } },
    },
  });
  if (!a) notFound();
  const scores = (a.skillScores ?? {}) as Record<string, number>;
  const interview = z.array(z.string()).safeParse(a.interviewQuestions);
  const level = a.reliability as ReliabilityLevel | null;

  const pdf = await renderCandidateReport({
    companyName: a.company.name,
    companyColor: a.company.primaryColor,
    logo: await fetchLogo(a.company.logoUrl, a.company.logoData),
    testTitle: a.test.title,
    candidateName: a.candidate.name,
    candidateContact: [a.candidate.email, a.candidate.phone].filter(Boolean).join(" · "),
    completedAt: a.completedAt,
    durationText: a.completedAt ? formatDuration(Math.round((a.completedAt.getTime() - a.startedAt.getTime()) / 1000)) : "—",
    globalScore: a.globalScore,
    passThreshold: a.test.passThreshold,
    passed: a.passed,
    pending: a.status !== "IN_PROGRESS" && a.gradingStatus !== "DONE",
    skills: a.test.skills.map((s) => ({ name: s.name, weight: s.weight, score: a.status === "IN_PROGRESS" ? null : (scores[s.id] ?? null) })),
    reliabilityLabel: level ? RELIABILITY_LABELS[level] : null,
    reliabilitySummary: a.reliabilitySummary,
    interviewQuestions: interview.success ? interview.data : [],
    recruiterStatus: RECRUITER_STATUS_LABELS[a.recruiterStatus],
  });
  const filename = `rapport-${a.candidate.name}`.normalize("NFD").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
