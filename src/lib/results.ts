import "server-only";
import { db } from "@/lib/db";
import { AiBudgetError, AiUnavailableError } from "@/lib/ai";
import { gradeOpenAnswer } from "@/lib/ai/grading";
import { fromDb } from "@/lib/tests/repository";
import { RUBRIC_GRADED, type QuestionType } from "@/lib/tests/model";
import { attemptOrder, recomputeScores } from "@/lib/candidate/attempt";
import {
  reliability,
  SIMILARITY_MIN_LENGTH,
  SIMILARITY_THRESHOLD,
  textSimilarity,
} from "@/lib/scoring/reliability";

const MAX_TRIES = 3;

function answerText(content: unknown, transcript: string | null): string | null {
  if (transcript?.trim()) return transcript;
  if (content && typeof content === "object" && "text" in content && typeof content.text === "string") return content.text;
  return null;
}

// ───── File de correction par l'IA ─────

// Corrige les réponses ouvertes en attente. Si l'IA est indisponible, les réponses
// restent dans la file et seront corrigées au prochain passage (cron horaire).
export async function processGradingQueue(opts: { attemptId?: string; limit?: number } = {}) {
  const answers = await db.answer.findMany({
    where: {
      gradingStatus: { in: ["PENDING", "FAILED"] },
      gradingTries: { lt: MAX_TRIES },
      overrideScore: null,
      ...(opts.attemptId ? { attemptId: opts.attemptId } : {}),
      attempt: { status: { not: "IN_PROGRESS" } },
    },
    include: { question: true, attempt: { select: { id: true, companyId: true } } },
    orderBy: { submittedAt: "asc" },
    take: opts.limit ?? 20,
  });

  const touched = new Set<string>();
  let graded = 0;
  for (const a of answers) {
    const q = fromDb(a.question);
    if (!RUBRIC_GRADED.includes(q.type as QuestionType)) continue;
    const text = answerText(a.content, a.transcript);
    if (q.type === "ORAL" && !text && a.audioUrl) continue; // en attente de transcription
    if (!text) {
      await db.answer.update({ where: { id: a.id }, data: { aiScore: 0, gradingStatus: "DONE", aiJustification: "Pas de réponse." } });
      touched.add(a.attempt.id);
      continue;
    }
    await db.answer.update({ where: { id: a.id }, data: { gradingStatus: "IN_PROGRESS", gradingTries: { increment: 1 } } });
    try {
      const r = await gradeOpenAnswer(a.attempt.companyId, q, text);
      await db.answer.update({
        where: { id: a.id },
        data: { aiScore: r.score, aiJustification: r.justification, aiRubricResults: r.criteria, gradingStatus: "DONE" },
      });
      graded++;
      touched.add(a.attempt.id);
    } catch (e) {
      const unavailable = e instanceof AiUnavailableError || e instanceof AiBudgetError;
      await db.answer.update({
        where: { id: a.id },
        // IA indisponible : on remet la réponse dans la file sans compter l'essai.
        data: unavailable
          ? { gradingStatus: "PENDING", gradingTries: { decrement: 1 } }
          : { gradingStatus: a.gradingTries + 1 >= MAX_TRIES ? "FAILED" : "PENDING" },
      });
      if (unavailable) break;
      console.error("[correction] échec", e);
    }
  }
  for (const attemptId of touched) {
    await recomputeScores(attemptId);
    await analyzeAttempt(attemptId);
  }
  return graded;
}

// ───── Analyse : textes similaires, fiabilité, questions d'entretien ─────

export async function analyzeAttempt(attemptId: string) {
  const attempt = await db.attempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: {
      answers: { include: { question: { select: { id: true, prompt: true, type: true, points: true, skill: { select: { name: true } } } } } },
      integrityEvents: true,
      test: { select: { id: true } },
    },
  });
  if (attempt.status === "IN_PROGRESS") return;

  // 1. Réponses écrites très proches de celles d'un autre candidat du même test.
  const openAnswers = attempt.answers.filter(
    (a) => RUBRIC_GRADED.includes(a.question.type as QuestionType) && (answerText(a.content, a.transcript)?.length ?? 0) >= SIMILARITY_MIN_LENGTH,
  );
  if (openAnswers.length) {
    const others = await db.answer.findMany({
      where: {
        questionId: { in: openAnswers.map((a) => a.questionId) },
        attemptId: { not: attempt.id },
        attempt: { testId: attempt.test.id, status: { not: "IN_PROGRESS" } },
      },
      select: { attemptId: true, questionId: true, content: true, transcript: true },
    });
    for (const mine of openAnswers) {
      const myText = answerText(mine.content, mine.transcript)!;
      for (const other of others.filter((o) => o.questionId === mine.questionId)) {
        const otherText = answerText(other.content, other.transcript);
        if (!otherText || otherText.length < SIMILARITY_MIN_LENGTH) continue;
        const sim = textSimilarity(myText, otherText);
        if (sim < SIMILARITY_THRESHOLD) continue;
        // Signal enregistré pour les deux candidats, une seule fois par paire et par question.
        for (const [from, to] of [
          [attempt.id, other.attemptId],
          [other.attemptId, attempt.id],
        ]) {
          const exists = await db.integrityEvent.findFirst({
            where: { attemptId: from, questionId: mine.questionId, type: "SIMILAR_TEXT", details: { path: ["otherAttemptId"], equals: to } },
            select: { id: true },
          });
          if (!exists) {
            await db.integrityEvent.create({
              data: {
                attemptId: from,
                questionId: mine.questionId,
                type: "SIMILAR_TEXT",
                occurredAt: new Date(),
                details: { otherAttemptId: to, similarity: Math.round(sim * 100) },
              },
            });
          }
        }
        if (other.attemptId !== attempt.id) await refreshReliability(other.attemptId);
      }
    }
  }

  // 2. Indice de fiabilité.
  await refreshReliability(attempt.id);

  // 3. Deux ou trois questions à reposer en entretien.
  const events = await db.integrityEvent.findMany({ where: { attemptId: attempt.id, questionId: { not: null } } });
  const suspicious = new Set(events.filter((e) => ["PASTE", "FAST_ANSWER", "SIMILAR_TEXT"].includes(e.type)).map((e) => e.questionId));
  const order = attemptOrder(attempt).map((o) => o.questionId);
  const byId = new Map(attempt.answers.map((a) => [a.questionId, a]));
  const suggestions: string[] = [];
  for (const qid of order) {
    if (suggestions.length >= 3) break;
    const a = byId.get(qid);
    if (a && suspicious.has(qid)) suggestions.push(`Faire réexpliquer à l'oral (signal pendant le test) : « ${a.question.prompt} »`);
  }
  const weak = attempt.answers
    .map((a) => {
      const got = a.overrideScore ?? a.autoScore ?? a.aiScore;
      return { a, ratio: got === null ? 1 : got / Math.max(1, a.question.points) };
    })
    .filter((x) => x.ratio < 0.5 && !suspicious.has(x.a.questionId))
    .sort((x, y) => x.ratio - y.ratio);
  for (const { a } of weak) {
    if (suggestions.length >= 3) break;
    suggestions.push(`Vérifier la compétence « ${a.question.skill.name} » : « ${a.question.prompt} »`);
  }
  await db.attempt.update({ where: { id: attempt.id }, data: { interviewQuestions: suggestions } });
}

async function refreshReliability(attemptId: string) {
  const events = await db.integrityEvent.findMany({ where: { attemptId }, select: { type: true, durationMs: true } });
  const r = reliability(events);
  await db.attempt.update({ where: { id: attemptId }, data: { reliability: r.level, reliabilitySummary: r.summary } });
}
