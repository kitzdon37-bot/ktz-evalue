import "server-only";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import {
  CorrectAnswerSchema,
  RubricSchema,
  ChoiceSchema,
  type QuestionData,
  type QuestionType,
  type Level,
} from "./model";
import * as z from "zod";

// Lecture d'un test avec ses compétences et questions, TOUJOURS filtrée sur l'entreprise.
export async function getCompanyTest(testId: string, companyId: string) {
  const test = await db.test.findFirst({
    where: { id: testId, companyId },
    include: {
      skills: {
        orderBy: { position: "asc" },
        include: { questions: { orderBy: { position: "asc" } } },
      },
    },
  });
  if (!test) notFound();
  return test;
}

export type CompanyTest = Awaited<ReturnType<typeof getCompanyTest>>;
type DbQuestion = CompanyTest["skills"][number]["questions"][number];

// Convertit une question de la base vers le format commun (champs JSON vérifiés).
export function fromDb(q: Pick<DbQuestion, "type" | "prompt" | "choices" | "correctAnswer" | "rubric" | "explanation" | "difficulty" | "suggestedTimeSec" | "points">): QuestionData {
  const choices = z.array(ChoiceSchema).safeParse(q.choices);
  const correct = CorrectAnswerSchema.safeParse(q.correctAnswer);
  const rubric = RubricSchema.safeParse(q.rubric);
  return {
    type: q.type as QuestionType,
    prompt: q.prompt,
    choices: choices.success ? choices.data : null,
    correctAnswer: correct.success ? correct.data : null,
    rubric: rubric.success ? rubric.data : null,
    explanation: q.explanation,
    difficulty: q.difficulty as Level,
    suggestedTimeSec: q.suggestedTimeSec,
    points: q.points,
  };
}

// null en JSON doit s'écrire Prisma.DbNull (sinon Prisma ne vide pas le champ).
const json = (v: unknown) => (v === null ? Prisma.DbNull : (v as Prisma.InputJsonValue));

// Champs à écrire en base pour une question.
export function toDb(q: QuestionData) {
  return {
    type: q.type,
    prompt: q.prompt,
    choices: json(q.choices),
    correctAnswer: json(q.correctAnswer),
    rubric: json(q.rubric),
    explanation: q.explanation,
    difficulty: q.difficulty,
    suggestedTimeSec: q.suggestedTimeSec,
    points: q.points,
  };
}

// Copie les compétences et questions d'un test ou d'un modèle vers un nouveau test.
export async function copySkills(
  tx: Prisma.TransactionClient,
  targetTestId: string,
  skills: { name: string; weight: number; position: number; questions: (DbQuestion | Omit<DbQuestion, "skillId">)[] }[],
) {
  for (const s of skills) {
    await tx.skill.create({
      data: {
        testId: targetTestId,
        name: s.name,
        weight: s.weight,
        position: s.position,
        questions: {
          create: s.questions.map((q) => ({
            ...toDb(fromDb(q)),
            origin: q.origin,
            isReserve: q.isReserve,
            position: q.position,
          })),
        },
      },
    });
  }
}
