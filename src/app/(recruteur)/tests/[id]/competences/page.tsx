import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireEditor } from "@/lib/tenant";
import { getCompanyTest } from "@/lib/tests/repository";
import { isAiConfigured } from "@/lib/ai";
import { BackLink, Notice, PageTitle , Loading } from "@/components/ui";
import { TestSteps } from "../steps";
import { SkillsForm } from "./skills-form";

export const metadata: Metadata = { title: "Compétences du test" };
// Génération des questions par IA : plusieurs appels en parallèle.
export const maxDuration = 300;

async function Content({ params, searchParams }: PageProps<"/tests/[id]/competences">) {
  const { id } = await params;
  const { ia } = await searchParams;
  const user = await requireEditor();
  const test = await getCompanyTest(id, user.companyId);
  if (test.status !== "DRAFT") redirect(`/tests/${id}`);
  const questionCount = test.skills.reduce((n, s) => n + s.questions.length, 0);

  return (
    <>
      <BackLink href={`/tests/${id}`}>{test.title}</BackLink>
      <PageTitle title="Compétences évaluées" subtitle="Le score final est calculé avec le poids de chaque compétence." />
      <TestSteps testId={id} current="competences" />
      {ia === "indisponible" && (
        <div className="mb-4">
          <Notice tone="warning">
            L&apos;IA est momentanément indisponible. Saisissez les compétences vous-même, ou réessayez plus tard avec le
            bouton « Proposer avec l&apos;IA ».
          </Notice>
        </div>
      )}
      <SkillsForm
        key={test.skills.map((s) => `${s.id}:${s.weight}:${s.name}`).join("|")}
        testId={id}
        aiAvailable={isAiConfigured()}
        hasQuestions={questionCount > 0}
        jobTitle={test.jobTitle}
        skills={test.skills.map((s) => ({ id: s.id, name: s.name, weight: s.weight, questions: s.questions.length }))}
      />
    </>
  );
}

export default function SkillsPage(props: PageProps<"/tests/[id]/competences">) {
  return (
    <Suspense fallback={<Loading />}>
      <Content {...props} />
    </Suspense>
  );
}
