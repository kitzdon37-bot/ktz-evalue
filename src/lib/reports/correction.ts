import type { QuestionData } from "@/lib/tests/model";
import { isMcq, RUBRIC_GRADED } from "@/lib/tests/model";
import { expectedOrder, type AnswerContent } from "@/lib/scoring/grade";

// Correction question par question d'un passage, sous forme de texte simple :
// utilisée pour l'email envoyé à l'employeur et pour le rapport PDF.

export type CorrectionStatus = "juste" | "partiel" | "faux" | "attente" | "sans-reponse";

export type CorrectionRow = {
  n: number;
  skill: string;
  prompt: string;
  given: string;
  expected: string;
  points: number | null;
  max: number;
  status: CorrectionStatus;
  comment?: string;
};

type AnswerLike = {
  content: unknown;
  autoScore: number | null;
  aiScore: number | null;
  overrideScore: number | null;
  aiJustification?: string | null;
  transcript?: string | null;
};

const clip = (s: string, n = 300) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

function choiceText(q: QuestionData, id: string) {
  return q.choices?.find((c) => c.id === id)?.text ?? "?";
}

function describe(q: QuestionData, content: AnswerContent | null): { given: string; expected: string } {
  const none = "Pas de réponse";
  const correct = q.correctAnswer;
  if (isMcq(q.type)) {
    return {
      given: content?.choiceIds?.length ? content.choiceIds.map((id) => choiceText(q, id)).join(" ; ") : none,
      expected: (correct?.choiceIds ?? []).map((id) => choiceText(q, id)).join(" ; "),
    };
  }
  switch (q.type) {
    case "TRUE_FALSE":
      return {
        given: content?.value === true ? "Vrai" : content?.value === false ? "Faux" : none,
        expected: correct?.value ? "Vrai" : "Faux",
      };
    case "SHORT_ANSWER":
      return {
        given: content?.text?.trim() || none,
        expected: `${String(correct?.value ?? "")}${correct?.tolerance ? ` (± ${correct.tolerance})` : ""}`,
      };
    case "ORDERING":
      return {
        given: content?.order?.length ? content.order.map((id, i) => `${i + 1}. ${choiceText(q, id)}`).join("  ") : none,
        expected: expectedOrder(q).map((id, i) => `${i + 1}. ${choiceText(q, id)}`).join("  "),
      };
    case "CODE": {
      const tests = content?.tests ?? [];
      const passed = tests.filter((t) => t.passed).length;
      return {
        given: content?.code ? `Code envoyé — ${passed}/${tests.length} test(s) réussi(s)` : none,
        expected: `Fonction ${correct?.code?.functionName ?? ""} qui passe tous les tests`,
      };
    }
    default:
      // Réponse écrite, mise en situation, oral : notée selon la grille de correction.
      return { given: content?.text?.trim() || none, expected: "Notée selon la grille de correction" };
  }
}

export function correctionRow(n: number, skill: string, q: QuestionData, a: AnswerLike | undefined): CorrectionRow {
  const content = (a?.content ?? null) as AnswerContent | null;
  const { given, expected } = describe(q, content);
  const points = a ? (a.overrideScore ?? a.autoScore ?? a.aiScore) : null;
  const answered = given !== "Pas de réponse" || Boolean(a?.transcript);
  let status: CorrectionStatus;
  if (!answered) status = "sans-reponse";
  else if (points === null) status = RUBRIC_GRADED.includes(q.type) ? "attente" : "faux";
  else if (points >= q.points) status = "juste";
  else if (points > 0) status = "partiel";
  else status = "faux";
  return {
    n,
    skill,
    prompt: clip(q.prompt.replace(/\s+/g, " ").trim(), 220),
    given: clip(a?.transcript?.trim() || given),
    expected: clip(expected),
    points: answered ? (points ?? null) : 0,
    max: q.points,
    status,
    comment: a?.aiJustification ? clip(a.aiJustification, 280) : undefined,
  };
}

export const STATUS_LABELS: Record<CorrectionStatus, string> = {
  juste: "Juste",
  partiel: "Partiel",
  faux: "Faux",
  attente: "À corriger",
  "sans-reponse": "Sans réponse",
};
