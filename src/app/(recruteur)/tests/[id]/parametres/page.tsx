import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireEditor } from "@/lib/tenant";
import { getCompanyTest } from "@/lib/tests/repository";
import { BackLink, PageTitle , Loading } from "@/components/ui";
import { TestSteps } from "../steps";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Paramètres du test" };

// Date limite affichée au format AAAA-MM-JJ (heure de Bangui, UTC+1).
function toDateInput(d: Date | null) {
  if (!d) return "";
  return new Date(d.getTime() + 60 * 60 * 1000).toISOString().slice(0, 10);
}

async function Content({ params }: PageProps<"/tests/[id]/parametres">) {
  const { id } = await params;
  const user = await requireEditor();
  const test = await getCompanyTest(id, user.companyId);
  if (test.status !== "DRAFT") redirect(`/tests/${id}`);

  return (
    <>
      <BackLink href={`/tests/${id}`}>{test.title}</BackLink>
      <PageTitle title="Paramètres du test" subtitle="Réglez la correction, l'anti-triche et la diffusion, puis publiez." />
      <TestSteps testId={id} current="parametres" />
      <SettingsForm
        testId={id}
        values={{
          title: test.title,
          passThreshold: test.passThreshold,
          deadline: toDateInput(test.deadline),
          shuffleQuestions: test.shuffleQuestions,
          shuffleChoices: test.shuffleChoices,
          blockPaste: test.blockPaste,
          requireFullscreen: test.requireFullscreen,
          webcamEnabled: test.webcamEnabled,
          webcamIntervalSec: test.webcamIntervalSec,
          showScoreToCandidate: test.showScoreToCandidate,
          badgesEnabled: test.badgesEnabled,
        }}
      />
    </>
  );
}

export default function SettingsPage(props: PageProps<"/tests/[id]/parametres">) {
  return (
    <Suspense fallback={<Loading />}>
      <Content {...props} />
    </Suspense>
  );
}
