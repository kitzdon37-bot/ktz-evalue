import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  Archive,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  Globe,
  Lock,
  PenLine,
  Send,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import { db } from "@/lib/db";
import { canEdit, requireCompany } from "@/lib/tenant";
import { getCompanyTest } from "@/lib/tests/repository";
import { LANGUAGE_LABELS, LEVEL_LABELS, TEST_STATUS_LABELS } from "@/lib/tests/model";
import { ActionButton } from "@/components/form";
import { BackLink, btn, Card, CardTitle, Loading, Notice, StatusBadge } from "@/components/ui";
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

  const [invited, finished, avg] = await Promise.all([
    db.invitation.count({ where: { testId: id, companyId: user.companyId, status: { not: "CANCELLED" } } }),
    db.attempt.count({ where: { testId: id, companyId: user.companyId, status: { in: ["COMPLETED", "TIMED_OUT"] } } }),
    db.attempt.aggregate({ where: { testId: id, companyId: user.companyId, globalScore: { not: null } }, _avg: { globalScore: true } }),
  ]);
  const average = avg._avg.globalScore;

  const stats = [
    { label: "Candidats invités", value: String(invited), icon: Users },
    { label: "Tests terminés", value: String(finished), icon: CheckCircle2 },
    { label: "Score moyen", value: average === null ? "—" : `${Math.round(average)}/100`, icon: BarChart3 },
    { label: "Seuil de réussite", value: `${test.passThreshold}/100`, icon: Target },
  ];

  return (
    <>
      <BackLink href="/tests">Tous les tests</BackLink>

      {/* En-tête du test */}
      <div className="mb-6 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-600">{test.jobTitle}</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">{test.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-stone-700">
              <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1">
                <Clock className="h-3.5 w-3.5" /> {test.durationMinutes} min
              </span>
              <span className="rounded-full bg-stone-100 px-2.5 py-1">{LEVEL_LABELS[test.level]}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1">
                <Globe className="h-3.5 w-3.5" /> {LANGUAGE_LABELS[test.language]}
              </span>
              {test.deadline && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sun-50 px-2.5 py-1 text-sun-700">
                  <CalendarClock className="h-3.5 w-3.5" /> Jusqu&apos;au {test.deadline.toLocaleDateString("fr-FR", { timeZone: "Africa/Bangui" })}
                </span>
              )}
            </div>
          </div>
          <StatusBadge status={test.status} label={TEST_STATUS_LABELS[test.status]} />
        </div>
        {test.status !== "DRAFT" && (
          <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-stone-100 pt-6 lg:grid-cols-4">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <dt className="text-xs text-stone-500">{label}</dt>
                  <dd className="text-lg font-extrabold text-stone-900">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        )}
      </div>

      {publie && (
        <div className="mb-6">
          <Notice tone="success">
            Le test est publié. Vous pouvez maintenant{" "}
            <Link href={`/tests/${id}/inviter`} className="font-semibold underline">
              inviter des candidats
            </Link>
            .
          </Notice>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardTitle icon={Target}>Compétences évaluées</CardTitle>
          {test.skills.length === 0 ? (
            <p className="text-sm text-stone-600">Aucune compétence pour le moment.</p>
          ) : (
            <ul className="space-y-4">
              {test.skills.map((s) => (
                <li key={s.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-stone-900">{s.name}</span>
                    <span className="text-stone-500">
                      {s.questions.length} question(s) · <strong className="text-stone-800">{s.weight} %</strong>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-stone-100">
                    <div className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-700" style={{ width: `${s.weight}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-6 rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
            <strong>{main}</strong> question(s) posée(s) à chaque candidat sur {test.questionCount} prévues, et{" "}
            <strong>{questions.length - main}</strong> en réserve pour varier les versions.
          </p>
        </Card>

        <Card>
          <CardTitle>Actions</CardTitle>
          <div className="space-y-2.5">
            {test.status === "DRAFT" && editable && (
              <Link href={`/tests/${id}/questions`} className={`${btn.primary} w-full`}>
                <PenLine className="h-4 w-4" /> Continuer la création
              </Link>
            )}
            {test.status !== "DRAFT" && (
              <>
                <Link href={`/tests/${id}/resultats`} className={`${btn.primary} w-full`}>
                  <BarChart3 className="h-4 w-4" /> Résultats et classement
                </Link>
                <Link href={`/tests/${id}/inviter`} className={`${btn.secondary} w-full`}>
                  <Send className="h-4 w-4" />
                  {test.status === "PUBLISHED" && editable ? "Inviter des candidats" : "Suivi des candidats"}
                </Link>
              </>
            )}
            <a href={`/tests/${id}/apercu/candidat`} target="_blank" rel="noopener" className={`${btn.secondary} w-full`}>
              <Eye className="h-4 w-4" /> Aperçu candidat (nouvel onglet)
            </a>
            <Link href={`/tests/${id}/apercu`} className="text-center text-xs font-medium text-stone-500 hover:text-brand-700">
              Voir toutes les questions sur une page
            </Link>
            {editable && (
              <form action={duplicateTest.bind(null, id)}>
                <ActionButton className={`${btn.secondary} w-full`}>
                  <Copy className="h-4 w-4" /> Dupliquer
                </ActionButton>
              </form>
            )}
            {editable && test.status === "PUBLISHED" && (
              <form action={closeTest.bind(null, id)}>
                <ActionButton className={`${btn.ghost} w-full`}>
                  <Lock className="h-4 w-4" /> Fermer le test
                </ActionButton>
              </form>
            )}
            {editable && (test.status === "CLOSED" || test.status === "PUBLISHED") && (
              <form action={archiveTest.bind(null, id)}>
                <ActionButton className={`${btn.ghost} w-full`}>
                  <Archive className="h-4 w-4" /> Archiver
                </ActionButton>
              </form>
            )}
            {editable && test.status === "DRAFT" && (
              <form action={deleteDraft.bind(null, id)}>
                <ActionButton className={`${btn.danger} w-full`}>
                  <Trash2 className="h-4 w-4" /> Supprimer le brouillon
                </ActionButton>
              </form>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}

export default function TestPage(props: PageProps<"/tests/[id]">) {
  return (
    <Suspense fallback={<Loading />}>
      <Content {...props} />
    </Suspense>
  );
}
