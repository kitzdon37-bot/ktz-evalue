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
  "ORDERING",
  "CODE",
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const LEVELS = ["BEGINNER", "CONFIRMED", "EXPERT"] as const;
export type Level = (typeof LEVELS)[number];

export const LANGUAGES = ["FR", "EN"] as const;
export type Language = (typeof LANGUAGES)[number];

// Durée libre (en minutes) ; ces valeurs ne sont que des raccourcis proposés à l'écran.
export const DURATIONS = [15, 30, 45, 60, 90, 120] as const;
export const MIN_DURATION = 5;
export const MAX_DURATION = 600; // 10 heures, limite de sécurité

// Nombre de compétences et de questions libres. Seules limites :
// - chaque compétence pèse au moins 1 % (les poids font 100 %), donc 100 compétences au plus ;
// - 10 questions minimum pour un test fiable, 500 au plus (limite de sécurité).
export const MAX_SKILLS = 100;
export const MIN_QUESTIONS = 10;
export const MAX_QUESTIONS = 500;

// Durée conseillée pour un nombre de questions : environ 2 minutes par question, arrondie à 5 min.
export function suggestedDuration(questionCount: number): number {
  const minutes = Math.ceil((Math.max(1, questionCount) * 2) / 5) * 5;
  return Math.min(MAX_DURATION, Math.max(15, minutes));
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  MCQ_SINGLE: "QCM (une réponse)",
  MCQ_MULTI: "QCM (plusieurs réponses)",
  TRUE_FALSE: "Vrai / faux",
  SHORT_ANSWER: "Réponse courte ou chiffrée",
  FREE_TEXT: "Texte libre",
  SCENARIO: "Mise en situation",
  ORAL: "Question orale",
  ORDERING: "Remettre dans l'ordre",
  CODE: "Exercice de code",
};

// Types que l'IA sait rédiger (les exercices interactifs sont écrits par la banque ou le recruteur).
export const AI_TYPES = ["MCQ_SINGLE", "MCQ_MULTI", "TRUE_FALSE", "SHORT_ANSWER", "FREE_TEXT", "SCENARIO", "ORAL"] as const satisfies readonly QuestionType[];
export const isAiType = (t: QuestionType): t is (typeof AI_TYPES)[number] => (AI_TYPES as readonly string[]).includes(t);

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
export const AUTO_GRADED: readonly QuestionType[] = ["MCQ_SINGLE", "MCQ_MULTI", "TRUE_FALSE", "SHORT_ANSWER", "ORDERING", "CODE"];
// Types corrigés par l'IA avec une grille.
export const RUBRIC_GRADED: readonly QuestionType[] = ["FREE_TEXT", "SCENARIO", "ORAL"];

export function isMcq(type: QuestionType) {
  return type === "MCQ_SINGLE" || type === "MCQ_MULTI";
}

// ───── Contenu d'une question tel qu'enregistré en base (champs JSON) ─────

export const ChoiceSchema = z.object({ id: z.string().min(1), text: z.string() });
export type Choice = z.infer<typeof ChoiceSchema>;

// Exercice de code : le candidat écrit une fonction, vérifiée par des tests (arguments → résultat attendu).
// Les tests « cachés » ne sont jamais montrés au candidat : ils évitent les réponses écrites pour les exemples.
export const CodeTestSchema = z.object({ args: z.array(z.unknown()), expected: z.unknown(), hidden: z.boolean().default(false) });
export const CodeSpecSchema = z.object({
  language: z.literal("javascript").default("javascript"),
  functionName: z.string(),
  starter: z.string(),
  tests: z.array(CodeTestSchema),
});
export type CodeSpec = z.infer<typeof CodeSpecSchema>;
export type CodeTest = z.infer<typeof CodeTestSchema>;

export const CorrectAnswerSchema = z.object({
  choiceIds: z.array(z.string()).optional(), // QCM
  value: z.union([z.boolean(), z.string()]).optional(), // vrai/faux ou réponse courte
  tolerance: z.number().nonnegative().nullable().optional(), // réponse chiffrée
  order: z.array(z.string()).optional(), // remettre dans l'ordre : identifiants dans le bon ordre
  code: CodeSpecSchema.optional(), // exercice de code
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
  /** Illustration facultative : /illustrations/… (banque KTZ) ou image compressée data:image/…. */
  image?: string | null;
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

// Illustrations acceptées : fichiers de la banque KTZ, ou image envoyée par le recruteur et
// compressée dans le navigateur (JPEG, PNG ou WebP, 400 Ko au plus). Jamais de SVG envoyé :
// un SVG peut contenir du script.
export const MAX_IMAGE_CHARS = 550_000; // ≈ 400 Ko une fois décodé
export function isAllowedImage(src: string | null | undefined): src is string {
  if (!src) return false;
  if (/^\/illustrations\/[a-z0-9-]+\.(svg|png|jpg|webp)$/.test(src)) return true;
  return src.length <= MAX_IMAGE_CHARS && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(src);
}

// Nom de fonction JavaScript valide (pour les exercices de code).
export const isIdentifier = (s: string) => /^[A-Za-z_$][\w$]{0,40}$/.test(s);

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
  if (q.type === "ORDERING") {
    const items = (q.choices ?? []).filter((c) => c.text.trim());
    if (items.length < 3) problems.push("Indiquez au moins 3 éléments à remettre dans l'ordre.");
    if (new Set(items.map((c) => c.text.trim().toLowerCase())).size !== items.length) problems.push("Deux éléments sont identiques.");
  }
  if (q.type === "CODE") {
    const code = q.correctAnswer?.code;
    if (!code || !isIdentifier(code.functionName)) problems.push("Indiquez le nom de la fonction à écrire (ex. : somme).");
    if (!code || code.tests.length === 0) problems.push("Ajoutez au moins un test (arguments et résultat attendu).");
    else if (!code.tests.some((t) => !t.hidden)) problems.push("Gardez au moins un test visible : il sert d'exemple au candidat.");
  }
  if (q.image && !isAllowedImage(q.image)) problems.push("L'illustration n'est pas valide (image JPEG, PNG ou WebP de 400 Ko au plus).");
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
