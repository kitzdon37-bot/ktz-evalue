import "server-only";
import { randomBytes } from "node:crypto";
import { after } from "next/server";
import * as z from "zod";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { fromDb } from "@/lib/tests/repository";
import { AUTO_GRADED, type QuestionData, type QuestionType } from "@/lib/tests/model";
import { gradeClosed, type AnswerContent } from "@/lib/scoring/grade";
import { computeScores } from "@/lib/scoring/score";
import { notifyRecruiterOfCompletion } from "@/lib/messages";
import { drawQuestions, type DrawnQuestion } from "./draw";

// Marge accordée pour la latence réseau (3G) avant de considérer un temps comme dépassé.
const GRACE_SEC = 15;
const RETENTION_MONTHS = 12;

export async function loadInvitation(token: string) {
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return null;
  return db.invitation.findUnique({
    where: { token },
    include: {
      candidate: { select: { id: true, name: true } },
      company: { select: { name: true, logoUrl: true, primaryColor: true } },
      test: {
        include: {
          skills: { orderBy: { position: "asc" }, include: { questions: { orderBy: { position: "asc" } } } },
        },
      },
      attempt: true,
    },
  });
}

export type LoadedInvitation = NonNullable<Awaited<ReturnType<typeof loadInvitation>>>;
export type LoadedAttempt = NonNullable<LoadedInvitation["attempt"]>;

const OrderSchema = z.array(z.object({ questionId: z.string(), choiceOrder: z.array(z.string()).nullable() }));

export function attemptOrder(attempt: { questionOrder: unknown }): DrawnQuestion[] {
  const parsed = OrderSchema.safeParse(attempt.questionOrder);
  return parsed.success ? parsed.data : [];
}

export function questionIndex(inv: LoadedInvitation) {
  const map = new Map<string, { data: QuestionData; skillId: string; weight: number; id: string }>();
  for (const s of inv.test.skills) {
    for (const q of s.questions) map.set(q.id, { data: fromDb(q), skillId: s.id, weight: s.weight, id: q.id });
  }
  return map;
}

export function timeFactor(inv: { extraTimePercent: number }) {
  return 1 + Math.max(0, inv.extraTimePercent) / 100;
}

export function newDeviceId() {
  return randomBytes(12).toString("base64url");
}

// ───── Démarrage ─────

export async function startAttempt(inv: LoadedInvitation, info: { deviceId: string; userAgent: string | null; ip: string | null; webcamConsent: boolean }) {
  const order = drawQuestions(
    inv.test.skills.map((s) => ({
      questions: s.questions.map((q) => {
        const d = fromDb(q);
        return { id: q.id, isReserve: q.isReserve, choiceIds: d.choices ? d.choices.map((c) => c.id) : null };
      }),
    })),
    { shuffleQuestions: inv.test.shuffleQuestions, shuffleChoices: inv.test.shuffleChoices },
  );
  const now = new Date();
  const endsAt = new Date(now.getTime() + inv.test.durationMinutes * 60_000 * timeFactor(inv));
  try {
    await db.$transaction([
      db.attempt.create({
        data: {
          companyId: inv.companyId,
          testId: inv.testId,
          candidateId: inv.candidateId,
          invitationId: inv.id,
          questionOrder: order,
          startedAt: now,
          endsAt,
          questionStartedAt: now,
          deviceId: info.deviceId,
          userAgent: info.userAgent?.slice(0, 300),
          ip: info.ip,
          consentDataAt: now,
          consentWebcamAt: info.webcamConsent ? now : null,
        },
      }),
      db.invitation.update({ where: { id: inv.id }, data: { status: "STARTED" } }),
    ]);
  } catch (e) {
    // Double clic sur « Commencer » : le passage existe déjà, on continue simplement.
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
  }
}

// ───── Avancement ─────

// Applique les règles de temps : test terminé si le chronomètre global est écoulé,
// question suivante si le temps de la question est dépassé (réponse vide enregistrée).
// Renvoie le passage à jour.
export async function enforceTime(inv: LoadedInvitation, attempt: LoadedAttempt): Promise<LoadedAttempt> {
  if (attempt.status !== "IN_PROGRESS") return attempt;
  const now = Date.now();
  if (now > attempt.endsAt.getTime() + GRACE_SEC * 1000) {
    return finishAttempt(inv, attempt.id, "TIMED_OUT");
  }
  const order = attemptOrder(attempt);
  const questions = questionIndex(inv);
  let current = attempt;
  // Plusieurs questions peuvent avoir expiré (téléphone éteint longtemps).
  while (current.status === "IN_PROGRESS" && current.currentIndex < order.length) {
    const q = questions.get(order[current.currentIndex].questionId);
    const started = (current.questionStartedAt ?? current.startedAt).getTime();
    const limit = ((q?.data.suggestedTimeSec ?? 60) * timeFactor(inv) + GRACE_SEC) * 1000;
    if (now <= started + limit) break;
    current = await saveAnswerAndAdvance(inv, current, order[current.currentIndex].questionId, null, {
      expired: true,
      advanceStart: new Date(started + limit),
    });
  }
  return current;
}

function readContent(type: QuestionType, form: FormData, choiceOrder: string[] | null): AnswerContent | null {
  if (type === "MCQ_SINGLE" || type === "MCQ_MULTI") {
    const valid = new Set(choiceOrder ?? []);
    const ids = form
      .getAll("choice")
      .map(String)
      .filter((id) => valid.has(id));
    const unique = [...new Set(ids)];
    if (unique.length === 0) return null;
    return { choiceIds: type === "MCQ_SINGLE" ? unique.slice(0, 1) : unique };
  }
  if (type === "TRUE_FALSE") {
    const v = form.get("tf");
    return v === "true" ? { value: true } : v === "false" ? { value: false } : null;
  }
  const text = String(form.get("text") ?? "").slice(0, 10_000);
  return text.trim() ? { text } : null;
}

// Enregistre la réponse envoyée par le candidat pour la question `questionId`.
// Une réponse renvoyée deux fois (coupure réseau) n'est enregistrée qu'une fois.
export async function submitAnswer(inv: LoadedInvitation, attempt: LoadedAttempt, questionId: string, form: FormData) {
  const order = attemptOrder(attempt);
  const currentId = order[attempt.currentIndex]?.questionId;
  if (attempt.status !== "IN_PROGRESS" || questionId !== currentId) return attempt;
  const q = questionIndex(inv).get(questionId);
  if (!q) return attempt;
  const content = readContent(q.data.type, form, order[attempt.currentIndex].choiceOrder);
  return saveAnswerAndAdvance(inv, attempt, questionId, content, { expired: false, advanceStart: new Date() });
}

async function saveAnswerAndAdvance(
  inv: LoadedInvitation,
  attempt: LoadedAttempt,
  questionId: string,
  content: AnswerContent | null,
  opts: { expired: boolean; advanceStart: Date },
): Promise<LoadedAttempt> {
  const q = questionIndex(inv).get(questionId)!;
  const started = (attempt.questionStartedAt ?? attempt.startedAt).getTime();
  const maxSec = q.data.suggestedTimeSec * timeFactor(inv);
  const timeSpentSec = Math.round(Math.min(maxSec, Math.max(0, (opts.advanceStart.getTime() - started) / 1000)));
  const autoScore = AUTO_GRADED.includes(q.data.type) ? gradeClosed(q.data, content) : null;
  const order = attemptOrder(attempt);
  const nextIndex = attempt.currentIndex + 1;

  // Mise à jour conditionnelle sur currentIndex : deux envois simultanés ne font avancer qu'une fois.
  const advanced = await db.$transaction(async (tx) => {
    const { count } = await tx.attempt.updateMany({
      where: { id: attempt.id, status: "IN_PROGRESS", currentIndex: attempt.currentIndex },
      data: { currentIndex: nextIndex, questionStartedAt: opts.advanceStart },
    });
    if (count !== 1) return false;
    await tx.answer.create({
      data: {
        attemptId: attempt.id,
        questionId,
        content: content === null ? Prisma.DbNull : (content as Prisma.InputJsonValue),
        timeSpentSec,
        autoScore,
        gradingStatus: autoScore !== null ? "DONE" : content === null ? "DONE" : "PENDING",
        // Réponse vide à une question ouverte : 0 point, rien à corriger.
        aiScore: autoScore === null && content === null ? 0 : null,
      },
    });
    // Réponse anormalement rapide : moins de 20 % du temps conseillé sur une question longue.
    if (content !== null && q.data.suggestedTimeSec >= 120 && timeSpentSec < q.data.suggestedTimeSec * 0.2) {
      await tx.integrityEvent.create({
        data: {
          attemptId: attempt.id,
          questionId,
          type: "FAST_ANSWER",
          occurredAt: new Date(),
          details: { timeSpentSec, suggestedTimeSec: q.data.suggestedTimeSec },
        },
      });
    }
    return true;
  });

  const fresh = await db.attempt.findUniqueOrThrow({ where: { id: attempt.id } });
  if (advanced && nextIndex >= order.length) {
    return finishAttempt(inv, attempt.id, "COMPLETED");
  }
  return fresh;
}

// ───── Fin du test ─────

export async function finishAttempt(
  inv: LoadedInvitation,
  attemptId: string,
  status: "COMPLETED" | "TIMED_OUT",
): Promise<LoadedAttempt> {
  const now = new Date();
  const { count } = await db.attempt.updateMany({
    where: { id: attemptId, status: "IN_PROGRESS" },
    data: { status, completedAt: now },
  });
  if (count === 1) {
    await recomputeScores(attemptId);
    const purgeAt = new Date(now);
    purgeAt.setMonth(purgeAt.getMonth() + RETENTION_MONTHS);
    await db.$transaction([
      db.attempt.update({ where: { id: attemptId }, data: { purgeAt } }),
      db.invitation.update({ where: { id: inv.id }, data: { status: "COMPLETED" } }),
    ]);
    // Email au recruteur après la réponse, pour ne pas ralentir le candidat.
    after(() => notifyRecruiterOfCompletion(attemptId));
  }
  return db.attempt.findUniqueOrThrow({ where: { id: attemptId } });
}

// Recalcule les scores d'un passage à partir des réponses corrigées.
// Les questions sans réponse comptent 0 ; les réponses ouvertes non corrigées laissent le score « en attente ».
export async function recomputeScores(attemptId: string) {
  const attempt = await db.attempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: {
      answers: true,
      test: { include: { skills: { include: { questions: { select: { id: true, points: true } } } } } },
    },
  });
  const order = attemptOrder(attempt);
  const meta = new Map<string, { skillId: string; weight: number; points: number }>();
  for (const s of attempt.test.skills) for (const q of s.questions) meta.set(q.id, { skillId: s.id, weight: s.weight, points: q.points });
  const answers = new Map(attempt.answers.map((a) => [a.questionId, a]));

  const items = order.flatMap(({ questionId }) => {
    const m = meta.get(questionId);
    if (!m) return [];
    const a = answers.get(questionId);
    const finished = attempt.status !== "IN_PROGRESS";
    let points: number | null;
    if (!a) points = finished ? 0 : null;
    else if (a.overrideScore !== null) points = a.overrideScore;
    else if (a.autoScore !== null) points = a.autoScore;
    else points = a.aiScore;
    return [{ skillId: m.skillId, weight: m.weight, maxPoints: m.points, points }];
  });
  const scores = computeScores(items);
  await db.attempt.update({
    where: { id: attemptId },
    data: {
      skillScores: scores.skillScores,
      globalScore: scores.globalScore,
      passed: scores.globalScore === null ? null : scores.globalScore >= attempt.test.passThreshold,
      gradingStatus: scores.complete ? "DONE" : "PENDING",
    },
  });
  return scores;
}
