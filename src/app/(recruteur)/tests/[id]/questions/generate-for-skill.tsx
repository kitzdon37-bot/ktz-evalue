"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import { ActionButton, FormMessage } from "@/components/form";
import { AI_TYPES, QUESTION_TYPE_LABELS } from "@/lib/tests/model";
import { generateSkillQuestions } from "../../actions";

// « Générer avec l'IA » sous chaque compétence : l'IA rédige de nouvelles questions,
// du type choisi ou de types variés, qui s'ajoutent à la compétence (à relire ensuite).
export function GenerateForSkill({ testId, skillId, skillName }: { testId: string; skillId: string; skillName: string }) {
  const [state, action] = useActionState(generateSkillQuestions.bind(null, testId, skillId), undefined);
  const field =
    "rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm text-stone-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15";

  return (
    <form action={action} className="mt-2 rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50/80 to-sun-50/60 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-800">
          <Sparkles className="h-4 w-4" /> Générer avec l&apos;IA
        </span>
        <select name="count" defaultValue="3" aria-label={`Nombre de questions à générer pour ${skillName}`} className={field}>
          {[1, 2, 3, 5, 10].map((n) => (
            <option key={n} value={n}>
              {n} question{n > 1 ? "s" : ""}
            </option>
          ))}
        </select>
        <select name="type" defaultValue="" aria-label="Type des questions à générer" className={field}>
          <option value="">Types variés</option>
          {AI_TYPES.map((t) => (
            <option key={t} value={t}>
              {QUESTION_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <ActionButton
          className="btn-shine inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
          pendingText="L'IA rédige… (jusqu'à 1 min)"
        >
          <Sparkles className="h-4 w-4" /> Générer
        </ActionButton>
      </div>
      <div className="mt-2 empty:hidden">
        <FormMessage state={state} />
      </div>
    </form>
  );
}
