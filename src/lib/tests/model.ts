// Définitions communes aux tests : libellés français, format des questions
// (choix, bonne réponse, grille) et contrôles de qualité.
// Ce fichier ne dépend pas du serveur : il est testé directement.
import * as z from "zod";

export const QUESTION_TYPES = [
  "MCQ_SINGLE",
  "MCQ_MULTI",
  "TRUE_FALSE",
  "SHORT_ANSWER",
  "FREE_TEXT",
  "SCENARIO",
  "ORAL",
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const LEVELS = ["BEGINNER", "CONFIRMED", "EXPERT"] as const;
export type Level = (typeof LEVELS)[number];

export const LANGUAGES = ["FR", "EN"] as const;
export type Language = (typeof LANGUAGES)[number];

export const DURATIONS = [15, 30, 45, 60] as const;

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  MCQ_SINGLE: "QCM (une réponse)",
  MCQ_MULTI: "QCM (plusieurs réponses)",
  TRUE_FALSE: "Vrai / faux",
  SHORT_ANSWER: "Réponse courte ou chiffrée",
  FREE_TEXT: "Texte libre",
  SCENARIO: "Mise en situation",
  ORAL: "Question orale",
};

export const LEVEL_LABELS: Record<Level, string> = {
  BEGINNER: "Débutant",
  CONFIRMED: "Confirmé",
  EXPERT: "Expert",
};

export const LANGUAGE_LABELS: Record<Language, string> = { FR: "Français", EN: "Anglais" };

export const TEST_STATUS_LABELS = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  CLOSED: "Fermé",
  ARCHIVED: "Archivé",
} as const;

export const ROLE_LABELS = { OWNER: "Propriétaire", RECRUITER: "Recruteur", VIEWER: "Lecteur" } as const;

// Types corrigés automatiquement par le serveur, sans IA.
export const AUTO_GRADED: readonly QuestionType[] = ["MCQ_SINGLE", "MCQ_MULTI", "TRUE_FALSE", "SHORT_ANSWER"];
// Types corrigés par l'IA avec une grille.
export const RUBRIC_GRADED: readonly QuestionType[] = ["FREE_TEXT", "SCENARIO", "ORAL"];

export function isMcq(type: QuestionType) {
  return type === "MCQ_SINGLE" || type === "MCQ_MULTI";
}

// ───── Contenu d'une question tel qu'enregistré en base (champs JSON) ─────

export const ChoiceSchema = z.object({ id: z.string().min(1), text: z.string() });
export type Choice = z.infer<typeof ChoiceSchema>;

export const CorrectAnswerSchema = z.object({
  choiceIds: z.array(z.string()).optional(), // QCM
  value: z.union([z.boolean(), z.string()]).optional(), // vrai/faux ou réponse courte
  tolerance: z.number().nonnegative().nullable().optional(), // réponse chiffrée
});
export type CorrectAnswer = z.infer<typeof CorrectAnswerSchema>;

export const RubricSchema = z.object({
  criteria: z.array(z.object({ label: z.string(), points: z.number().int().nonnegative() })),
  example: z.string().nullable().optional(),
});
export type Rubric = z.infer<typeof RubricSchema>;

export type QuestionData = {
  type: QuestionType;
  prompt: string;
  choices: Choice[] | null;
  correctAnswer: CorrectAnswer | null;
  rubric: Rubric | null;
  explanation: string | null;
  difficulty: Level;
  suggestedTimeSec: number;
  points: number;
};

export function choiceId(index: number) {
  return String.fromCharCode(97 + index); // a, b, c…
}

// ───── Contrôles de qualité (section 5 du cahier des charges) ─────

// Renvoie la liste des problèmes d'une question (vide si elle est correcte).
export function checkQuestion(q: QuestionData): string[] {
  const problems: string[] = [];
  if (q.prompt.trim().length < 5) problems.push("L'énoncé est vide ou trop court.");
  if (q.suggestedTimeSec < 10 || q.suggestedTimeSec > 900) problems.push("Le temps conseillé doit être entre 10 s et 15 min.");
  if (q.points < 1 || q.points > 20) problems.push("Le barème doit être entre 1 et 20 points.");

  if (isMcq(q.type)) {
    const choices = (q.choices ?? []).filter((c) => c.text.trim());
    if (choices.length < 2) problems.push("Un QCM doit avoir au moins 2 choix.");
    const texts = choices.map((c) => c.text.trim().toLowerCase());
    if (new Set(texts).size !== texts.length) problems.push("Deux choix sont identiques.");
    const ids = new Set(choices.map((c) => c.id));
    const correct = (q.correctAnswer?.choiceIds ?? []).filter((id) => ids.has(id));
    if (correct.length === 0) problems.push("Indiquez la bonne réponse.");
    if (q.type === "MCQ_SINGLE" && correct.length > 1) problems.push("Un QCM à une réponse ne peut avoir qu'une bonne réponse.");
  }
  if (q.type === "TRUE_FALSE" && typeof q.correctAnswer?.value !== "boolean") {
    problems.push("Indiquez si la bonne réponse est « vrai » ou « faux ».");
  }
  if (q.type === "SHORT_ANSWER" && !(typeof q.correctAnswer?.value === "string" && q.correctAnswer.value.trim())) {
    problems.push("Indiquez la valeur attendue.");
  }
  if (RUBRIC_GRADED.includes(q.type)) {
    const criteria = q.rubric?.criteria.filter((c) => c.label.trim()) ?? [];
    if (criteria.length === 0) problems.push("Ajoutez au moins un critère à la grille de correction.");
  }
  return problems;
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Contrôles d'ensemble : doublons, temps total cohérent avec la durée choisie.
export function checkTest(
  questions: (QuestionData & { isReserve?: boolean })[],
  opts: { durationMinutes: number; questionCount: number },
): string[] {
  const problems: string[] = [];
  const main = questions.filter((q) => !q.isReserve);
  if (main.length < opts.questionCount) {
    problems.push(`Le test doit contenir ${opts.questionCount} questions (hors réserve) : il en a ${main.length}.`);
  }
  const seen = new Set<string>();
  for (const q of questions) {
    const key = normalize(q.prompt);
    if (seen.has(key)) {
      problems.push(`Question en double : « ${q.prompt.slice(0, 60)} ».`);
    }
    seen.add(key);
  }
  // Temps total des questions qui seront posées (on prend les plus longues pour être prudent).
  const times = questions.map((q) => q.suggestedTimeSec).sort((a, b) => b - a).slice(0, opts.questionCount);
  const total = times.reduce((a, b) => a + b, 0);
  if (total > opts.durationMinutes * 60 * 1.1) {
    problems.push(
      `Le temps total conseillé (${Math.round(total / 60)} min) dépasse la durée du test (${opts.durationMinutes} min).`,
    );
  }
  return problems;
}

// Les poids des compétences doivent faire 100 %.
export function checkWeights(weights: number[]): string | null {
  const total = weights.reduce((a, b) => a + b, 0);
  if (weights.length === 0) return "Ajoutez au moins une compétence.";
  if (weights.some((w) => w <= 0)) return "Chaque compétence doit avoir un poids supérieur à 0.";
  if (total !== 100) return `Le total des poids doit faire 100 % (actuellement ${total} %).`;
  return null;
}

// Répartit 100 % entre n compétences (ex. 3 → 34, 33, 33).
export function evenWeights(n: number): number[] {
  if (n <= 0) return [];
  const base = Math.floor(100 / n);
  return Array.from({ length: n }, (_, i) => base + (i < 100 - base * n ? 1 : 0));
}

// Répartit `total` questions entre les compétences selon leur poids (au moins 1 chacune).
export function allocate(weights: number[], total: number): number[] {
  if (weights.length === 0) return [];
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const raw = weights.map((w) => (w / sum) * total);
  const counts = raw.map((r) => Math.max(1, Math.floor(r)));
  let missing = total - counts.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => ({ i, frac: r - Math.floor(r) })).sort((a, b) => b.frac - a.frac);
  for (let k = 0; missing > 0; k = (k + 1) % order.length, missing--) counts[order[k].i]++;
  return counts;
}

// Nombre de questions par compétence : posées à chaque candidat (main) et total
// à générer, réserve d'environ 50 % comprise (pour varier les versions).
export function questionPlan(weights: number[], questionCount: number) {
  const main = allocate(weights, questionCount);
  const total = allocate(weights, Math.ceil(questionCount * 1.5)).map((t, i) => Math.max(t, main[i]));
  return main.map((m, i) => ({ main: m, total: total[i] }));
}
