import Link from "next/link";

const STEPS = [
  { key: "competences", label: "1. Compétences" },
  { key: "questions", label: "2. Questions" },
  { key: "parametres", label: "3. Paramètres" },
  { key: "apercu", label: "Aperçu" },
] as const;

// Navigation entre les étapes d'un test en brouillon.
export function TestSteps({ testId, current }: { testId: string; current: (typeof STEPS)[number]["key"] }) {
  return (
    <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-gray-200 text-sm" aria-label="Étapes du test">
      {STEPS.map((s) => (
        <Link
          key={s.key}
          href={`/tests/${testId}/${s.key}`}
          prefetch={false}
          aria-current={s.key === current ? "page" : undefined}
          className={`whitespace-nowrap border-b-2 px-3 py-2 font-medium ${
            s.key === current ? "border-teal-700 text-teal-800" : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          {s.label}
        </Link>
      ))}
    </nav>
  );
}
