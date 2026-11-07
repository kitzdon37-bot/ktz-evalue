import "server-only";
import * as z from "zod";
import { db } from "@/lib/db";
import { attemptOrder } from "@/lib/candidate/attempt";
import { decodeLogo, isInternalLogo } from "@/lib/company/logo";
import { formatDuration, RECRUITER_STATUS_LABELS } from "@/lib/results-view";
import { RELIABILITY_LABELS, type ReliabilityLevel } from "@/lib/scoring/reliability";
import { fromDb } from "@/lib/tests/repository";
import { renderCandidateReport, type CandidateReport } from "./candidate-pdf";
import { correctionRow, type CorrectionRow } from "./correction";

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

// Rassemble tout ce qu'il faut pour le rapport d'un candidat (PDF et email à l'employeur),
// y compris la correction question par question.
export async function loadCandidateReport(attemptId: string, where: { testId?: string; companyId?: string } = {}) {
  const a = await db.attempt.findFirst({
    where: { id: attemptId, ...where },
    include: {
      candidate: true,
      answers: true,
      company: { select: { name: true, primaryColor: true, logoUrl: true, logoData: true } },
      test: { include: { skills: { orderBy: { position: "asc" }, include: { questions: true } } } },
    },
  });
  if (!a) return null;
  const scores = (a.skillScores ?? {}) as Record<string, number>;
  const interview = z.array(z.string()).safeParse(a.interviewQuestions);
  const level = a.reliability as ReliabilityLevel | null;

  const questions = new Map(a.test.skills.flatMap((s) => s.questions.map((q) => [q.id, { data: fromDb(q), skill: s.name }] as const)));
  const answers = new Map(a.answers.map((x) => [x.questionId, x]));
  const correction: CorrectionRow[] = [];
  for (const o of attemptOrder(a)) {
    const entry = questions.get(o.questionId);
    if (entry) correction.push(correctionRow(correction.length + 1, entry.skill, entry.data, answers.get(o.questionId)));
  }

  const report: CandidateReport = {
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
    correction,
  };
  const filename = `rapport-${a.candidate.name}`.normalize("NFD").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase().replace(/^-|-$/g, "");
  return { attempt: a, report, filename };
}

export async function renderReportPdf(report: CandidateReport) {
  return renderCandidateReport(report);
}
