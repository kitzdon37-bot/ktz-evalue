import Link from "next/link";
import { ExternalLink, Eye } from "lucide-react";

const STEPS = [
  { key: "competences", label: "Compétences", n: 1 },
  { key: "questions", label: "Questions", n: 2 },
  { key: "parametres", label: "Paramètres", n: 3 },
  { key: "apercu", label: "Aperçu", n: 0 },
] as const;

// Navigation entre les étapes d'un test en brouillon.
export function TestSteps({ testId, current }: { testId: string; current: (typeof STEPS)[number]["key"] }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);
  return (
    <nav className="no-scrollbar mb-8 overflow-x-auto" aria-label="Étapes du test">
      <ol className="flex min-w-max items-center gap-2 rounded-2xl border border-stone-200/80 bg-white p-1.5 shadow-soft">
        {STEPS.map((s, i) => {
          const active = s.key === current;
          const done = s.n > 0 && i < currentIndex;
          const cls = `flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${
            active ? "bg-brand-700 text-white shadow-sm" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
          }`;
          const content = (
            <>
              <span
                className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                  active ? "bg-white/20 text-white" : done ? "bg-brand-100 text-brand-800" : "bg-stone-100 text-stone-600"
                }`}
              >
                {s.n > 0 ? (done ? "✓" : s.n) : <Eye className="h-3.5 w-3.5" />}
              </span>
              {s.label}
              {s.key === "apercu" && <ExternalLink className="h-3.5 w-3.5 opacity-70" />}
            </>
          );
          return (
            <li key={s.key} className="flex-1">
              {s.key === "apercu" ? (
                // L'aperçu réel s'ouvre dans un onglet à part, comme le verra le candidat.
                <a href={`/tests/${testId}/apercu/candidat`} target="_blank" rel="noopener" className={cls} title="Ouvre le test tel que le candidat le verra, dans un nouvel onglet">
                  {content}
                </a>
              ) : (
                <Link href={`/tests/${testId}/${s.key}`} prefetch={false} aria-current={active ? "step" : undefined} className={cls}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
