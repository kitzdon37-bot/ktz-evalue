import { Brain, Check, Code2, Globe2, Puzzle, type LucideIcon } from "lucide-react";
import { db } from "@/lib/db";
import { ActionButton } from "@/components/form";
import { btn } from "@/components/ui";
import { addModule } from "../../actions";

// Icône de chaque module, selon son nom.
function moduleIcon(profession: string): { icon: LucideIcon; tone: string } {
  if (/culture/i.test(profession)) return { icon: Globe2, tone: "from-sky-500 to-sky-700" };
  if (/raisonnement/i.test(profession)) return { icon: Brain, tone: "from-violet-500 to-violet-700" };
  if (/programmation/i.test(profession)) return { icon: Code2, tone: "from-stone-700 to-stone-900" };
  return { icon: Puzzle, tone: "from-brand-500 to-brand-700" };
}

// Modules de la bibliothèque (culture générale, raisonnement, programmation…) ajoutables au test.
export async function Modules({ testId, skillNames }: { testId: string; skillNames: string[] }) {
  const modules = await db.template.findMany({
    where: { active: true, profession: { startsWith: "Module" } },
    orderBy: { title: "asc" },
    include: { skills: { select: { name: true, _count: { select: { questions: true } } } } },
  });
  if (modules.length === 0) return null;
  const have = new Set(skillNames);

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-stone-900">Ajouter un module prêt à l&apos;emploi</h2>
      <p className="mt-1 text-sm text-stone-600">
        Complétez le test métier avec de la culture générale, du raisonnement illustré ou des exercices de code. Les questions
        s&apos;ajoutent au test, qui s&apos;allonge d&apos;autant.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {modules.map((m) => {
          const { icon: Icon, tone } = moduleIcon(m.profession);
          const count = m.skills.reduce((n, s) => n + s._count.questions, 0);
          const added = m.skills.every((s) => have.has(s.name));
          return (
            <article key={m.id} className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-5 shadow-soft">
              <div className="flex items-start gap-3">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-md`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold leading-snug text-stone-900">{m.title}</h3>
                  <p className="text-xs font-semibold text-stone-500">{count} questions</p>
                </div>
              </div>
              {m.description && <p className="mt-3 text-sm leading-relaxed text-stone-600">{m.description}</p>}
              <div className="mt-auto pt-4">
                {added ? (
                  <p className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-800">
                    <Check className="h-4 w-4" /> Déjà dans le test
                  </p>
                ) : (
                  <form action={addModule.bind(null, testId, m.id)}>
                    <ActionButton className={`${btn.secondary} w-full`} pendingText="Ajout du module…">
                      + Ajouter au test
                    </ActionButton>
                  </form>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
