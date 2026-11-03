import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  ClipboardCheck,
  ClipboardList,
  Coins,
  Hourglass,
  Library,
  MailCheck,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import { db } from "@/lib/db";
import { canEdit, requireCompany } from "@/lib/tenant";
import { LEVEL_LABELS, TEST_STATUS_LABELS } from "@/lib/tests/model";
import { btn, Card, CardTitle, EmptyState, Loading, Notice, StatusBadge } from "@/components/ui";
import { ResendVerification } from "./resend-verification";

export const metadata: Metadata = { title: "Tableau de bord" };

function greeting() {
  const h = Number(new Date().toLocaleString("fr-FR", { timeZone: "Africa/Bangui", hour: "numeric", hour12: false }));
  return h < 18 ? "Bonjour" : "Bonsoir";
}

async function Dashboard() {
  const user = await requireCompany();
  const companyId = user.companyId;

  // Chaque compteur est filtré sur l'entreprise de l'utilisateur connecté.
  const [activeTests, invitations, toReview, pendingGrading, company, recentTests, recentResults] = await Promise.all([
    db.test.count({ where: { companyId, status: "PUBLISHED" } }),
    db.invitation.count({ where: { companyId, status: { not: "CANCELLED" } } }),
    db.attempt.count({ where: { companyId, status: { in: ["COMPLETED", "TIMED_OUT"] }, recruiterStatus: "TO_REVIEW" } }),
    db.attempt.count({ where: { companyId, status: { in: ["COMPLETED", "TIMED_OUT"] }, gradingStatus: { not: "DONE" } } }),
    db.company.findUnique({ where: { id: companyId }, select: { creditsRemaining: true } }),
    db.test.findMany({
      where: { companyId, status: { not: "ARCHIVED" } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        level: true,
        durationMinutes: true,
        _count: { select: { invitations: true, attempts: true } },
      },
    }),
    db.attempt.findMany({
      where: { companyId, status: { in: ["COMPLETED", "TIMED_OUT"] } },
      orderBy: { completedAt: "desc" },
      take: 5,
      select: {
        id: true,
        testId: true,
        globalScore: true,
        passed: true,
        candidate: { select: { name: true } },
        test: { select: { title: true } },
      },
    }),
  ]);

  const stats = [
    { label: "Tests en cours", value: activeTests, icon: ClipboardList, tone: "from-brand-500 to-brand-700" },
    { label: "Candidats invités", value: invitations, icon: Send, tone: "from-sky-500 to-sky-700" },
    { label: "Résultats à examiner", value: toReview, icon: ClipboardCheck, tone: "from-sun-400 to-sun-600" },
    { label: "Corrections en cours", value: pendingGrading, icon: Hourglass, tone: "from-violet-500 to-violet-700" },
  ];
  const editable = canEdit(user);

  return (
    <>
      {/* Bandeau d'accueil */}
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-ink-900 px-6 py-8 text-white shadow-lift sm:px-10">
        <div className="bg-pattern absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand-500/40 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-sun-400/10 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-300">{user.companyName}</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {greeting()} {user.name.split(" ")[0]}
            </h1>
            <p className="mt-2 max-w-lg text-white/80">
              {toReview > 0
                ? `${toReview} résultat(s) de candidat vous attendent.`
                : "Préparez un test et invitez vos candidats en quelques minutes."}
            </p>
          </div>
          {editable && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href="/tests/nouveau" className={`${btn.accent} px-5 py-3`}>
                <Sparkles className="h-4 w-4" /> Nouveau test
              </Link>
              <Link href="/bibliotheque" className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/10">
                <Library className="h-4 w-4" /> Partir d&apos;un modèle
              </Link>
            </div>
          )}
        </div>
      </section>

      {!user.emailVerified && (
        <div className="mb-6">
          <Notice tone="warning">
            <p>
              Confirmez votre adresse email (<strong>{user.email}</strong>) en cliquant sur le lien que nous vous avons envoyé.
            </p>
            <ResendVerification />
          </Notice>
        </div>
      )}

      {/* Indicateurs */}
      <dl className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-2">
              <dt className="text-sm font-medium text-stone-600">{label}</dt>
              <span className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-sm`}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <dd className="mt-3 text-3xl font-extrabold tracking-tight text-stone-900">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardTitle
            icon={ClipboardList}
            aside={
              recentTests.length > 0 && (
                <Link href="/tests" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
                  Tout voir <ArrowRight className="h-4 w-4" />
                </Link>
              )
            }
          >
            Derniers tests
          </CardTitle>
          {recentTests.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Aucun test pour le moment"
              action={
                editable && (
                  <Link href="/tests/nouveau" className={btn.primary}>
                    <Plus className="h-4 w-4" /> Créer mon premier test
                  </Link>
                )
              }
            >
              Créez un test avec l&apos;IA, ou partez d&apos;un modèle de la bibliothèque.
            </EmptyState>
          ) : (
            <ul className="-mx-2 divide-y divide-stone-100">
              {recentTests.map((t) => (
                <li key={t.id}>
                  <Link href={`/tests/${t.id}`} className="flex items-center justify-between gap-3 rounded-xl px-2 py-3 transition hover:bg-stone-50">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-stone-900">{t.title}</span>
                      <span className="text-xs text-stone-500">
                        {LEVEL_LABELS[t.level]} · {t.durationMinutes} min · {t._count.invitations} invité(s) · {t._count.attempts} passage(s)
                      </span>
                    </span>
                    <StatusBadge status={t.status} label={TEST_STATUS_LABELS[t.status]} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle icon={MailCheck}>Derniers résultats</CardTitle>
          {recentResults.length === 0 ? (
            <p className="rounded-xl bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
              Les résultats de vos candidats apparaîtront ici.
            </p>
          ) : (
            <ul className="-mx-2 divide-y divide-stone-100">
              {recentResults.map((r) => (
                <li key={r.id}>
                  <Link href={`/tests/${r.testId}/resultats/${r.id}`} className="flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-stone-50">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-stone-100 text-xs font-bold text-stone-700">
                      {r.candidate.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-stone-900">{r.candidate.name}</span>
                      <span className="block truncate text-xs text-stone-500">{r.test.title}</span>
                    </span>
                    {r.globalScore === null ? (
                      <span className="text-xs text-stone-500">En correction</span>
                    ) : (
                      <span className={`rounded-lg px-2 py-1 text-sm font-bold ${r.passed ? "bg-brand-50 text-brand-800" : "bg-red-50 text-red-700"}`}>
                        {Math.round(r.globalScore)}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 flex items-center gap-2 border-t border-stone-100 pt-4 text-sm text-stone-600">
            <Coins className="h-4 w-4 text-sun-600" /> Crédits restants : <strong className="text-stone-900">{company?.creditsRemaining ?? 0}</strong>
          </p>
        </Card>
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  );
}
