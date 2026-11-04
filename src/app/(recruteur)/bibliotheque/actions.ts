"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/tenant";
import { copySkills } from "@/lib/tests/repository";
import { splitReserve } from "@/lib/tests/bank";
import { LEVELS, MAX_DURATION, MAX_QUESTIONS, MIN_QUESTIONS, type Level } from "@/lib/tests/model";
import { completeTestQuestions } from "../tests/actions";

// Crée un test (brouillon) à partir d'un modèle de la bibliothèque, avec le niveau et le nombre
// de questions choisis par le recruteur. S'il faut plus de questions que le modèle n'en contient,
// elles sont ajoutées par l'IA (mode « ai ») ou gratuitement depuis la banque KTZ (mode « bank »).
// En mode IA, de nouvelles questions sont générées dans tous les cas, au moins pour la réserve.
export async function createFromTemplate(templateId: string, formData: FormData) {
  const user = await requireEditor();
  const template = await db.template.findFirst({
    where: { id: templateId, active: true },
    include: { skills: { orderBy: { position: "asc" }, include: { questions: { orderBy: { position: "asc" } } } } },
  });
  if (!template) redirect("/bibliotheque");

  const questions = template.skills.flatMap((s) => s.questions);
  const rawLevel = String(formData.get("level") ?? "");
  const level: Level = (LEVELS as readonly string[]).includes(rawLevel) ? (rawLevel as Level) : template.level;
  const rawCount = Number.parseInt(String(formData.get("questionCount") ?? ""), 10);
  const questionCount = Math.min(
    MAX_QUESTIONS,
    Math.max(MIN_QUESTIONS, Number.isFinite(rawCount) ? rawCount : questions.length),
  );
  const mode = formData.get("mode") === "ai" ? "ai" : "bank";

  // Durée : temps moyen conseillé par question du modèle × nombre de questions, + 20 % de marge.
  const avgSec = questions.length ? questions.reduce((a, q) => a + q.suggestedTimeSec, 0) / questions.length : 90;
  const duration = Math.min(MAX_DURATION, Math.max(15, Math.ceil((avgSec * questionCount * 1.2) / 60 / 5) * 5));
  const types = [...new Set(questions.map((q) => q.type))];

  const test = await db.$transaction(async (tx) => {
    const created = await tx.test.create({
      data: {
        companyId: user.companyId,
        createdById: user.id,
        title: template.title,
        jobTitle: template.profession,
        jobDescription: template.description,
        level,
        language: template.language,
        durationMinutes: duration,
        questionCount,
        questionTypes: types,
        templateId: template.id,
      },
    });
    await copySkills(tx, created.id, template.skills);
    return created;
  });

  // Questions du modèle d'abord posées, le surplus en réserve ; puis on complète.
  await splitReserve(test.id, user.companyId, questionCount);
  await completeTestQuestions(test.id, mode);
}
