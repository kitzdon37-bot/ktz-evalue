"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import * as z from "zod";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/tenant";
import { AiBudgetError, AiUnavailableError } from "@/lib/ai";
import {
  generateQuestionsForSkill,
  generateSkills,
  regenerateQuestion,
  type TestContext,
} from "@/lib/ai/test-generation";
import {
  checkQuestion,
  checkTest,
  checkWeights,
  MAX_DURATION,
  MAX_QUESTIONS,
  MAX_SKILLS,
  MIN_DURATION,
  MIN_QUESTIONS,
  evenWeights,
  LANGUAGES,
  LEVELS,
  QUESTION_TYPES,
  isAiType,
  questionPlan,
  type QuestionType,
} from "@/lib/tests/model";
import { blankQuestion, parseQuestionForm } from "@/lib/tests/question-form";
import { copySkills, fromDb, getCompanyTest, toDb, type CompanyTest } from "@/lib/tests/repository";
import { fillFromBank, splitReserve } from "@/lib/tests/bank";
import { suggestSkills } from "@/lib/tests/suggestions";
import type { FormState } from "@/lib/auth/schemas";

function aiErrorMessage(e: unknown): string {
  if (e instanceof AiBudgetError || e instanceof AiUnavailableError) console.warn(`[ia] génération bloquée : ${e.message}`);
  if (e instanceof AiBudgetError) return e.message;
  if (e instanceof AiUnavailableError) {
    return `${e.message} Utilisez un modèle de la bibliothèque, écrivez les questions vous-même, ou réessayez plus tard.`;
  }
  console.error(e);
  return "La génération a échoué. Réessayez, ou écrivez les questions vous-même.";
}

// Un test publié ne change plus : toute modification passe par ce contrôle.
async function editableTest(testId: string) {
  const user = await requireEditor();
  const test = await getCompanyTest(testId, user.companyId);
  if (test.status !== "DRAFT") {
    throw new Error("Ce test est publié : il ne peut plus être modifié. Dupliquez-le pour en faire une nouvelle version.");
  }
  return { user, test };
}

async function contextFor(test: CompanyTest, companyId: string): Promise<TestContext> {
  const company = await db.company.findUnique({ where: { id: companyId }, select: { country: true } });
  return {
    companyId,
    jobTitle: test.jobTitle,
    jobDescription: test.jobDescription,
    level: test.level,
    language: test.language,
    country: company?.country ?? "CF",
    durationMinutes: test.durationMinutes,
    questionCount: test.questionCount,
    questionTypes: test.questionTypes as QuestionType[],
  };
}

// ───── Étape 1 : informations du poste ─────

const DurationSchema = z.coerce
  .number({ error: "Indiquez une durée en minutes." })
  .int({ error: "Indiquez une durée en minutes entières." })
  .min(MIN_DURATION, { error: `${MIN_DURATION} minutes minimum.` })
  .max(MAX_DURATION, { error: `${MAX_DURATION} minutes maximum.` });

const QuestionCountSchema = z.coerce
  .number({ error: "Indiquez un nombre de questions." })
  .int({ error: "Indiquez un nombre entier." })
  .min(MIN_QUESTIONS, { error: `${MIN_QUESTIONS} questions minimum.` })
  .max(MAX_QUESTIONS, { error: `${MAX_QUESTIONS} questions maximum.` });

const CreateTestSchema = z.object({
  jobTitle: z.string().trim().min(2, { error: "Indiquez l'intitulé du poste." }).max(120),
  jobDescription: z.string().trim().max(20000, { error: "Texte trop long (20 000 caractères maximum)." }),
  level: z.enum(LEVELS),
  language: z.enum(LANGUAGES),
  durationMinutes: DurationSchema,
  questionCount: QuestionCountSchema,
  questionTypes: z.array(z.enum(QUESTION_TYPES)).min(1, { error: "Cochez au moins un type de question." }),
  // ai : l'IA propose les compétences ; ai_full : compétences + questions ;
  // bank : questions de la banque KTZ (gratuit, sans IA) ; manual : sans IA.
  mode: z.enum(["ai", "ai_full", "bank", "manual"]),
  // Compétences choisies parmi les suggestions (ou ajoutées à la main), sans limite pratique.
  suggestedSkills: z.array(z.string().trim().min(2).max(80)).max(MAX_SKILLS, { error: `${MAX_SKILLS} compétences maximum.` }),
});

export async function createTest(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireEditor();
  const parsed = CreateTestSchema.safeParse({
    jobTitle: formData.get("jobTitle"),
    jobDescription: formData.get("jobDescription") ?? "",
    level: formData.get("level"),
    language: formData.get("language"),
    durationMinutes: formData.get("durationMinutes"),
    questionCount: formData.get("questionCount"),
    questionTypes: formData.getAll("questionTypes"),
    mode: formData.get("mode"),
    suggestedSkills: [...new Set(formData.getAll("suggestedSkill").map((v) => String(v).trim()).filter(Boolean))],
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const d = parsed.data;

  const test = await db.test.create({
    data: {
      companyId: user.companyId,
      createdById: user.id,
      title: d.jobTitle,
      jobTitle: d.jobTitle,
      jobDescription: d.jobDescription || null,
      level: d.level,
      language: d.language,
      durationMinutes: d.durationMinutes,
      questionCount: d.questionCount,
      questionTypes: d.questionTypes,
    },
    include: { skills: { include: { questions: true } } },
  });

  // Compétences : celles choisies par le recruteur (poids égaux), sauf s'il demande une
  // proposition de l'IA ; pour la banque sans choix, celles du métier le plus proche.
  let chosen = d.mode === "ai" ? [] : d.suggestedSkills;
  if (d.mode === "bank" && chosen.length === 0) chosen = suggestSkills(d.jobTitle).slice(0, 4);
  if (chosen.length > 0) {
    const w = evenWeights(chosen.length);
    await db.skill.createMany({
      data: chosen.map((name, i) => ({ testId: test.id, name, weight: w[i], position: i })),
    });
  }

  let aiError = "";
  if (d.mode === "ai" || (d.mode === "ai_full" && chosen.length === 0)) {
    try {
      const skills = await generateSkills(await contextFor(test, user.companyId));
      await db.skill.createMany({
        data: skills.map((s, i) => ({ testId: test.id, name: s.name, weight: s.weight, position: i })),
      });
    } catch (e) {
      aiError = "?ia=indisponible";
      console.error(e);
    }
  }

  // Test complet par l'IA : on enchaîne sur les questions ; si l'IA en ligne échoue
  // (crédit épuisé, panne…), on prépare le test gratuitement avec la banque KTZ.
  if (d.mode === "ai_full") {
    if (!aiError) {
      const result = await generateAllQuestions(test.id); // redirige vers les questions si tout va bien
      if (!result?.message) redirect(`/tests/${test.id}/questions`);
    }
    if ((await db.skill.count({ where: { testId: test.id } })) === 0) {
      // Aucune compétence (l'IA n'a pas pu les proposer) : on prend celles du métier le plus proche.
      const fallback = suggestSkills(d.jobTitle).slice(0, 4);
      const w = evenWeights(fallback.length);
      await db.skill.createMany({ data: fallback.map((name, i) => ({ testId: test.id, name, weight: w[i], position: i })) });
    }
    return redirectAfterBank(test.id, user.companyId, true);
  }
  if (d.mode === "bank") return redirectAfterBank(test.id, user.companyId, false);
  redirect(`/tests/${test.id}/competences${aiError}`);
}

// Remplit le test depuis la banque KTZ, puis ouvre la relecture des questions avec un message.
async function redirectAfterBank(testId: string, companyId: string, aiUnavailable: boolean): Promise<never> {
  const before = await db.test.findUnique({ where: { id: testId }, select: { questionCount: true } });
  const r = await fillFromBank(testId, companyId);
  const params = new URLSearchParams({ banque: String(r.added) });
  // La banque n'avait pas assez de questions : le nombre demandé a été réduit.
  if (before && r.questionCount < before.questionCount) params.set("demandees", String(before.questionCount));
  if (r.uncovered.length) params.set("sans", r.uncovered.join("|"));
  if (r.removed.length) params.set("retirees", r.removed.join("|"));
  if (r.extra.length) params.set("ajoutees", r.extra.join("|"));
  if (aiUnavailable) params.set("ia", "indisponible");
  redirect(`/tests/${testId}/questions?${params}`);
}

// ───── Étape 2 : compétences ─────

export async function saveSkills(testId: string, _state: FormState, formData: FormData): Promise<FormState> {
  const { test } = await editableTest(testId);
  const ids = formData.getAll("skillId").map(String);
  const names = formData.getAll("skillName").map((v) => String(v).trim());
  const weights = formData.getAll("skillWeight").map((v) => Number.parseInt(String(v), 10) || 0);

  const rows = names
    .map((name, i) => ({ id: ids[i], name, weight: weights[i] }))
    .filter((r) => r.name.length > 0);
  if (rows.length > MAX_SKILLS) return { message: `${MAX_SKILLS} compétences maximum (chacune pèse au moins 1 %).` };
  const weightError = checkWeights(rows.map((r) => r.weight));
  if (weightError) return { message: weightError };

  const existing = new Set(test.skills.map((s) => s.id));
  await db.$transaction(async (tx) => {
    const kept = rows.filter((r) => r.id && existing.has(r.id)).map((r) => r.id);
    // Supprimer une compétence supprime aussi ses questions.
    await tx.skill.deleteMany({ where: { testId, id: { notIn: kept } } });
    for (const [i, r] of rows.entries()) {
      if (r.id && existing.has(r.id)) {
        await tx.skill.update({ where: { id: r.id }, data: { name: r.name, weight: r.weight, position: i } });
      } else {
        await tx.skill.create({ data: { testId, name: r.name, weight: r.weight, position: i } });
      }
    }
  });

  if (formData.get("next") === "generate") {
    return generateAllQuestions(testId);
  }
  if (formData.get("next") === "bank") {
    const { user } = await editableTest(testId);
    return redirectAfterBank(testId, user.companyId, false);
  }
  if (formData.get("next") === "manual") redirect(`/tests/${testId}/questions`);
  refresh();
  return { success: "Compétences enregistrées." };
}

export async function proposeSkills(testId: string): Promise<FormState> {
  const { user, test } = await editableTest(testId);
  try {
    const skills = await generateSkills(await contextFor(test, user.companyId));
    await db.$transaction([
      db.skill.deleteMany({ where: { testId } }),
      db.skill.createMany({ data: skills.map((s, i) => ({ testId, name: s.name, weight: s.weight, position: i })) }),
    ]);
  } catch (e) {
    return { message: aiErrorMessage(e) };
  }
  refresh();
  return { success: "Nouvelles compétences proposées par l'IA." };
}

// Génère toutes les questions (réserve comprise), en parallèle par compétence.
async function generateAllQuestions(testId: string): Promise<FormState> {
  const { user, test } = await editableTest(testId);
  if (test.skills.length === 0) return { message: "Ajoutez au moins une compétence." };
  const ctx = await contextFor(test, user.companyId);
  const plan = questionPlan(test.skills.map((s) => s.weight), test.questionCount);

  // Une compétence après l'autre (et non toutes en même temps) : les formules gratuites
  // limitent le volume par minute. Une compétence qui échoue n'annule pas les autres.
  let missing = 0;
  let firstError: unknown = null;
  const results: { questions: Awaited<ReturnType<typeof generateQuestionsForSkill>>["questions"]; missing: number }[] = [];
  for (const [i, skill] of test.skills.entries()) {
    const toCreate = Math.max(0, plan[i].total - skill.questions.length);
    if (toCreate === 0) {
      results.push({ questions: [], missing: 0 });
      continue;
    }
    try {
      results.push(await generateQuestionsForSkill(ctx, skill.name, toCreate, skill.questions.map((q) => q.prompt)));
    } catch (e) {
      firstError ??= e;
      results.push({ questions: [], missing: toCreate });
    }
  }
  // Rien n'a pu être généré : on signale l'erreur (l'appelant se rabat sur la banque KTZ).
  if (firstError && results.every((r) => r.questions.length === 0)) return { message: aiErrorMessage(firstError) };
  try {
    await db.$transaction(async (tx) => {
      for (const [i, skill] of test.skills.entries()) {
        const { questions } = results[i];
        missing += results[i].missing;
        const start = skill.questions.length;
        await tx.question.createMany({
          data: questions.map((q, k) => ({
            ...toDb(q),
            skillId: skill.id,
            origin: "AI" as const,
            position: start + k,
            // Les premières questions sont posées, les suivantes forment la réserve.
            isReserve: start + k >= plan[i].main,
          })),
        });
      }
    });
  } catch (e) {
    return { message: aiErrorMessage(e) };
  }
  // Certaines compétences n'ont pas pu être générées : on complète gratuitement avec la banque KTZ.
  if (firstError) return redirectAfterBank(testId, test.companyId, false);
  if (missing > 0) {
    redirect(`/tests/${testId}/questions?manquantes=${missing}`);
  }
  redirect(`/tests/${testId}/questions`);
}

// ───── Étape 3 : questions ─────

export async function addQuestion(testId: string, formData: FormData) {
  const { test } = await editableTest(testId);
  const skillId = String(formData.get("skillId") ?? "");
  const type = String(formData.get("type") ?? "") as QuestionType;
  const skill = test.skills.find((s) => s.id === skillId);
  // Le recruteur peut ajouter à la main n'importe quel type, même non coché à la création.
  if (!skill || !(QUESTION_TYPES as readonly string[]).includes(type)) return;
  if (!test.questionTypes.includes(type)) {
    await db.test.update({ where: { id: testId }, data: { questionTypes: { push: type } } });
  }
  await db.question.create({
    data: {
      ...toDb(blankQuestion(type, test.level)),
      skillId,
      origin: "MANUAL",
      position: skill.questions.length,
    },
  });
  refresh();
}

function findQuestion(test: CompanyTest, questionId: string) {
  for (const skill of test.skills) {
    const q = skill.questions.find((x) => x.id === questionId);
    if (q) return { skill, question: q };
  }
  return null;
}

export async function updateQuestion(
  testId: string,
  questionId: string,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const { test } = await editableTest(testId);
  const found = findQuestion(test, questionId);
  if (!found) return { message: "Question introuvable." };
  const data = parseQuestionForm(found.question.type as QuestionType, formData);
  const problems = checkQuestion(data);
  await db.question.update({
    where: { id: questionId },
    data: { ...toDb(data), isReserve: formData.get("isReserve") === "on" },
  });
  refresh();
  if (problems.length) return { message: `Enregistré, mais à corriger : ${problems.join(" ")}` };
  return { success: "Question enregistrée." };
}

export async function deleteQuestion(testId: string, questionId: string) {
  const { test } = await editableTest(testId);
  if (!findQuestion(test, questionId)) return;
  await db.question.delete({ where: { id: questionId } });
  refresh();
}

export async function moveQuestion(testId: string, questionId: string, direction: "up" | "down") {
  const { test } = await editableTest(testId);
  const found = findQuestion(test, questionId);
  if (!found) return;
  const list = found.skill.questions;
  const i = list.findIndex((q) => q.id === questionId);
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= list.length) return;
  const reordered = [...list];
  [reordered[i], reordered[j]] = [reordered[j], reordered[i]];
  await db.$transaction(reordered.map((q, k) => db.question.update({ where: { id: q.id }, data: { position: k } })));
  refresh();
}

export async function regenerateQuestionAction(testId: string, questionId: string): Promise<FormState> {
  const { user, test } = await editableTest(testId);
  const found = findQuestion(test, questionId);
  if (!found) return { message: "Question introuvable." };
  if (!isAiType(found.question.type as QuestionType)) {
    return { message: "L'IA ne rédige pas ce type de question : modifiez-la à la main." };
  }
  try {
    const avoid = test.skills.flatMap((s) => s.questions.map((q) => q.prompt));
    const q = await regenerateQuestion(
      await contextFor(test, user.companyId),
      found.skill.name,
      found.question.type as QuestionType,
      avoid,
    );
    if (!q) return { message: "L'IA n'a pas proposé de question valable. Réessayez." };
    await db.question.update({ where: { id: questionId }, data: { ...toDb(q), origin: "AI" } });
  } catch (e) {
    return { message: aiErrorMessage(e) };
  }
  refresh();
  return { success: "Question régénérée." };
}

export async function generateMissingQuestions(testId: string): Promise<FormState> {
  return generateAllQuestions(testId);
}

// Complète les questions d'un test (créé depuis la bibliothèque) jusqu'au nombre voulu, réserve
// comprise : avec l'IA (questions nouvelles, au niveau du test) ou gratuitement avec la banque KTZ.
// Si l'IA en ligne échoue (crédit épuisé, panne…), on se rabat sur la banque. Redirige toujours.
export async function completeTestQuestions(testId: string, mode: "ai" | "bank"): Promise<never> {
  const { user } = await editableTest(testId);
  if (mode === "ai") {
    await generateAllQuestions(testId); // redirige vers les questions si l'IA a répondu
    return redirectAfterBank(testId, user.companyId, true);
  }
  return redirectAfterBank(testId, user.companyId, false);
}

// ───── Paramètres et publication ─────

const SettingsSchema = z.object({
  title: z.string().trim().min(2, { error: "Indiquez un titre." }).max(120),
  passThreshold: z.coerce.number().int().min(0).max(100),
  webcamIntervalSec: z.coerce.number().int().min(30).max(60),
  deadline: z.string().trim(),
  durationMinutes: DurationSchema,
  questionCount: QuestionCountSchema,
});

export async function saveSettings(testId: string, _state: FormState, formData: FormData): Promise<FormState> {
  await editableTest(testId);
  const parsed = SettingsSchema.safeParse({
    title: formData.get("title"),
    passThreshold: formData.get("passThreshold"),
    webcamIntervalSec: formData.get("webcamIntervalSec") ?? 45,
    deadline: formData.get("deadline") ?? "",
    durationMinutes: formData.get("durationMinutes"),
    questionCount: formData.get("questionCount"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const on = (k: string) => formData.get(k) === "on";
  // Date limite : fin de journée (23 h 59, heure de Bangui, UTC+1).
  const deadline = parsed.data.deadline ? new Date(`${parsed.data.deadline}T23:59:00+01:00`) : null;
  if (deadline && Number.isNaN(deadline.getTime())) return { errors: { deadline: ["Date invalide."] } };
  await db.test.update({
    where: { id: testId },
    data: {
      title: parsed.data.title,
      passThreshold: parsed.data.passThreshold,
      webcamIntervalSec: parsed.data.webcamIntervalSec,
      durationMinutes: parsed.data.durationMinutes,
      questionCount: parsed.data.questionCount,
      deadline,
      shuffleQuestions: on("shuffleQuestions"),
      shuffleChoices: on("shuffleChoices"),
      blockPaste: on("blockPaste"),
      requireFullscreen: on("requireFullscreen"),
      webcamEnabled: on("webcamEnabled"),
      showScoreToCandidate: on("showScoreToCandidate"),
      badgesEnabled: on("badgesEnabled"),
    },
  });
  if (formData.get("next") === "publish") return publishTest(testId);
  refresh();
  return { success: "Paramètres enregistrés." };
}

// Liste des points qui empêchent la publication (vide si le test est prêt).
function publicationProblems(test: CompanyTest): string[] {
  const problems: string[] = [];
  const weightError = checkWeights(test.skills.map((s) => s.weight));
  if (weightError) problems.push(weightError);
  for (const skill of test.skills) {
    if (!skill.questions.some((q) => !q.isReserve)) problems.push(`La compétence « ${skill.name} » n'a aucune question.`);
    for (const [i, q] of skill.questions.entries()) {
      const p = checkQuestion(fromDb(q));
      if (p.length) problems.push(`${skill.name}, question ${i + 1} : ${p.join(" ")}`);
    }
  }
  const all = test.skills.flatMap((s) => s.questions.map((q) => ({ ...fromDb(q), isReserve: q.isReserve })));
  problems.push(...checkTest(all, { durationMinutes: test.durationMinutes, questionCount: test.questionCount }));
  return problems;
}

async function publishTest(testId: string): Promise<FormState> {
  const { test } = await editableTest(testId);
  const problems = publicationProblems(test);
  if (problems.length) {
    return { message: `Le test ne peut pas encore être publié :\n• ${problems.slice(0, 8).join("\n• ")}` };
  }
  await db.test.update({ where: { id: testId }, data: { status: "PUBLISHED", publishedAt: new Date() } });
  redirect(`/tests/${testId}?publie=1`);
}

// ───── Cycle de vie ─────

export async function duplicateTest(testId: string) {
  const user = await requireEditor();
  const test = await getCompanyTest(testId, user.companyId);
  const copy = await db.$transaction(async (tx) => {
    const created = await tx.test.create({
      data: {
        companyId: user.companyId,
        createdById: user.id,
        title: `${test.title} (copie)`,
        jobTitle: test.jobTitle,
        jobDescription: test.jobDescription,
        sourceFileUrl: test.sourceFileUrl,
        level: test.level,
        language: test.language,
        durationMinutes: test.durationMinutes,
        questionCount: test.questionCount,
        questionTypes: test.questionTypes,
        passThreshold: test.passThreshold,
        shuffleQuestions: test.shuffleQuestions,
        shuffleChoices: test.shuffleChoices,
        blockPaste: test.blockPaste,
        requireFullscreen: test.requireFullscreen,
        webcamEnabled: test.webcamEnabled,
        webcamIntervalSec: test.webcamIntervalSec,
        showScoreToCandidate: test.showScoreToCandidate,
        badgesEnabled: test.badgesEnabled,
        reminderHours: test.reminderHours,
        templateId: test.templateId,
        duplicatedFromId: test.id,
      },
    });
    await copySkills(tx, created.id, test.skills);
    return created;
  });
  redirect(`/tests/${copy.id}/questions`);
}

export async function closeTest(testId: string) {
  const user = await requireEditor();
  await getCompanyTest(testId, user.companyId);
  await db.test.updateMany({
    where: { id: testId, companyId: user.companyId, status: "PUBLISHED" },
    data: { status: "CLOSED", closedAt: new Date() },
  });
  refresh();
}

export async function archiveTest(testId: string) {
  const user = await requireEditor();
  await db.test.updateMany({ where: { id: testId, companyId: user.companyId }, data: { status: "ARCHIVED" } });
  redirect("/tests");
}

export async function deleteDraft(testId: string) {
  const user = await requireEditor();
  // Seuls les brouillons (sans candidat) peuvent être supprimés.
  await db.test.deleteMany({ where: { id: testId, companyId: user.companyId, status: "DRAFT" } });
  redirect("/tests");
}

export async function setEvenWeights(testId: string) {
  const { test } = await editableTest(testId);
  const weights = evenWeights(test.skills.length);
  await db.$transaction(test.skills.map((s, i) => db.skill.update({ where: { id: s.id }, data: { weight: weights[i] } })));
  refresh();
}

// ───── Modules prêts à l'emploi (culture générale, raisonnement, programmation…) ─────

// Ajoute à un test les compétences et questions d'un module de la bibliothèque. Les questions
// du module s'ajoutent au nombre de questions posées et à la durée du test ; les poids des
// compétences sont répartis également (modifiables ensuite).
export async function addModule(testId: string, templateId: string) {
  const { user, test } = await editableTest(testId);
  const template = await db.template.findFirst({
    where: { id: templateId, active: true, profession: { startsWith: "Module" } },
    include: { skills: { orderBy: { position: "asc" }, include: { questions: { orderBy: { position: "asc" } } } } },
  });
  if (!template) redirect(`/tests/${testId}/competences`);

  const existing = new Set(test.skills.map((s) => s.name));
  const skills = template.skills.filter((s) => !existing.has(s.name));
  if (skills.length === 0) redirect(`/tests/${testId}/competences?module=deja`);
  const added = skills.flatMap((s) => s.questions);
  const extraMinutes = Math.ceil(added.reduce((a, q) => a + q.suggestedTimeSec, 0) / 60);
  const questionCount = Math.min(MAX_QUESTIONS, test.questionCount + added.length);
  const types = [...new Set([...test.questionTypes, ...added.map((q) => q.type)])];

  await db.$transaction(async (tx) => {
    await copySkills(
      tx,
      testId,
      skills.map((s, i) => ({ ...s, position: test.skills.length + i })),
    );
    const all = await tx.skill.findMany({ where: { testId }, orderBy: { position: "asc" }, select: { id: true } });
    const weights = evenWeights(all.length);
    for (const [i, s] of all.entries()) await tx.skill.update({ where: { id: s.id }, data: { weight: weights[i] } });
    await tx.test.update({
      where: { id: testId },
      data: { questionCount, durationMinutes: Math.min(MAX_DURATION, test.durationMinutes + extraMinutes), questionTypes: types },
    });
  });
  await splitReserve(testId, user.companyId, questionCount);
  const params = new URLSearchParams({ module: template.title, ajout: String(added.length), minutes: String(extraMinutes) });
  redirect(`/tests/${testId}/competences?${params}`);
}
