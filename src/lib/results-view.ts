import "server-only";
import { db } from "@/lib/db";
import { getCompanyTest } from "@/lib/tests/repository";
import { RELIABILITY_LABELS, type ReliabilityLevel } from "@/lib/scoring/reliability";

export const RECRUITER_STATUS_LABELS = {
  TO_REVIEW: "À examiner",
  SHORTLISTED: "Retenu",
  INTERVIEW: "Entretien",
  REJECTED: "Écarté",
} as const;

export const RELIABILITY_ORDER: Record<string, number> = { HIGH: 0, TO_CHECK: 1, LOW: 2 };

export type ResultRow = Awaited<ReturnType<typeof getTestResults>>["rows"][number];

// Résultats d'un test, filtrés sur l'entreprise de l'utilisateur.
export async function getTestResults(testId: string, companyId: string) {
  const test = await getCompanyTest(testId, companyId);
  const attempts = await db.attempt.findMany({
    where: { testId, companyId },
    include: { candidate: { select: { name: true, email: true, phone: true } } },
    orderBy: { startedAt: "desc" },
  });
  const skills = test.skills.map((s) => ({ id: s.id, name: s.name, weight: s.weight }));
  const rows = attempts.map((a) => {
    const scores = (a.skillScores ?? {}) as Record<string, number>;
    const reliability = a.reliability as ReliabilityLevel | null;
    return {
      id: a.id,
      name: a.candidate.name,
      email: a.candidate.email,
      phone: a.candidate.phone,
      status: a.status,
      finished: a.status !== "IN_PROGRESS",
      globalScore: a.globalScore,
      gradingPending: a.status !== "IN_PROGRESS" && a.gradingStatus !== "DONE",
      passed: a.passed,
      skillScores: skills.map((s) => ({ ...s, score: scores[s.id] ?? null })),
      reliability,
      reliabilityLabel: reliability ? RELIABILITY_LABELS[reliability] : null,
      reliabilitySummary: a.reliabilitySummary,
      recruiterStatus: a.recruiterStatus,
      recruiterStatusLabel: RECRUITER_STATUS_LABELS[a.recruiterStatus],
      recruiterNote: a.recruiterNote,
      startedAt: a.startedAt,
      completedAt: a.completedAt,
      durationSec: a.completedAt ? Math.round((a.completedAt.getTime() - a.startedAt.getTime()) / 1000) : null,
    };
  });
  return { test, skills, rows };
}

export type SortKey = "score" | "fiabilite" | "date" | `competence-${string}`;

export function sortRows(rows: ResultRow[], sort: string): ResultRow[] {
  const byScore = (v: number | null) => (v === null ? -1 : v);
  const sorted = [...rows];
  if (sort === "date") {
    sorted.sort((a, b) => (b.completedAt ?? b.startedAt).getTime() - (a.completedAt ?? a.startedAt).getTime());
  } else if (sort === "fiabilite") {
    sorted.sort(
      (a, b) =>
        (RELIABILITY_ORDER[a.reliability ?? "LOW"] ?? 3) - (RELIABILITY_ORDER[b.reliability ?? "LOW"] ?? 3) ||
        byScore(b.globalScore) - byScore(a.globalScore),
    );
  } else if (sort.startsWith("competence-")) {
    const skillId = sort.slice("competence-".length);
    const s = (r: ResultRow) => byScore(r.skillScores.find((x) => x.id === skillId)?.score ?? null);
    sorted.sort((a, b) => s(b) - s(a));
  } else {
    sorted.sort((a, b) => byScore(b.globalScore) - byScore(a.globalScore) || Number(b.finished) - Number(a.finished));
  }
  return sorted;
}

export function formatDuration(sec: number | null) {
  if (sec === null) return "—";
  const m = Math.floor(sec / 60);
  return `${m} min ${String(sec % 60).padStart(2, "0")} s`;
}
