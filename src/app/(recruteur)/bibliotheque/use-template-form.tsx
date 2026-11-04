"use client";

import { useState } from "react";
import { Library, Sparkles } from "lucide-react";
import { ActionButton } from "@/components/form";
import { btn } from "@/components/ui";
import { LEVEL_LABELS, LEVELS, MAX_QUESTIONS, MIN_QUESTIONS, type Level } from "@/lib/tests/model";
import { createFromTemplate } from "./actions";

// Réglages avant d'utiliser un modèle : niveau, nombre de questions, puis source des questions
// supplémentaires (banque KTZ gratuite ou IA).
export function UseTemplateForm({
  templateId,
  defaultLevel,
  available,
  aiAvailable,
}: {
  templateId: string;
  defaultLevel: Level;
  available: number;
  aiAvailable: boolean;
}) {
  const [count, setCount] = useState(String(Math.max(MIN_QUESTIONS, available)));
  const n = Number.parseInt(count, 10) || 0;
  const missing = Math.max(0, n - available);

  return (
    <form action={createFromTemplate.bind(null, templateId)} className="mt-auto space-y-3 border-t border-stone-100 pt-5">
      <fieldset>
        <legend className="text-xs font-bold uppercase tracking-wider text-stone-500">Niveau</legend>
        <div className="mt-1.5 grid grid-cols-3 gap-1.5">
          {LEVELS.map((l) => (
            <label
              key={l}
              className="cursor-pointer rounded-xl border border-stone-200 bg-white px-2 py-2 text-center text-xs font-semibold text-stone-700 transition hover:border-stone-300 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-600 has-[:checked]:text-white has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-500/20"
            >
              <input type="radio" name="level" value={l} defaultChecked={l === defaultLevel} className="sr-only" />
              {LEVEL_LABELS[l]}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor={`count-${templateId}`} className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Nombre de questions
        </label>
        <div className="mt-1.5 flex items-center gap-2">
          <input
            id={`count-${templateId}`}
            name="questionCount"
            type="number"
            min={MIN_QUESTIONS}
            max={MAX_QUESTIONS}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="w-24 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
          />
          <p className="text-xs leading-snug text-stone-500">
            {missing > 0 ? (
              <>
                Le modèle en contient {available} : <strong className="text-stone-700">{missing} de plus</strong> seront ajoutées.
              </>
            ) : (
              <>Le modèle en contient {available}.</>
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        <ActionButton className={`${btn.primary} w-full`} name="mode" value="bank" pendingText="Création du test…">
          <Library className="h-4 w-4" /> Utiliser ce modèle
        </ActionButton>
        <ActionButton
          className={`${btn.secondary} w-full border-brand-200 text-brand-800 hover:border-brand-300 hover:bg-brand-50`}
          name="mode"
          value="ai"
          pendingText="L'IA rédige les questions (1 à 2 min)…"
        >
          <Sparkles className="h-4 w-4" /> Générer d&apos;autres questions avec l&apos;IA
        </ActionButton>
        {!aiAvailable && (
          <p className="text-center text-xs text-stone-500">IA non configurée : les questions viendront de la banque KTZ.</p>
        )}
      </div>
    </form>
  );
}
