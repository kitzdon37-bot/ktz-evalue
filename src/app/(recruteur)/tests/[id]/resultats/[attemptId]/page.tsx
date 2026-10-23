import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import * as z from "zod";
import { db } from "@/lib/db";
import { canEdit, requireCompany } from "@/lib/tenant";
import { fromDb } from "@/lib/tests/repository";
import { isMcq, QUESTION_TYPE_LABELS, RUBRIC_GRADED, type QuestionType } from "@/lib/tests/model";
import { attemptOrder } from "@/lib/candidate/attempt";
import { RELIABILITY_LABELS, type ReliabilityLevel } from "@/lib/scoring/reliability";
import { formatDuration, RECRUITER_STATUS_LABELS } from "@/lib/results-view";
import { ActionButton } from "@/components/form";
import { GlobalScore, ReliabilityBadge, ScoreBar } from "@/components/results";
import { BackLink, btn, Card, Notice } from "@/components/ui";
import { retryGrading, setRecruiterStatus } from "../actions";
import { NoteForm, OverrideForm } from "./forms";

export const metadata: Metadata = { title: "Fiche candidat" };
export const maxDuration = 300;

const EVENT_LABELS: Record<string, string> = {
  TAB_HIDDEN: "Sortie de l'onglet ou de l'application",
  FULLSCREEN_EXIT: "Sortie du plein écran",
  PASTE: "Tentative de collage",
  FAST_ANSWER: "Réponse anormalement rapide",
  DEVICE_CHANGE: "Changement d'appareil ou de navigateur",
  SIMILAR_TEXT: "Texte très proche de celui d'un autre candidat",
  NO_FACE: "Aucun visage visible",
  MULTIPLE_FACES: "Plusieurs personnes visibles",
  CAMERA_OFF: "Caméra coupée",
};

const CriteriaSchema = z.array(z.object({ label: z.string(), met: z.string(), points: z.number(), max: z.number() }));

function formatTime(d: Date) {
  return d.toLocaleTimeString("fr-FR", { timeZone: "Africa/Bangui", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

async function Content({ params }: PageProps<"/tests/[id]/resultats/[attemptId]">) {
  const { id, attemptId } = await params;
  const user = await requireCompany();
  const editable = canEdit(user);
  const attempt = await db.attempt.findFirst({
    where: { id: attemptId, testId: id, companyId: user.companyId },
    include: {
      candidate: true,
      test: { include: { skills: { orderBy: { position: "asc" }, include: { questions: true } } } },
      answers: { include: { overriddenBy: { select: { name: true } } } },
      integrityEvents: { orderBy: { occurredAt: "asc" } },
    },
  });
  if (!attempt) notFound();

  const order = attemptOrder(attempt);
  const questions = new Map(
    attempt.test.skills.flatMap((s) => s.questions.map((q) => [q.id, { q, data: fromDb(q), skill: s.name }] as const)),
  );
  const answers = new Map(attempt.answers.map((a) => [a.questionId, a]));
  const position = new Map(order.map((o, i) => [o.questionId, i + 1]));
  const scores = (attempt.skillScores ?? {}) as Record<string, number>;
  const reliability = attempt.reliability as ReliabilityLevel | null;
  const pending = attempt.status !== "IN_PROGRESS" && attempt.gradingStatus !== "DONE";
  const interview = z.array(z.string()).safeParse(attempt.interviewQuestions);

  return (
    <>
      <BackLink href={`/tests/${id}/resultats`}>Classement</BackLink>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{attempt.candidate.name}</h1>
          <p className="text-gray-600">{[attempt.candidate.email, attempt.candidate.phone].filter(Boolean).join(" · ")}</p>
          <p className="text-sm text-gray-600">
            {attempt.test.title} · commencé le {attempt.startedAt.toLocaleString("fr-FR", { timeZone: "Africa/Bangui" })}
            {attempt.completedAt &&
              ` · durée ${formatDuration(Math.round((attempt.completedAt.getTime() - attempt.startedAt.getTime()) / 1000))}`}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <GlobalScore score={attempt.globalScore} pending={pending} passed={attempt.passed} />
          <a href={`/tests/${id}/resultats/${attempt.id}/rapport`} className={btn.secondary}>
            Rapport PDF
          </a>
        </div>
      </div>

      {attempt.status === "IN_PROGRESS" && (
        <div className="mb-4">
          <Notice>Le candidat est en train de passer le test.</Notice>
        </div>
      )}
      {pending && (
        <div className="mb-4">
          <Notice tone="warning">
            Correction en cours : certaines réponses écrites attendent la notation par l&apos;IA. Le score global
            s&apos;affichera ensuite.
            {editable && (
              <form action={retryGrading.bind(null, attempt.id)} className="mt-2">
                <ActionButton className={btn.small} pendingText="Correction…">
                  Relancer la correction maintenant
                </ActionButton>
              </form>
            )}
          </Notice>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold text-gray-900">Score par compétence</h2>
          <div className="space-y-3">
            {attempt.test.skills.map((s) => (
              <ScoreBar key={s.id} label={`${s.name} (${s.weight} %)`} score={attempt.status === "IN_PROGRESS" ? null : (scores[s.id] ?? null)} />
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-semibold text-gray-900">Fiabilité</h2>
            <ReliabilityBadge level={reliability} label={reliability ? RELIABILITY_LABELS[reliability] : null} />
          </div>
          <p className="text-sm text-gray-800">{attempt.reliabilitySummary ?? "Analyse à la fin du test."}</p>
          {attempt.integrityEvents.length > 0 && (
            <ul className="mt-3 max-h-56 space-y-1 overflow-y-auto text-sm text-gray-700">
              {attempt.integrityEvents.map((e) => (
                <li key={e.id}>
                  {formatTime(e.occurredAt)} — {EVENT_LABELS[e.type] ?? e.type}
                  {e.durationMs ? ` (${Math.round(e.durationMs / 1000)} s)` : ""}
                  {e.questionId && position.get(e.questionId) ? ` · question ${position.get(e.questionId)}` : ""}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-gray-500">Aucun candidat n&apos;est exclu automatiquement : ces signaux vous aident à décider.</p>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold text-gray-900">Décision</h2>
          {editable ? (
            <form action={setRecruiterStatus.bind(null, attempt.id)} className="mb-4 flex flex-wrap gap-2">
              {Object.entries(RECRUITER_STATUS_LABELS).map(([k, l]) => (
                <button
                  key={k}
                  type="submit"
                  name="status"
                  value={k}
                  className={`rounded-full border px-3 py-1.5 text-sm ${attempt.recruiterStatus === k ? "border-teal-700 bg-teal-700 text-white" : "border-gray-300 bg-white text-gray-800 hover:bg-gray-100"}`}
                >
                  {l}
                </button>
              ))}
            </form>
          ) : (
            <p className="mb-4 text-sm">{RECRUITER_STATUS_LABELS[attempt.recruiterStatus]}</p>
          )}
          {editable ? <NoteForm attemptId={attempt.id} note={attempt.recruiterNote ?? ""} /> : <p className="text-sm">{attempt.recruiterNote}</p>}
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold text-gray-900">À reposer en entretien</h2>
          {interview.success && interview.data.length > 0 ? (
            <ul className="list-disc space-y-2 pl-5 text-sm text-gray-800">
              {interview.data.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">Aucune suggestion pour le moment.</p>
          )}
        </Card>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-gray-900">Réponses</h2>
      <ol className="space-y-3">
        {order.map((o, i) => {
          const entry = questions.get(o.questionId);
          if (!entry) return null;
          const { q, data, skill } = entry;
          const a = answers.get(q.id);
          const content = (a?.content ?? null) as { choiceIds?: string[]; value?: boolean; text?: string } | null;
          const correct = new Set(data.correctAnswer?.choiceIds ?? []);
          const given = new Set(content?.choiceIds ?? []);
          const got = a ? (a.overrideScore ?? a.autoScore ?? a.aiScore) : null;
          const criteria = CriteriaSchema.safeParse(a?.aiRubricResults);
          return (
            <li key={q.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-xs text-gray-600">
                  Question {i + 1} · {skill} · {QUESTION_TYPE_LABELS[data.type]} ·{" "}
                  {a ? `${a.timeSpentSec} s / ${data.suggestedTimeSec} s conseillées` : "non posée"}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {got === null ? (a && RUBRIC_GRADED.includes(data.type as QuestionType) ? "Correction en cours" : "—") : `${got} / ${data.points} pt`}
                </p>
              </div>
              <p className="mt-1 text-gray-900">{data.prompt}</p>

              {isMcq(data.type) && (
                <ul className="mt-2 space-y-1 text-sm">
                  {(o.choiceOrder ?? []).map((cid) => {
                    const c = data.choices?.find((x) => x.id === cid);
                    if (!c) return null;
                    return (
                      <li key={cid} className={`rounded px-2 py-1 ${given.has(cid) ? (correct.has(cid) ? "bg-teal-50 text-teal-900" : "bg-red-50 text-red-800") : correct.has(cid) ? "text-teal-800" : "text-gray-700"}`}>
                        {given.has(cid) ? "● " : "○ "}
                        {c.text}
                        {correct.has(cid) && " ✓"}
                      </li>
                    );
                  })}
                </ul>
              )}
              {data.type === "TRUE_FALSE" && (
                <p className="mt-2 text-sm">
                  Réponse : <strong>{content?.value === true ? "Vrai" : content?.value === false ? "Faux" : "aucune"}</strong> · attendu :{" "}
                  {data.correctAnswer?.value ? "Vrai" : "Faux"}
                </p>
              )}
              {data.type === "SHORT_ANSWER" && (
                <p className="mt-2 text-sm">
                  Réponse : <strong>{content?.text ?? "aucune"}</strong> · attendu : {String(data.correctAnswer?.value ?? "")}
                  {data.correctAnswer?.tolerance ? ` (± ${data.correctAnswer.tolerance})` : ""}
                </p>
              )}
              {RUBRIC_GRADED.includes(data.type as QuestionType) && (
                <div className="mt-2 space-y-2">
                  <p className="whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-sm text-gray-900">
                    {a?.transcript ?? content?.text ?? <em className="text-gray-500">Pas de réponse</em>}
                  </p>
                  {a?.aiJustification && (
                    <div className="rounded-md border border-sky-100 bg-sky-50 p-3 text-sm text-sky-950">
                      <p className="font-medium">Avis de l&apos;IA</p>
                      <p>{a.aiJustification}</p>
                      {criteria.success && (
                        <ul className="mt-2 space-y-0.5">
                          {criteria.data.map((c) => (
                            <li key={c.label}>
                              {c.met === "oui" ? "✓" : c.met === "partiel" ? "◐" : "✗"} {c.label} — {c.points}/{c.max}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}
              {a?.overrideScore !== null && a?.overriddenBy && (
                <p className="mt-2 text-xs text-gray-600">
                  Note modifiée par {a.overriddenBy.name}
                  {a.overriddenAt && ` le ${a.overriddenAt.toLocaleDateString("fr-FR", { timeZone: "Africa/Bangui" })}`}
                  {a.aiScore !== null && ` (note de l'IA : ${a.aiScore})`}
                  {a.autoScore !== null && ` (note automatique : ${a.autoScore})`}
                </p>
              )}
              {editable && a && attempt.status !== "IN_PROGRESS" && <OverrideForm answerId={a.id} current={a.overrideScore} max={data.points} />}
            </li>
          );
        })}
      </ol>
    </>
  );
}

export default function AttemptPage(props: PageProps<"/tests/[id]/resultats/[attemptId]">) {
  return (
    <Suspense fallback={<p className="text-gray-600">Chargement…</p>}>
      <Content {...props} />
    </Suspense>
  );
}
