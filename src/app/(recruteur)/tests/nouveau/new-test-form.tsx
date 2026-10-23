"use client";

import { useActionState } from "react";
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
      <Card className="space-y-5">
        <div>
          <label htmlFor="jobTitle" className={label}>
            Intitulé du poste
          </label>
          <input id="jobTitle" name="jobTitle" required className={`${input} mt-1`} placeholder="Ex. : Comptable confirmé" />
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
            className={`${input} mt-1`}
            placeholder="Collez ici le texte de l'offre, ou décrivez les missions et les compétences attendues."
          />
          <Errors list={errors?.jobDescription} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="level" className={label}>
              Niveau
            </label>
            <select id="level" name="level" defaultValue="CONFIRMED" className={`${input} mt-1`}>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {LEVEL_LABELS[l]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="language" className={label}>
              Langue du test
            </label>
            <select id="language" name="language" defaultValue="FR" className={`${input} mt-1`}>
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {LANGUAGE_LABELS[l]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="durationMinutes" className={label}>
              Durée totale
            </label>
            <select id="durationMinutes" name="durationMinutes" defaultValue="30" className={`${input} mt-1`}>
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d} minutes
                </option>
              ))}
            </select>
            <Errors list={errors?.durationMinutes} />
          </div>
          <div>
            <label htmlFor="questionCount" className={label}>
              Nombre de questions (10 à 30)
            </label>
            <input
              id="questionCount"
              name="questionCount"
              type="number"
              min={10}
              max={30}
              defaultValue={15}
              className={`${input} mt-1`}
            />
            <Errors list={errors?.questionCount} />
          </div>
        </div>

        <fieldset>
          <legend className={label}>Types de questions</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {QUESTION_TYPES.map((t) => (
              <label key={t} className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2.5 text-sm">
                <input type="checkbox" name="questionTypes" value={t} defaultChecked={t !== "ORAL"} className="h-5 w-5" />
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
          className={btn.primary}
          pendingText="L'IA analyse le poste (jusqu'à une minute)…"
        >
          Proposer les compétences avec l&apos;IA
        </ActionButton>
        <ActionButton name="mode" value="manual" className={btn.secondary}>
          Continuer sans IA
        </ActionButton>
      </div>
    </form>
  );
}
