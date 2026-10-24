import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireCompany } from "@/lib/tenant";
import { formatDuration, getTestResults } from "@/lib/results-view";
import { GlobalScore, ReliabilityBadge, ScoreBar } from "@/components/results";
import { BackLink, Notice, PageTitle , Loading } from "@/components/ui";

export const metadata: Metadata = { title: "Comparaison" };

async function Content({ params, searchParams }: PageProps<"/tests/[id]/comparer">) {
  const { id } = await params;
  const sp = await searchParams;
  const ids = (Array.isArray(sp.ids) ? sp.ids : sp.ids ? [sp.ids] : []).slice(0, 4);
  const user = await requireCompany();
  const { test, rows } = await getTestResults(id, user.companyId);
  const selected = ids.map((x) => rows.find((r) => r.id === x)).filter((r) => r !== undefined);

  if (selected.length < 2) {
    return (
      <>
        <BackLink href={`/tests/${id}/resultats`}>Classement</BackLink>
        <Notice tone="warning">Sélectionnez 2 à 4 candidats dans le classement pour les comparer.</Notice>
      </>
    );
  }

  return (
    <>
      <BackLink href={`/tests/${id}/resultats`}>Classement</BackLink>
      <PageTitle title="Comparaison des candidats" subtitle={test.title} />
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))` }}>
        {selected.map((r) => (
          <div key={r.id} className="rounded-lg border border-stone-200 bg-white p-4">
            <Link href={`/tests/${id}/resultats/${r.id}`} className="font-semibold text-stone-900 underline">
              {r.name}
            </Link>
            <div className="mt-2">
              <GlobalScore score={r.globalScore} pending={r.gradingPending} passed={r.passed} />
            </div>
            <div className="mt-2">
              <ReliabilityBadge level={r.reliability} label={r.reliabilityLabel ? `Fiabilité : ${r.reliabilityLabel}` : null} />
            </div>
            <p className="mt-1 text-xs text-stone-600">{r.reliabilitySummary}</p>
            <div className="mt-4 space-y-3">
              {r.skillScores.map((s) => (
                <ScoreBar key={s.id} label={s.name} score={s.score} />
              ))}
            </div>
            <dl className="mt-4 space-y-1 text-sm text-stone-700">
              <div>
                <dt className="inline font-medium">Durée : </dt>
                <dd className="inline">{formatDuration(r.durationSec)}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Statut : </dt>
                <dd className="inline">{r.recruiterStatusLabel}</dd>
              </div>
              {r.recruiterNote && (
                <div>
                  <dt className="font-medium">Note :</dt>
                  <dd className="whitespace-pre-wrap">{r.recruiterNote}</dd>
                </div>
              )}
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}

export default function ComparePage(props: PageProps<"/tests/[id]/comparer">) {
  return (
    <Suspense fallback={<Loading />}>
      <Content {...props} />
    </Suspense>
  );
}
