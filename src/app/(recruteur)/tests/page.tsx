import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { canEdit, requireCompany } from "@/lib/tenant";
import { LEVEL_LABELS, TEST_STATUS_LABELS } from "@/lib/tests/model";
import { btn, Card, PageTitle, StatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Tests" };

async function TestList() {
  const user = await requireCompany();
  const tests = await db.test.findMany({
    where: { companyId: user.companyId, status: { not: "ARCHIVED" } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      level: true,
      durationMinutes: true,
      questionCount: true,
      updatedAt: true,
      _count: { select: { invitations: true, attempts: true } },
    },
  });

  return (
    <>
      <PageTitle
        title="Tests"
        subtitle="Vos tests de recrutement."
        action={
          canEdit(user) && (
            <Link href="/tests/nouveau" className={btn.primary}>
              + Nouveau test
            </Link>
          )
        }
      />
      {tests.length === 0 ? (
        <Card className="text-center">
          <p className="font-semibold text-gray-900">Aucun test pour le moment.</p>
          <p className="mt-1 text-sm text-gray-600">
            Créez un test avec l&apos;IA, ou partez d&apos;un modèle de la{" "}
            <Link href="/bibliotheque" className="text-teal-800 underline">
              bibliothèque
            </Link>
            .
          </p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {tests.map((t) => (
            <li key={t.id}>
              <Link href={`/tests/${t.id}`} className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-teal-600">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-gray-900">{t.title}</span>
                  <StatusBadge status={t.status} label={TEST_STATUS_LABELS[t.status]} />
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {LEVEL_LABELS[t.level]} · {t.durationMinutes} min · {t.questionCount} questions · {t._count.invitations}{" "}
                  invité(s) · {t._count.attempts} passage(s)
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function TestsPage() {
  return (
    <Suspense fallback={<p className="text-gray-600">Chargement…</p>}>
      <TestList />
    </Suspense>
  );
}
