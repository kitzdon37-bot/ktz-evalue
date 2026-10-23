import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { canEdit, requireCompany } from "@/lib/tenant";
import { LEVEL_LABELS, QUESTION_TYPE_LABELS, TEST_STATUS_LABELS, type QuestionType } from "@/lib/tests/model";
import { ActionButton } from "@/components/form";
import { btn, Card, PageTitle, StatusBadge } from "@/components/ui";
import { duplicateTest } from "../tests/actions";
import { createFromTemplate } from "./actions";

export const metadata: Metadata = { title: "Bibliothèque de tests" };

async function Library() {
  const user = await requireCompany();
  const editable = canEdit(user);
  const [templates, ownTests] = await Promise.all([
    db.template.findMany({
      where: { active: true },
      orderBy: { profession: "asc" },
      include: {
        skills: {
          orderBy: { position: "asc" },
          select: { name: true, questions: { orderBy: { position: "asc" }, select: { id: true, prompt: true, type: true } } },
        },
      },
    }),
    db.test.findMany({
      where: { companyId: user.companyId, status: { in: ["PUBLISHED", "CLOSED", "ARCHIVED"] } },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, status: true, level: true, durationMinutes: true },
    }),
  ]);

  return (
    <>
      <PageTitle
        title="Bibliothèque de tests"
        subtitle="Des tests prêts à l'emploi par métier, à utiliser tels quels ou à adapter."
      />

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Modèles par métier</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((t) => {
            const count = t.skills.reduce((n, s) => n + s.questions.length, 0);
            return (
              <Card key={t.id} className="flex flex-col">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{t.profession}</p>
                <h3 className="mt-1 font-semibold text-gray-900">{t.title}</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {LEVEL_LABELS[t.level]} · {count} questions
                </p>
                {t.description && <p className="mt-2 text-sm text-gray-700">{t.description}</p>}
                <p className="mt-2 text-sm text-gray-700">
                  <span className="font-medium">Compétences :</span> {t.skills.map((s) => s.name).join(", ")}
                </p>
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer text-teal-800 underline">Voir les questions</summary>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-gray-700">
                    {t.skills.flatMap((s) =>
                      s.questions.map((q) => (
                        <li key={q.id}>
                          {q.prompt} <span className="text-xs text-gray-500">({QUESTION_TYPE_LABELS[q.type as QuestionType]})</span>
                        </li>
                      )),
                    )}
                  </ol>
                </details>
                {editable && (
                  <form action={createFromTemplate.bind(null, t.id)} className="mt-4 pt-1">
                    <ActionButton className={`${btn.primary} w-full sm:w-auto`}>Utiliser ce modèle</ActionButton>
                  </form>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Vos tests déjà publiés</h2>
        {ownTests.length === 0 ? (
          <p className="text-sm text-gray-600">Les tests que vous publiez apparaîtront ici, pour être réutilisés.</p>
        ) : (
          <ul className="space-y-2">
            {ownTests.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3">
                <Link href={`/tests/${t.id}`} className="font-medium text-gray-900 underline">
                  {t.title}
                </Link>
                <span className="flex items-center gap-3">
                  <StatusBadge status={t.status} label={TEST_STATUS_LABELS[t.status]} />
                  {editable && (
                    <form action={duplicateTest.bind(null, t.id)}>
                      <ActionButton className={btn.small}>Dupliquer</ActionButton>
                    </form>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<p className="text-gray-600">Chargement…</p>}>
      <Library />
    </Suspense>
  );
}
