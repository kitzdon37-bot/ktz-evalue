import type { Metadata } from "next";
import { Suspense } from "react";
import { requireCompany } from "@/lib/tenant";
import { fromDb, getCompanyTest } from "@/lib/tests/repository";
import { isMcq, QUESTION_TYPE_LABELS } from "@/lib/tests/model";
import { BackLink, Notice, PageTitle } from "@/components/ui";
import { TestSteps } from "../steps";

export const metadata: Metadata = { title: "Aperçu du test" };

// Aperçu de ce que voit le candidat : une question par écran, sans les bonnes réponses.
async function Content({ params }: PageProps<"/tests/[id]/apercu">) {
  const { id } = await params;
  const user = await requireCompany();
  const test = await getCompanyTest(id, user.companyId);
  const questions = test.skills.flatMap((s) => s.questions.filter((q) => !q.isReserve).map((q) => fromDb(q)));

  return (
    <>
      <BackLink href={`/tests/${id}`}>{test.title}</BackLink>
      <PageTitle title="Aperçu candidat" subtitle="Les questions telles qu'elles s'afficheront sur le téléphone du candidat." />
      {test.status === "DRAFT" && <TestSteps testId={id} current="apercu" />}
      <div className="mb-4">
        <Notice>
          Le candidat voit une question à la fois, avec un chronomètre. Ici, toutes les questions posées sont affichées à
          la suite (hors réserve). Les bonnes réponses ne sont jamais envoyées au candidat.
        </Notice>
      </div>
      <div className="mx-auto max-w-sm space-y-4">
        {questions.map((q, i) => (
          <div key={i} className="rounded-2xl border-4 border-gray-800 bg-white p-4 shadow">
            <div className="mb-2 flex justify-between text-xs text-gray-600">
              <span>
                Question {i + 1} / {questions.length}
              </span>
              <span>⏱ {Math.floor(q.suggestedTimeSec / 60)}:{String(q.suggestedTimeSec % 60).padStart(2, "0")}</span>
            </div>
            <div className="mb-3 h-1.5 rounded bg-gray-200">
              <div className="h-1.5 rounded bg-teal-700" style={{ width: `${((i + 1) / questions.length) * 100}%` }} />
            </div>
            <p className="select-none text-base text-gray-900">{q.prompt}</p>
            <div className="mt-3 space-y-2">
              {isMcq(q.type) &&
                q.choices?.map((c) => (
                  <div key={c.id} className="rounded-lg border border-gray-300 px-3 py-3 text-sm">
                    {c.text}
                  </div>
                ))}
              {q.type === "TRUE_FALSE" && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-gray-300 px-3 py-3 text-center text-sm">Vrai</div>
                  <div className="rounded-lg border border-gray-300 px-3 py-3 text-center text-sm">Faux</div>
                </div>
              )}
              {q.type === "SHORT_ANSWER" && <div className="h-11 rounded-lg border border-gray-300" />}
              {(q.type === "FREE_TEXT" || q.type === "SCENARIO") && <div className="h-28 rounded-lg border border-gray-300" />}
              {q.type === "ORAL" && (
                <div className="rounded-lg border border-gray-300 px-3 py-3 text-center text-sm">🎙 Enregistrer ma réponse</div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">{QUESTION_TYPE_LABELS[q.type]}</p>
            <div className="mt-3 rounded-lg bg-teal-700 py-3 text-center text-sm font-semibold text-white">Valider</div>
          </div>
        ))}
        {questions.length === 0 && <p className="text-center text-gray-600">Aucune question pour le moment.</p>}
      </div>
    </>
  );
}

export default function PreviewPage(props: PageProps<"/tests/[id]/apercu">) {
  return (
    <Suspense fallback={<p className="text-gray-600">Chargement…</p>}>
      <Content {...props} />
    </Suspense>
  );
}
