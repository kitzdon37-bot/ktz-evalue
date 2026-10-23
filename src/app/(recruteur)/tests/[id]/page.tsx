import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { canEdit, requireCompany } from "@/lib/tenant";
import { getCompanyTest } from "@/lib/tests/repository";
import { LANGUAGE_LABELS, LEVEL_LABELS, TEST_STATUS_LABELS } from "@/lib/tests/model";
import { ActionButton } from "@/components/form";
import { BackLink, btn, Card, Notice, PageTitle, StatusBadge } from "@/components/ui";
import { archiveTest, closeTest, deleteDraft, duplicateTest } from "../actions";

export const metadata: Metadata = { title: "Test" };

async function Content({ params, searchParams }: PageProps<"/tests/[id]">) {
  const { id } = await params;
  const { publie } = await searchParams;
  const user = await requireCompany();
  const test = await getCompanyTest(id, user.companyId);
  const editable = canEdit(user);
  const questions = test.skills.flatMap((s) => s.questions);
  const main = questions.filter((q) => !q.isReserve).length;

  return (
    <>
      <BackLink href="/tests">Tests</BackLink>
      <PageTitle
        title={test.title}
        subtitle={`${test.jobTitle} · ${LEVEL_LABELS[test.level]} · ${LANGUAGE_LABELS[test.language]} · ${test.durationMinutes} min`}
        action={<StatusBadge status={test.status} label={TEST_STATUS_LABELS[test.status]} />}
      />

      {publie && (
        <div className="mb-4">
          <Notice tone="success">
            Le test est publié. L&apos;envoi des invitations aux candidats arrive à la prochaine étape du projet.
          </Notice>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <Card>
          <h2 className="mb-3 font-semibold text-gray-900">Compétences évaluées</h2>
          {test.skills.length === 0 ? (
            <p className="text-sm text-gray-600">Aucune compétence pour le moment.</p>
          ) : (
            <ul className="space-y-2">
              {test.skills.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-gray-900">{s.name}</span>
                  <span className="text-gray-600">
                    {s.weight} % · {s.questions.length} question(s)
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 border-t border-gray-100 pt-3 text-sm text-gray-700">
            {main} question(s) posée(s) à chaque candidat sur {test.questionCount} prévues,{" "}
            {questions.length - main} en réserve · seuil de réussite {test.passThreshold}/100
            {test.deadline && <> · date limite le {test.deadline.toLocaleDateString("fr-FR", { timeZone: "Africa/Bangui" })}</>}
          </p>
        </Card>

        <Card className="space-y-3">
          <h2 className="font-semibold text-gray-900">Actions</h2>
          {test.status === "DRAFT" && editable && (
            <>
              <Link href={`/tests/${id}/questions`} className={`${btn.primary} w-full`}>
                Continuer la création
              </Link>
              <Link href={`/tests/${id}/apercu`} className={`${btn.secondary} w-full`}>
                Aperçu candidat
              </Link>
            </>
          )}
          {test.status !== "DRAFT" && (
            <Link href={`/tests/${id}/apercu`} className={`${btn.secondary} w-full`}>
              Aperçu candidat
            </Link>
          )}
          {editable && (
            <form action={duplicateTest.bind(null, id)}>
              <ActionButton className={`${btn.secondary} w-full`}>Dupliquer</ActionButton>
            </form>
          )}
          {editable && test.status === "PUBLISHED" && (
            <form action={closeTest.bind(null, id)}>
              <ActionButton className={`${btn.secondary} w-full`}>Fermer le test</ActionButton>
            </form>
          )}
          {editable && (test.status === "CLOSED" || test.status === "PUBLISHED") && (
            <form action={archiveTest.bind(null, id)}>
              <ActionButton className={`${btn.secondary} w-full`}>Archiver</ActionButton>
            </form>
          )}
          {editable && test.status === "DRAFT" && (
            <form action={deleteDraft.bind(null, id)}>
              <ActionButton className={`${btn.danger} w-full`}>Supprimer le brouillon</ActionButton>
            </form>
          )}
        </Card>
      </div>
    </>
  );
}

export default function TestPage(props: PageProps<"/tests/[id]">) {
  return (
    <Suspense fallback={<p className="text-gray-600">Chargement…</p>}>
      <Content {...props} />
    </Suspense>
  );
}
