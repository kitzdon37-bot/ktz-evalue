import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireCompany } from "@/lib/tenant";
import { getTestResults, RECRUITER_STATUS_LABELS, sortRows } from "@/lib/results-view";
import { GlobalScore, ReliabilityBadge, ScoreBar } from "@/components/results";
import { BackLink, btn, Card, PageTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Résultats" };

async function Content({ params, searchParams }: PageProps<"/tests/[id]/resultats">) {
  const { id } = await params;
  const sp = await searchParams;
  const sort = typeof sp.tri === "string" ? sp.tri : "score";
  const statusFilter = typeof sp.statut === "string" ? sp.statut : "";
  const user = await requireCompany();
  const { test, skills, rows } = await getTestResults(id, user.companyId);

  const filtered = sortRows(rows, sort).filter((r) => !statusFilter || r.recruiterStatus === statusFilter);
  const finished = rows.filter((r) => r.finished);
  const link = (patch: Record<string, string>) => {
    const q = new URLSearchParams({ tri: sort, ...(statusFilter ? { statut: statusFilter } : {}), ...patch });
    for (const [k, v] of [...q.entries()]) if (!v) q.delete(k);
    return `/tests/${id}/resultats?${q.toString()}`;
  };
  const sortOptions = [
    { key: "score", label: "Score global" },
    ...skills.map((s) => ({ key: `competence-${s.id}`, label: s.name })),
    { key: "fiabilite", label: "Fiabilité" },
    { key: "date", label: "Date" },
  ];

  return (
    <>
      <BackLink href={`/tests/${id}`}>{test.title}</BackLink>
      <PageTitle
        title="Classement des candidats"
        subtitle={`${finished.length} test(s) terminé(s) · ${rows.length - finished.length} en cours · seuil de réussite ${test.passThreshold}/100`}
        action={
          <div className="flex gap-2">
            <a href={`/tests/${id}/export?format=csv`} className={btn.secondary}>
              Export CSV
            </a>
            <a href={`/tests/${id}/export?format=xlsx`} className={btn.secondary}>
              Export Excel
            </a>
          </div>
        }
      />

      <div className="mb-4 flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:items-center">
        <span className="font-medium text-gray-700">Trier par :</span>
        <div className="flex flex-wrap gap-1">
          {sortOptions.map((o) => (
            <Link
              key={o.key}
              href={link({ tri: o.key })}
              className={`rounded-full border px-3 py-1 ${sort === o.key ? "border-teal-700 bg-teal-50 text-teal-900" : "border-gray-300 bg-white text-gray-700"}`}
            >
              {o.label}
            </Link>
          ))}
        </div>
        <span className="font-medium text-gray-700 sm:ml-4">Statut :</span>
        <div className="flex flex-wrap gap-1">
          {[["", "Tous"], ...Object.entries(RECRUITER_STATUS_LABELS)].map(([k, l]) => (
            <Link
              key={k}
              href={link({ statut: k })}
              className={`rounded-full border px-3 py-1 ${statusFilter === k ? "border-teal-700 bg-teal-50 text-teal-900" : "border-gray-300 bg-white text-gray-700"}`}
            >
              {l}
            </Link>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center text-sm text-gray-600">
          Aucun résultat pour le moment.{" "}
          <Link href={`/tests/${id}/inviter`} className="text-teal-800 underline">
            Inviter des candidats
          </Link>
        </Card>
      ) : (
        <form action={`/tests/${id}/comparer`} method="get">
          <ol className="space-y-3">
            {filtered.map((r, i) => (
              <li key={r.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <input
                    type="checkbox"
                    name="ids"
                    value={r.id}
                    disabled={!r.finished}
                    aria-label={`Comparer ${r.name}`}
                    className="mt-1.5 h-5 w-5"
                  />
                  <span className="mt-1 w-6 text-sm font-semibold text-gray-500">{sort === "score" && r.globalScore !== null ? i + 1 : ""}</span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/tests/${id}/resultats/${r.id}`} className="font-semibold text-gray-900 underline">
                      {r.name}
                    </Link>
                    <p className="text-sm text-gray-600">
                      {r.finished
                        ? `Terminé le ${r.completedAt?.toLocaleDateString("fr-FR", { timeZone: "Africa/Bangui" })}${r.status === "TIMED_OUT" ? " (temps écoulé)" : ""}`
                        : "Test en cours"}{" "}
                      · {r.recruiterStatusLabel}
                    </p>
                  </div>
                  <div className="text-right">
                    <GlobalScore score={r.globalScore} pending={r.gradingPending} passed={r.passed} />
                    <div className="mt-1">
                      <ReliabilityBadge level={r.reliability} label={r.reliabilityLabel ? `Fiabilité : ${r.reliabilityLabel}` : null} />
                    </div>
                  </div>
                </div>
                {r.finished && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {r.skillScores.map((s) => (
                      <ScoreBar key={s.id} label={s.name} score={s.score} />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
          <div className="sticky bottom-0 mt-4 flex items-center gap-3 border-t border-gray-200 bg-gray-50 py-3">
            <button type="submit" className={btn.primary}>
              Comparer la sélection
            </button>
            <span className="text-sm text-gray-600">Cochez 2 à 4 candidats.</span>
          </div>
        </form>
      )}
    </>
  );
}

export default function ResultsPage(props: PageProps<"/tests/[id]/resultats">) {
  return (
    <Suspense fallback={<p className="text-gray-600">Chargement…</p>}>
      <Content {...props} />
    </Suspense>
  );
}
