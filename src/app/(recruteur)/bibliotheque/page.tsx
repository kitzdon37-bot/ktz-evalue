import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  BookOpen,
  Calculator,
  Copy,
  FileStack,
  HandHeart,
  Handshake,
  Laptop,
  Paperclip,
  Truck,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import { db } from "@/lib/db";
import { canEdit, requireCompany } from "@/lib/tenant";
import { LEVEL_LABELS, QUESTION_TYPE_LABELS, TEST_STATUS_LABELS, type QuestionType } from "@/lib/tests/model";
import { ActionButton } from "@/components/form";
import { btn, Loading, PageTitle, StatusBadge } from "@/components/ui";
import { duplicateTest } from "../tests/actions";
import { isAiConfigured } from "@/lib/ai";
import { UseTemplateForm } from "./use-template-form";

export const metadata: Metadata = { title: "Bibliothèque de tests" };
// La génération de questions par l'IA peut prendre 1 à 2 minutes.
export const maxDuration = 300;

// Icône et couleur de chaque métier.
const PROFESSION_STYLES: Record<string, { icon: LucideIcon; tone: string }> = {
  Comptable: { icon: Calculator, tone: "from-brand-500 to-brand-700" },
  "Assistant administratif": { icon: Paperclip, tone: "from-sky-500 to-sky-700" },
  Commercial: { icon: Handshake, tone: "from-sun-400 to-sun-600" },
  Logisticien: { icon: Warehouse, tone: "from-orange-500 to-orange-700" },
  Chauffeur: { icon: Truck, tone: "from-stone-500 to-stone-700" },
  "Agent de terrain humanitaire": { icon: HandHeart, tone: "from-rose-500 to-rose-700" },
  Informaticien: { icon: Laptop, tone: "from-violet-500 to-violet-700" },
};

async function Library() {
  const user = await requireCompany();
  const editable = canEdit(user);
  const aiAvailable = isAiConfigured();
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
        eyebrow="Bibliothèque"
        title="Des tests prêts à l'emploi"
        subtitle="Choisissez un modèle par métier, réglez le niveau et le nombre de questions, puis complétez-le avec la banque KTZ ou l'IA."
      />

      <section className="mb-12">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((t) => {
            const count = t.skills.reduce((n, s) => n + s.questions.length, 0);
            const style = PROFESSION_STYLES[t.profession] ?? { icon: BookOpen, tone: "from-brand-500 to-brand-700" };
            const Icon = style.icon;
            return (
              <article
                key={t.id}
                className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="flex items-start gap-4">
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${style.tone} text-white shadow-md`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-500">{t.profession}</p>
                    <h2 className="mt-0.5 text-lg font-bold leading-snug text-stone-900">{t.title}</h2>
                  </div>
                </div>
                <div className="mt-4 flex gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-stone-700">{LEVEL_LABELS[t.level]}</span>
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-stone-700">{count} questions</span>
                </div>
                {t.description && <p className="mt-3 text-sm leading-relaxed text-stone-600">{t.description}</p>}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {t.skills.map((s) => (
                    <span key={s.name} className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-medium text-brand-800">
                      {s.name}
                    </span>
                  ))}
                </div>
                <details className="group mt-4 text-sm">
                  <summary className="cursor-pointer list-none font-semibold text-brand-700 hover:text-brand-800">
                    <span className="group-open:hidden">Voir les questions ▾</span>
                    <span className="hidden group-open:inline">Masquer les questions ▴</span>
                  </summary>
                  <ol className="mt-3 list-decimal space-y-1.5 rounded-xl bg-stone-50 py-3 pl-8 pr-3 text-stone-700">
                    {t.skills.flatMap((s) =>
                      s.questions.map((q) => (
                        <li key={q.id}>
                          {q.prompt} <span className="text-xs text-stone-400">· {QUESTION_TYPE_LABELS[q.type as QuestionType]}</span>
                        </li>
                      )),
                    )}
                  </ol>
                </details>
                {editable && (
                  <UseTemplateForm templateId={t.id} defaultLevel={t.level} available={count} aiAvailable={aiAvailable} />
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-stone-900">
          <FileStack className="h-5 w-5 text-brand-600" /> Vos tests déjà publiés
        </h2>
        <p className="mb-4 text-sm text-stone-600">Réutilisez un test d&apos;un recrutement à l&apos;autre en le dupliquant.</p>
        {ownTests.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-white/60 px-4 py-6 text-center text-sm text-stone-500">
            Les tests que vous publiez apparaîtront ici.
          </p>
        ) : (
          <ul className="divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-soft">
            {ownTests.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <Link href={`/tests/${t.id}`} className="font-semibold text-stone-900 hover:text-brand-700">
                  {t.title}
                  <span className="ml-2 text-xs font-normal text-stone-500">
                    {LEVEL_LABELS[t.level]} · {t.durationMinutes} min
                  </span>
                </Link>
                <span className="flex items-center gap-3">
                  <StatusBadge status={t.status} label={TEST_STATUS_LABELS[t.status]} />
                  {editable && (
                    <form action={duplicateTest.bind(null, t.id)}>
                      <ActionButton className={btn.small}>
                        <Copy className="h-3.5 w-3.5" /> Dupliquer
                      </ActionButton>
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
    <Suspense fallback={<Loading />}>
      <Library />
    </Suspense>
  );
}
