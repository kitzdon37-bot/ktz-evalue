import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireCompany } from "@/lib/tenant";
import { getTestResults, RECRUITER_STATUS_LABELS, sortRows } from "@/lib/results-view";
import { GlobalScore, ReliabilityBadge, ScoreBar } from "@/components/results";
import { BackLink, btn, EmptyState, Loading, PageTitle } from "@/components/ui";
import { Columns3, FileDown, FileSpreadsheet, Trophy } from "lucide-react";

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
              <FileDown className="h-4 w-4" /> CSV
            </a>
            <a href={`/tests/${id}/export?format=xlsx`} className={btn.secondary}>
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </a>
          </div>
        }
      />

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 text-sm shadow-soft sm:flex-row sm:flex-wrap sm:items-center">
        <span className="font-bold text-stone-900">Trier par</span>
        <div className="flex flex-wrap gap-1">
          {sortOptions.map((o) => (
            <Link
              key={o.key}
              href={link({ tri: o.key })}
              className={`rounded-full px-3 py-1.5 font-semibold transition ${sort === o.key ? "bg-brand-700 text-white shadow-sm" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}
            >
              {o.label}
            </Link>
          ))}
        </div>
        <span className="font-bold text-stone-900 sm:ml-4">Statut</span>
        <div className="flex flex-wrap gap-1">
          {[["", "Tous"], ...Object.entries(RECRUITER_STATUS_LABELS)].map(([k, l]) => (
            <Link
              key={k}
              href={link({ statut: k })}
              className={`rounded-full px-3 py-1.5 font-semibold transition ${statusFilter === k ? "bg-brand-700 text-white shadow-sm" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}
            >
              {l}
            </Link>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Aucun résultat pour le moment"
          action={
            <Link href={`/tests/${id}/inviter`} className={btn.primary}>
              Inviter des candidats
            </Link>
          }
        >
          Le classement s&apos;affichera dès que vos candidats auront terminé le test.
        </EmptyState>
      ) : (
        <form action={`/tests/${id}/comparer`} method="get">
          <ol className="space-y-3">
            {filtered.map((r, i) => (
              <li key={r.id} className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-soft transition hover:shadow-lift">
                <div className="flex flex-wrap items-start gap-3">
                  <input
                    type="checkbox"
                    name="ids"
                    value={r.id}
                    disabled={!r.finished}
                    aria-label={`Comparer ${r.name}`}
                    className="mt-2.5 h-5 w-5 accent-brand-700"
                  />
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-extrabold ${
                      sort === "score" && r.globalScore !== null
                        ? i === 0
                          ? "bg-gradient-to-br from-sun-300 to-sun-500 text-stone-900 shadow-sm"
                          : "bg-brand-50 text-brand-800 ring-1 ring-brand-100"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {sort === "score" && r.globalScore !== null ? i + 1 : r.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/tests/${id}/resultats/${r.id}`} className="text-base font-bold text-stone-900 hover:text-brand-700">
                      {r.name}
                    </Link>
                    <p className="text-sm text-stone-600">
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
                  <div className="mt-4 grid gap-3 border-t border-stone-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                    {r.skillScores.map((s) => (
                      <ScoreBar key={s.id} label={s.name} score={s.score} />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
          <div className="sticky bottom-4 mt-6 flex items-center gap-3 rounded-2xl border border-stone-200/80 bg-white/90 px-4 py-3 shadow-lift backdrop-blur">
            <button type="submit" className={btn.primary}>
              <Columns3 className="h-4 w-4" /> Comparer la sélection
            </button>
            <span className="text-sm text-stone-600">Cochez 2 à 4 candidats.</span>
          </div>
        </form>
      )}
    </>
  );
}

export default function ResultsPage(props: PageProps<"/tests/[id]/resultats">) {
  return (
    <Suspense fallback={<Loading />}>
      <Content {...props} />
    </Suspense>
  );
}
