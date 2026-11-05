import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Clock, HelpCircle, Plus, Sparkles, Users } from "lucide-react";
import { db } from "@/lib/db";
import { canEdit, requireCompany } from "@/lib/tenant";
import { LEVEL_LABELS, TEST_STATUS_LABELS } from "@/lib/tests/model";
import { btn, EmptyState, Loading, Notice, PageTitle, StatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Tests" };

async function TestList({ searchParams }: { searchParams: PageProps<"/tests">["searchParams"] }) {
  const { supprime } = await searchParams;
  const user = await requireCompany();
  const tests = await db.test.findMany({
    where: { companyId: user.companyId, status: { not: "ARCHIVED" } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      jobTitle: true,
      status: true,
      level: true,
      durationMinutes: true,
      questionCount: true,
      updatedAt: true,
      _count: { select: { invitations: true, attempts: true } },
    },
  });
  const editable = canEdit(user);

  return (
    <>
      <PageTitle
        eyebrow="Recrutement"
        title="Vos tests"
        subtitle="Créez, publiez et suivez vos tests de recrutement."
        action={
          editable && (
            <Link href="/tests/nouveau" className={btn.primary}>
              <Plus className="h-4 w-4" /> Nouveau test
            </Link>
          )
        }
      />
      {supprime && (
        <div className="mb-6">
          <Notice tone="success">Le test a été supprimé définitivement.</Notice>
        </div>
      )}
      {tests.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Aucun test pour le moment"
          action={
            editable && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href="/tests/nouveau" className={btn.primary}>
                  <Sparkles className="h-4 w-4" /> Créer avec l&apos;IA
                </Link>
                <Link href="/bibliotheque" className={btn.secondary}>
                  Partir d&apos;un modèle
                </Link>
              </div>
            )
          }
        >
          Un test se crée en quelques minutes à partir de votre offre d&apos;emploi.
        </EmptyState>
      ) : (
        <ul className="stagger grid gap-4 md:grid-cols-2">
          {tests.map((t) => (
            <li key={t.id}>
              <Link
                href={`/tests/${t.id}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift"
              >
                <div className="glow-follow" aria-hidden="true" />
                <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-400 to-brand-600 transition-transform duration-500 group-hover:scale-x-100" aria-hidden="true" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold uppercase tracking-wide text-brand-600">{t.jobTitle}</p>
                    <h2 className="mt-1 text-lg font-bold leading-snug text-stone-900">{t.title}</h2>
                  </div>
                  <StatusBadge status={t.status} label={TEST_STATUS_LABELS[t.status]} />
                </div>
                <div className="relative mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-stone-400" /> {t.durationMinutes} min
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-stone-400" /> {t.questionCount} questions · {LEVEL_LABELS[t.level]}
                  </span>
                </div>
                {t._count.invitations > 0 && (
                  <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-stone-100" aria-hidden="true">
                    <div
                      className="grow-x h-1.5 rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                      style={{ width: `${Math.max(3, Math.round((t._count.attempts / t._count.invitations) * 100))}%` }}
                    />
                  </div>
                )}
                <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-stone-100 pt-4 text-sm">
                  <span className="inline-flex items-center gap-1.5 text-stone-700">
                    <Users className="h-4 w-4 text-stone-400" />
                    <strong className="text-stone-900">{t._count.attempts}</strong> passage(s) sur {t._count.invitations} invité(s)
                  </span>
                  <ArrowRight className="h-4 w-4 text-stone-400 transition duration-300 group-hover:translate-x-1 group-hover:text-brand-600" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function TestsPage(props: PageProps<"/tests">) {
  return (
    <Suspense fallback={<Loading />}>
      <TestList searchParams={props.searchParams} />
    </Suspense>
  );
}
