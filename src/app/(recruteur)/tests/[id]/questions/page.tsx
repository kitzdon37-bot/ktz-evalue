import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireEditor } from "@/lib/tenant";
import { fromDb, getCompanyTest } from "@/lib/tests/repository";
import { isAiConfigured } from "@/lib/ai";
import { checkQuestion, questionPlan, QUESTION_TYPE_LABELS, type QuestionType } from "@/lib/tests/model";
import { ActionButton } from "@/components/form";
import { BackLink, btn, Card, input, Notice, PageTitle } from "@/components/ui";
import { addQuestion } from "../../actions";
import { TestSteps } from "../steps";
import { QuestionEditor } from "./question-editor";
import { GenerateMissing } from "./generate-missing";

export const metadata: Metadata = { title: "Questions du test" };
export const maxDuration = 300;

async function Content({ params, searchParams }: PageProps<"/tests/[id]/questions">) {
  const { id } = await params;
  const { manquantes } = await searchParams;
  const user = await requireEditor();
  const test = await getCompanyTest(id, user.companyId);
  if (test.status !== "DRAFT") redirect(`/tests/${id}`);
  const aiAvailable = isAiConfigured();

  if (test.skills.length === 0) {
    return (
      <>
        <PageTitle title="Questions" />
        <TestSteps testId={id} current="questions" />
        <Notice tone="warning">
          Ajoutez d&apos;abord les compétences à évaluer.{" "}
          <Link href={`/tests/${id}/competences`} className="font-semibold underline">
            Aller aux compétences
          </Link>
        </Notice>
      </>
    );
  }

  const plan = questionPlan(test.skills.map((s) => s.weight), test.questionCount);
  const mainCount = test.skills.reduce((n, s) => n + s.questions.filter((q) => !q.isReserve).length, 0);
  const reserveCount = test.skills.reduce((n, s) => n + s.questions.filter((q) => q.isReserve).length, 0);
  const totalWanted = plan.reduce((n, p) => n + p.total, 0);
  const totalHave = mainCount + reserveCount;
  const types = test.questionTypes as QuestionType[];

  return (
    <>
      <BackLink href={`/tests/${id}`}>{test.title}</BackLink>
      <PageTitle
        title="Relecture des questions"
        subtitle="Relisez chaque question : rien n'est envoyé aux candidats sans votre validation."
      />
      <TestSteps testId={id} current="questions" />

      <div className="mb-4 space-y-3">
        {manquantes && (
          <Notice tone="warning">
            L&apos;IA n&apos;a pas pu produire {manquantes} question(s) conforme(s). Complétez à la main ou relancez la
            génération.
          </Notice>
        )}
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-700">
            <strong>{mainCount}</strong> question(s) posée(s) sur <strong>{test.questionCount}</strong> attendues ·{" "}
            <strong>{reserveCount}</strong> en réserve
          </p>
          {aiAvailable && totalHave < totalWanted && <GenerateMissing testId={id} missing={totalWanted - totalHave} />}
        </Card>
      </div>

      <div className="space-y-8">
        {test.skills.map((skill, si) => (
          <section key={skill.id}>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              {skill.name} <span className="text-sm font-normal text-gray-600">· {skill.weight} % · {skill.questions.length}/{plan[si].total} questions</span>
            </h2>
            <div className="space-y-3">
              {skill.questions.map((q, i) => {
                const data = fromDb(q);
                return (
                  <QuestionEditor
                    key={q.id}
                    testId={id}
                    index={i + 1}
                    isFirst={i === 0}
                    isLast={i === skill.questions.length - 1}
                    aiAvailable={aiAvailable}
                    question={{ ...data, id: q.id, isReserve: q.isReserve, origin: q.origin, problems: checkQuestion(data) }}
                  />
                );
              })}
            </div>
            <form action={addQuestion.bind(null, id)} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input type="hidden" name="skillId" value={skill.id} />
              <select name="type" aria-label="Type de la nouvelle question" className={`${input} sm:max-w-xs`}>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {QUESTION_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
              <ActionButton className={btn.secondary}>+ Ajouter une question</ActionButton>
            </form>
          </section>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Link href={`/tests/${id}/parametres`} className={btn.primary}>
          Paramètres et publication →
        </Link>
      </div>
    </>
  );
}

export default function QuestionsPage(props: PageProps<"/tests/[id]/questions">) {
  return (
    <Suspense fallback={<p className="text-gray-600">Chargement…</p>}>
      <Content {...props} />
    </Suspense>
  );
}
