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
import { CountUp } from "@/components/home/count-up";
import { ResendVerification } from "./resend-verification";

export const metadata: Metadata = { title: "Tableau de bord" };

function greeting() {
  const h = Number(new Date().toLocaleString("fr-FR", { timeZone: "Africa/Bangui", hour: "numeric", hour12: false }));
  return h < 18 ? "Bonjour" : "Bonsoir";
}

// Couleur de l'avatar d'un candidat, stable d'une visite à l'autre (selon son nom).
const AVATAR_TONES = ["from-brand-400 to-brand-600", "from-sky-400 to-sky-600", "from-violet-400 to-violet-600", "from-emerald-400 to-emerald-600", "from-sun-400 to-sun-600", "from-rose-400 to-rose-600"];
const avatarTone = (name: string) => AVATAR_TONES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_TONES.length];

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
    { label: "Tests en cours", value: activeTests, icon: ClipboardList, tone: "from-brand-500 to-brand-700", live: activeTests > 0 },
    { label: "Candidats invités", value: invitations, icon: Send, tone: "from-sky-500 to-sky-700", live: false },
    { label: "Résultats à examiner", value: toReview, icon: ClipboardCheck, tone: "from-sun-400 to-sun-600", live: toReview > 0 },
    { label: "Corrections en cours", value: pendingGrading, icon: Hourglass, tone: "from-violet-500 to-violet-700", live: pendingGrading > 0 },
  ];
  const editable = canEdit(user);

  return (
    <>
      {/* Bandeau d'accueil : clair, chaleureux, avec une vraie photo */}
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 via-white to-sun-50 shadow-lift ring-1 ring-brand-100">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="blob blob-1 -left-20 -top-24 h-72 w-72 bg-brand-200/60" />
          <div className="blob blob-2 bottom-[-6rem] left-1/3 h-64 w-64 bg-sun-200/60" />
        </div>
        <div className="relative grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
          <div className="px-6 py-8 sm:px-10">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-brand-700 shadow-sm ring-1 ring-brand-100">
              <span className="live-dot" aria-hidden="true" /> {user.companyName}
            </p>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-stone-900 sm:text-[2rem]">
              {greeting()} {user.name.split(" ")[0]} <span className="wave">👋</span>
            </h1>
            <p className="mt-2 max-w-lg text-stone-600">
              {toReview > 0 ? (
                <>
                  <strong className="text-brand-700">{toReview} résultat(s)</strong> de candidat vous attendent.
                </>
              ) : (
                "Préparez un test et invitez vos candidats en quelques minutes."
              )}
            </p>
            {editable && (
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Link href="/tests/nouveau" className={`${btn.primary} px-5 py-3`}>
                  <Sparkles className="h-4 w-4" /> Nouveau test
                </Link>
                <Link href="/bibliotheque" className={`${btn.secondary} px-5 py-3`}>
                  <Library className="h-4 w-4" /> Partir d&apos;un modèle
                </Link>
              </div>
            )}
          </div>
          <div className="relative hidden h-full min-h-56 md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/recruteurs-resultats.jpg"
              alt="Équipe de recrutement qui examine les résultats"
              className="kenburns absolute inset-0 h-full w-full object-cover [mask-image:linear-gradient(90deg,transparent,#000_35%)]"
            />
          </div>
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

      {/* Indicateurs, avec des chiffres qui défilent */}
      <div className="stagger mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone, live }) => (
          <Link
            key={label}
            href="/tests"
            className="group relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
          >
            <div className="glow-follow" aria-hidden="true" />
            <div className="relative flex items-start justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-medium text-stone-600">
                {label}
                {live && <span className="live-dot" aria-label="en cours" />}
              </p>
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-md transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110`}
              >
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className="relative mt-3 text-4xl font-extrabold tracking-tight text-stone-900">
              <CountUp value={value} duration={1100} />
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardTitle
            icon={ClipboardList}
            aside={
              recentTests.length > 0 && (
                <Link href="/tests" className="group inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
                  Tout voir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
              Créez un test en quelques minutes, ou partez d&apos;un modèle de la bibliothèque.
            </EmptyState>
          ) : (
            <ul className="stagger -mx-2 divide-y divide-stone-100">
              {recentTests.map((t) => {
                const rate = t._count.invitations ? Math.round((t._count.attempts / t._count.invitations) * 100) : 0;
                return (
                  <li key={t.id}>
                    <Link href={`/tests/${t.id}`} className="group flex items-center gap-3 rounded-xl px-2 py-3 transition duration-300 hover:bg-brand-50/60">
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-3">
                          <span className="truncate font-semibold text-stone-900 transition-colors group-hover:text-brand-800">{t.title}</span>
                          <StatusBadge status={t.status} label={TEST_STATUS_LABELS[t.status]} />
                        </span>
                        <span className="mt-0.5 block text-xs text-stone-500">
                          {LEVEL_LABELS[t.level]} · {t.durationMinutes} min · {t._count.attempts} passage(s) sur {t._count.invitations} invité(s)
                        </span>
                        {t._count.invitations > 0 && (
                          <span className="mt-2 flex items-center gap-2">
                            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                              <span className="grow-x block h-1.5 rounded-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${Math.max(rate, 3)}%` }} />
                            </span>
                            <span className="w-9 text-right text-xs font-bold tabular-nums text-stone-600">{rate} %</span>
                          </span>
                        )}
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-stone-300 transition duration-300 group-hover:translate-x-1 group-hover:text-brand-600" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle icon={MailCheck}>Derniers résultats</CardTitle>
          {recentResults.length === 0 ? (
            <div className="rounded-xl bg-stone-50 px-4 py-8 text-center">
              <MailCheck className="float-y mx-auto h-8 w-8 text-brand-300" />
              <p className="mt-2 text-sm text-stone-500">Les résultats de vos candidats apparaîtront ici.</p>
            </div>
          ) : (
            <ul className="stagger -mx-2 divide-y divide-stone-100">
              {recentResults.map((r) => {
                const score = r.globalScore === null ? null : Math.round(r.globalScore);
                return (
                  <li key={r.id}>
                    <Link href={`/tests/${r.testId}/resultats/${r.id}`} className="group flex items-center gap-3 rounded-xl px-2 py-3 transition duration-300 hover:bg-brand-50/60">
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${avatarTone(r.candidate.name)} text-sm font-bold text-white shadow-sm transition-transform duration-300 group-hover:scale-110`}
                      >
                        {r.candidate.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-stone-900">{r.candidate.name}</span>
                        <span className="block truncate text-xs text-stone-500">{r.test.title}</span>
                        {score !== null && (
                          <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-stone-100">
                            <span
                              className={`grow-x block h-1 rounded-full ${r.passed ? "bg-gradient-to-r from-emerald-400 to-emerald-600" : "bg-gradient-to-r from-red-300 to-red-500"}`}
                              style={{ width: `${Math.max(score, 3)}%` }}
                            />
                          </span>
                        )}
                      </span>
                      {score === null ? (
                        <span className="inline-flex items-center gap-1 text-xs text-violet-700">
                          <Hourglass className="h-3.5 w-3.5 animate-pulse" /> En correction
                        </span>
                      ) : (
                        <span className={`rounded-lg px-2 py-1 text-sm font-bold tabular-nums ${r.passed ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
                          {score}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-4 flex items-center gap-2 border-t border-stone-100 pt-4 text-sm text-stone-600">
            <Coins className="h-4 w-4 text-sun-600" /> Crédits restants :{" "}
            <strong className="text-stone-900">
              <CountUp value={company?.creditsRemaining ?? 0} duration={900} />
            </strong>
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
