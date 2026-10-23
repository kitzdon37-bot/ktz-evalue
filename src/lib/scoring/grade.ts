// Correction automatique des questions fermées (QCM, vrai/faux, réponse courte),
// faite uniquement sur le serveur. Fonctions pures, testées dans tests/grade.test.ts.
import type { QuestionData } from "@/lib/tests/model";

export type AnswerContent = {
  choiceIds?: string[];
  value?: boolean | string;
  text?: string;
};

// Transforme « 2 380 000 », « 2380000,5 » ou « 25 % » en nombre.
export function parseNumber(s: string): number | null {
  const cleaned = s
    .replace(/[\s  ]/g, "")
    .replace(/fcfa|xaf|f|%|€|\$/gi, "")
    .replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  return Number(cleaned);
}

function normalizeText(s: string) {
  return s
    .toLowerCase()
    .replace(/(\d)\s*h\s*(\d)/g, "$1:$2") // « 16 h 15 » = « 16:15 »
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9:]+/g, " ")
    .trim();
}

// Points obtenus (0 à q.points), ou null si la question n'est pas corrigée automatiquement.
export function gradeClosed(q: QuestionData, answer: AnswerContent | null): number | null {
  if (q.type === "MCQ_SINGLE" || q.type === "MCQ_MULTI") {
    const expected = new Set(q.correctAnswer?.choiceIds ?? []);
    const given = new Set(answer?.choiceIds ?? []);
    if (expected.size === 0) return 0;
    if (q.type === "MCQ_SINGLE") {
      return given.size === 1 && expected.has([...given][0]) ? q.points : 0;
    }
    // Plusieurs réponses : points proportionnels aux bonnes réponses, une erreur annule la question.
    if ([...given].some((id) => !expected.has(id))) return 0;
    const hits = [...given].filter((id) => expected.has(id)).length;
    return Math.round((hits / expected.size) * q.points * 100) / 100;
  }
  if (q.type === "TRUE_FALSE") {
    return typeof answer?.value === "boolean" && answer.value === q.correctAnswer?.value ? q.points : 0;
  }
  if (q.type === "SHORT_ANSWER") {
    const expected = typeof q.correctAnswer?.value === "string" ? q.correctAnswer.value : "";
    const given = typeof answer?.text === "string" ? answer.text : "";
    if (!given.trim() || !expected.trim()) return 0;
    const e = parseNumber(expected);
    const g = parseNumber(given);
    if (e !== null && g !== null) {
      const tolerance = q.correctAnswer?.tolerance ?? 0;
      return Math.abs(e - g) <= tolerance + 1e-9 ? q.points : 0;
    }
    return normalizeText(expected) === normalizeText(given) ? q.points : 0;
  }
  return null;
}
