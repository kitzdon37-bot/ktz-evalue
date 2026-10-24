"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import { ActionButton, FormMessage } from "@/components/form";
import { btn, Card, input, label, Notice } from "@/components/ui";
import {
  DURATIONS,
  LANGUAGE_LABELS,
  LANGUAGES,
  LEVEL_LABELS,
  LEVELS,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPES,
} from "@/lib/tests/model";
import { createTest } from "../actions";

// Groupe de choix en « pastilles » (boutons radio stylés).
function ChoiceGroup({ legend, name, options, defaultValue }: { legend: string; name: string; options: string[][]; defaultValue: string }) {
  return (
    <fieldset>
      <legend className={label}>{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map(([value, text]) => (
          <label
            key={value}
            className="cursor-pointer rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-300 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-700 has-[:checked]:text-white has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-500/20"
          >
            <input type="radio" name={name} value={value} defaultChecked={value === defaultValue} className="sr-only" />
            {text}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Errors({ list }: { list?: string[] }) {
  return list?.map((e) => (
    <p key={e} className="mt-1 text-sm text-red-700">
      {e}
    </p>
  ));
}

export function NewTestForm({ aiAvailable }: { aiAvailable: boolean }) {
  const [state, action] = useActionState(createTest, undefined);
  const errors = state?.errors;

  return (
    <form action={action} className="space-y-5">
      <FormMessage state={state} />
      <Card className="space-y-6">
        <div>
          <label htmlFor="jobTitle" className={label}>
            Intitulé du poste
          </label>
          <input id="jobTitle" name="jobTitle" required className={`${input} mt-2`} placeholder="Ex. : Comptable confirmé" />
          <Errors list={errors?.jobTitle} />
        </div>
        <div>
          <label htmlFor="jobDescription" className={label}>
            Offre d&apos;emploi ou description du poste
          </label>
          <textarea
            id="jobDescription"
            name="jobDescription"
            rows={8}
            className={`${input} mt-2`}
            placeholder="Collez ici le texte de l'offre, ou décrivez les missions et les compétences attendues."
          />
          <Errors list={errors?.jobDescription} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <ChoiceGroup legend="Niveau" name="level" defaultValue="CONFIRMED" options={LEVELS.map((l) => [l, LEVEL_LABELS[l]])} />
          <ChoiceGroup legend="Langue du test" name="language" defaultValue="FR" options={LANGUAGES.map((l) => [l, LANGUAGE_LABELS[l]])} />
          <div>
            <ChoiceGroup legend="Durée totale" name="durationMinutes" defaultValue="30" options={DURATIONS.map((d) => [String(d), `${d} min`])} />
            <Errors list={errors?.durationMinutes} />
          </div>
          <div>
            <label htmlFor="questionCount" className={label}>
              Nombre de questions <span className="font-normal text-stone-500">(10 à 30)</span>
            </label>
            <input id="questionCount" name="questionCount" type="number" min={10} max={30} defaultValue={15} className={`${input} mt-2`} />
            <Errors list={errors?.questionCount} />
          </div>
        </div>

        <fieldset>
          <legend className={label}>Types de questions</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {QUESTION_TYPES.map((t) => (
              <label
                key={t}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm font-medium text-stone-800 transition hover:border-stone-300 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-950"
              >
                <input type="checkbox" name="questionTypes" value={t} defaultChecked={t !== "ORAL"} className="h-5 w-5 accent-brand-700" />
                {QUESTION_TYPE_LABELS[t]}
              </label>
            ))}
          </div>
          <Errors list={errors?.questionTypes} />
        </fieldset>
      </Card>

      {!aiAvailable && (
        <Notice tone="warning">
          La génération par IA n&apos;est pas encore activée (clé Anthropic manquante). Vous pouvez créer le test et
          écrire les questions vous-même, ou partir d&apos;un modèle de la bibliothèque.
        </Notice>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <ActionButton
          name="mode"
          value="ai"
          disabled={!aiAvailable}
          className={`${btn.primary} px-5 py-3`}
          pendingText="L'IA analyse le poste (jusqu'à une minute)…"
        >
          <Sparkles className="h-4 w-4" /> Proposer les compétences avec l&apos;IA
        </ActionButton>
        <ActionButton name="mode" value="manual" className={`${btn.secondary} px-5 py-3`}>
          Continuer sans IA
        </ActionButton>
      </div>
    </form>
  );
}
