"use server";

import { refresh } from "next/cache";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/tenant";
import { recomputeScores } from "@/lib/candidate/attempt";
import { analyzeAttempt, processGradingQueue } from "@/lib/results";
import type { FormState } from "@/lib/auth/schemas";

const STATUSES = ["TO_REVIEW", "SHORTLISTED", "INTERVIEW", "REJECTED"] as const;

async function companyAttempt(attemptId: string) {
  const user = await requireEditor();
  const attempt = await db.attempt.findFirst({ where: { id: attemptId, companyId: user.companyId }, select: { id: true } });
  if (!attempt) throw new Error("Résultat introuvable.");
  return { user, attempt };
}

export async function setRecruiterStatus(attemptId: string, formData: FormData) {
  const { attempt } = await companyAttempt(attemptId);
  const status = String(formData.get("status"));
  if (!(STATUSES as readonly string[]).includes(status)) return;
  await db.attempt.update({ where: { id: attempt.id }, data: { recruiterStatus: status as (typeof STATUSES)[number] } });
  refresh();
}

export async function saveRecruiterNote(attemptId: string, _state: FormState, formData: FormData): Promise<FormState> {
  const { attempt } = await companyAttempt(attemptId);
  const note = String(formData.get("note") ?? "").slice(0, 5000);
  await db.attempt.update({ where: { id: attempt.id }, data: { recruiterNote: note || null } });
  refresh();
  return { success: "Note enregistrée." };
}

// Le recruteur modifie la note d'une réponse ; la modification est enregistrée avec son nom.
export async function overrideAnswerScore(answerId: string, _state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireEditor();
  const answer = await db.answer.findFirst({
    where: { id: answerId, attempt: { companyId: user.companyId } },
    select: { id: true, attemptId: true, question: { select: { points: true } } },
  });
  if (!answer) return { message: "Réponse introuvable." };
  const raw = String(formData.get("score") ?? "").trim().replace(",", ".");
  if (raw === "") {
    await db.answer.update({ where: { id: answer.id }, data: { overrideScore: null, overriddenById: null, overriddenAt: null } });
  } else {
    const score = Number(raw);
    if (!Number.isFinite(score) || score < 0 || score > answer.question.points) {
      return { message: `La note doit être entre 0 et ${answer.question.points}.` };
    }
    await db.answer.update({
      where: { id: answer.id },
      data: { overrideScore: score, overriddenById: user.id, overriddenAt: new Date(), gradingStatus: "DONE" },
    });
  }
  await recomputeScores(answer.attemptId);
  await analyzeAttempt(answer.attemptId);
  refresh();
  return { success: "Note modifiée." };
}

// Relance la correction par l'IA des réponses en attente (par exemple après une panne).
export async function retryGrading(attemptId: string) {
  const { attempt } = await companyAttempt(attemptId);
  await db.answer.updateMany({
    where: { attemptId: attempt.id, gradingStatus: "FAILED", overrideScore: null },
    data: { gradingStatus: "PENDING", gradingTries: 0 },
  });
  await processGradingQueue({ attemptId: attempt.id });
  refresh();
}
