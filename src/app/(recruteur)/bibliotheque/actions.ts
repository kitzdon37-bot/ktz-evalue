"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/tenant";
import { copySkills } from "@/lib/tests/repository";
import { DURATIONS } from "@/lib/tests/model";

// Crée un test (brouillon) à partir d'un modèle de la bibliothèque.
export async function createFromTemplate(templateId: string) {
  const user = await requireEditor();
  const template = await db.template.findFirst({
    where: { id: templateId, active: true },
    include: { skills: { orderBy: { position: "asc" }, include: { questions: { orderBy: { position: "asc" } } } } },
  });
  if (!template) redirect("/bibliotheque");

  const questions = template.skills.flatMap((s) => s.questions);
  const totalSec = questions.reduce((a, q) => a + q.suggestedTimeSec, 0);
  // Plus petite durée proposée qui laisse 20 % de marge.
  const duration = DURATIONS.find((d) => d * 60 >= totalSec * 1.2) ?? 60;
  const types = [...new Set(questions.map((q) => q.type))];

  const test = await db.$transaction(async (tx) => {
    const created = await tx.test.create({
      data: {
        companyId: user.companyId,
        createdById: user.id,
        title: template.title,
        jobTitle: template.profession,
        jobDescription: template.description,
        level: template.level,
        language: template.language,
        durationMinutes: duration,
        questionCount: Math.min(30, Math.max(1, questions.length)),
        questionTypes: types,
        templateId: template.id,
      },
    });
    await copySkills(tx, created.id, template.skills);
    return created;
  });
  redirect(`/tests/${test.id}/questions`);
}
