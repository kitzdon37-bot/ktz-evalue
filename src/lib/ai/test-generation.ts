import "server-only";
import * as z from "zod";
import { runAi } from "./index";
import { COUNTRIES } from "@/lib/countries";
import {
  checkQuestion,
  choiceId,
  isMcq,
  LEVEL_LABELS,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPES,
  LEVELS,
  RUBRIC_GRADED,
  type Language,
  type Level,
  type QuestionData,
  type QuestionType,
} from "@/lib/tests/model";

export type TestContext = {
  companyId: string;
  jobTitle: string;
  jobDescription: string | null;
  level: Level;
  language: Language;
  country: string;
  durationMinutes: number;
  questionCount: number;
  questionTypes: QuestionType[];
};


const SYSTEM = `Tu conçois des tests de recrutement pour des entreprises, ONG et organisations internationales d'Afrique francophone.
Règles impératives :
- Privilégie les cas pratiques et les situations réelles du poste plutôt que les définitions.
- Adapte au contexte local quand c'est pertinent : droit OHADA, FCFA, procédures des bailleurs de fonds, réalités du terrain humanitaire, infrastructures et moyens de paiement locaux (Orange Money, Moov).
- Ne pose jamais de question sur l'âge, la religion, l'ethnie, la santé, la situation familiale, l'opinion politique ou l'origine.
- QCM : une seule interprétation possible, des distracteurs plausibles, pas de « toutes les réponses ci-dessus ».
- Énoncés clairs et courts, lisibles sur un téléphone.
- Questions ouvertes : une grille de correction avec des critères observables et un exemple de bonne réponse.`;

function describeContext(ctx: TestContext) {
  const lang = ctx.language === "EN" ? "anglais" : "français";
  return `Poste : ${ctx.jobTitle}
Pays : ${COUNTRIES[ctx.country] ?? ctx.country}
Niveau visé : ${LEVEL_LABELS[ctx.level]}
Langue du test : ${lang} (rédige tout le contenu destiné au candidat dans cette langue)
Durée totale du test : ${ctx.durationMinutes} minutes pour ${ctx.questionCount} questions
Offre d'emploi ou description du poste :
"""
${(ctx.jobDescription ?? "").slice(0, 12000) || "(non fournie : appuie-toi sur l'intitulé du poste)"}
"""`;
}

// ───── Compétences ─────

const SkillsSchema = z.object({
  skills: z.array(z.object({ name: z.string(), weight: z.int(), description: z.string() })),
});

export async function generateSkills(ctx: TestContext) {
  const result = await runAi(
    { companyId: ctx.companyId, operation: "GENERATION" },
    {
      system: SYSTEM,
      schema: SkillsSchema,
      maxTokens: 4000,
      prompt: `${describeContext(ctx)}

Propose les 3 à 6 compétences clés à évaluer pour ce poste, avec leur poids dans le score (des entiers dont la somme fait exactement 100) et une phrase de description. Nom de compétence court (2 à 5 mots), dans la langue du test.`,
    },
  );
  const skills = result.skills.filter((s) => s.name.trim()).slice(0, 6);
  // On corrige les poids si leur somme ne fait pas 100.
  const total = skills.reduce((a, s) => a + Math.max(1, s.weight), 0) || 1;
  const weights = skills.map((s) => Math.max(1, Math.round((Math.max(1, s.weight) / total) * 100)));
  weights[0] += 100 - weights.reduce((a, b) => a + b, 0);
  return skills.map((s, i) => ({ name: s.name.trim(), weight: weights[i] }));
}

// ───── Questions ─────

// Format plat demandé à l'IA (plus fiable qu'un format avec variantes).
const GeneratedQuestionSchema = z.object({
  type: z.enum(QUESTION_TYPES),
  prompt: z.string(),
  choices: z.array(z.string()),
  correctChoiceIndexes: z.array(z.int()),
  trueFalseAnswer: z.boolean().nullable(),
  expectedValue: z.string().nullable(),
  tolerance: z.number().nullable(),
  rubricCriteria: z.array(z.object({ label: z.string(), points: z.int() })),
  exampleAnswer: z.string().nullable(),
  explanation: z.string(),
  suggestedTimeSec: z.int(),
  points: z.int(),
  difficulty: z.enum(LEVELS),
});
type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;

const QuestionsSchema = z.object({ questions: z.array(GeneratedQuestionSchema) });

export function toQuestionData(g: GeneratedQuestion): QuestionData {
  const mcq = isMcq(g.type);
  const choices = mcq ? g.choices.map((text, i) => ({ id: choiceId(i), text: text.trim() })) : null;
  let correctAnswer: QuestionData["correctAnswer"] = null;
  if (mcq) correctAnswer = { choiceIds: g.correctChoiceIndexes.filter((i) => i >= 0 && i < g.choices.length).map(choiceId) };
  if (g.type === "TRUE_FALSE" && g.trueFalseAnswer !== null) correctAnswer = { value: g.trueFalseAnswer };
  if (g.type === "SHORT_ANSWER" && g.expectedValue) correctAnswer = { value: g.expectedValue.trim(), tolerance: g.tolerance };
  const rubric = RUBRIC_GRADED.includes(g.type)
    ? { criteria: g.rubricCriteria.filter((c) => c.label.trim()), example: g.exampleAnswer }
    : null;
  return {
    type: g.type,
    prompt: g.prompt.trim(),
    choices,
    correctAnswer,
    rubric,
    explanation: g.explanation.trim() || null,
    difficulty: g.difficulty,
    suggestedTimeSec: Math.min(900, Math.max(10, g.suggestedTimeSec)),
    points: Math.min(20, Math.max(1, g.points)),
  };
}

const FORMAT_RULES = `Format de chaque question :
- type : un des types autorisés.
- choices : les choix possibles pour un QCM (3 à 5), sinon une liste vide.
- correctChoiceIndexes : positions (à partir de 0) des bonnes réponses pour un QCM (une seule pour MCQ_SINGLE), sinon vide.
- trueFalseAnswer : true ou false pour TRUE_FALSE, sinon null.
- expectedValue / tolerance : valeur attendue (et tolérance numérique éventuelle) pour SHORT_ANSWER, sinon null.
- rubricCriteria / exampleAnswer : grille de correction (2 à 5 critères avec leurs points) et exemple de bonne réponse pour FREE_TEXT, SCENARIO et ORAL, sinon liste vide et null.
- explanation : pourquoi la bonne réponse est correcte (pour le recruteur).
- suggestedTimeSec : temps conseillé en secondes (QCM ≈ 45-90 s, réponse courte ≈ 90-180 s, texte libre et mise en situation ≈ 300-600 s, oral ≈ 60-120 s).
- points : barème (1 à 2 pour une question fermée, 4 à 10 pour une question ouverte).
- difficulty : BEGINNER, CONFIRMED ou EXPERT.`;

function allowedTypes(ctx: TestContext) {
  return ctx.questionTypes.map((t) => `${t} (${QUESTION_TYPE_LABELS[t]})`).join(", ");
}

async function askQuestions(ctx: TestContext, skillName: string, count: number, avoid: string[]) {
  const result = await runAi(
    { companyId: ctx.companyId, operation: "GENERATION" },
    {
      system: SYSTEM,
      schema: QuestionsSchema,
      prompt: `${describeContext(ctx)}

Compétence à évaluer : « ${skillName} »
Rédige exactement ${count} questions pour cette compétence.
Types autorisés : ${allowedTypes(ctx)}. Varie les types ; au moins la moitié des questions doivent être fermées (QCM, vrai/faux, réponse courte) si ces types sont autorisés.
${avoid.length ? `Ne reprends pas ces questions déjà posées :\n${avoid.map((a) => `- ${a.slice(0, 160)}`).join("\n")}\n` : ""}
${FORMAT_RULES}`,
    },
  );
  return result.questions.filter((q) => ctx.questionTypes.includes(q.type)).map(toQuestionData);
}

// Génère les questions d'une compétence. Les questions non conformes sont
// redemandées une fois ; celles qui restent non conformes sont écartées et signalées.
export async function generateQuestionsForSkill(ctx: TestContext, skillName: string, count: number, avoid: string[] = []) {
  const first = await askQuestions(ctx, skillName, count, avoid);
  let valid = first.filter((q) => checkQuestion(q).length === 0);
  let rejected = first.length - valid.length + Math.max(0, count - first.length);
  if (valid.length < count) {
    const retry = await askQuestions(ctx, skillName, count - valid.length, [...avoid, ...valid.map((q) => q.prompt)]);
    const ok = retry.filter((q) => checkQuestion(q).length === 0);
    valid = [...valid, ...ok].slice(0, count);
    rejected = count - valid.length;
  }
  return { questions: valid, missing: rejected > 0 ? count - valid.length : 0 };
}

// Régénère une seule question (bouton « Régénérer » de l'éditeur).
export async function regenerateQuestion(ctx: TestContext, skillName: string, type: QuestionType, avoid: string[]) {
  const one = { ...ctx, questionTypes: [type] };
  const { questions } = await generateQuestionsForSkill(one, skillName, 1, avoid);
  return questions[0] ?? null;
}
