"use client";

import { useActionState } from "react";
import { ActionButton, FormMessage } from "@/components/form";
import { btn, Card, input, label } from "@/components/ui";
import { saveSettings } from "../../actions";

type Values = {
  title: string;
  passThreshold: number;
  deadline: string;
  shuffleQuestions: boolean;
  shuffleChoices: boolean;
  blockPaste: boolean;
  requireFullscreen: boolean;
  webcamEnabled: boolean;
  webcamIntervalSec: number;
  showScoreToCandidate: boolean;
  badgesEnabled: boolean;
};

function Toggle({ name, checked, title, help }: { name: keyof Values; checked: boolean; title: string; help?: string }) {
  return (
    <label className="flex items-start gap-3 py-2">
      <input type="checkbox" name={name} defaultChecked={checked} className="mt-0.5 h-5 w-5 shrink-0" />
      <span>
        <span className="block text-sm font-medium text-stone-900">{title}</span>
        {help && <span className="block text-sm text-stone-600">{help}</span>}
      </span>
    </label>
  );
}

export function SettingsForm({ testId, values: v }: { testId: string; values: Values }) {
  const [state, action] = useActionState(saveSettings.bind(null, testId), undefined);
  const errors = state?.errors;

  return (
    <form action={action} className="space-y-5">
      <FormMessage state={state} />

      <Card className="space-y-4">
        <h2 className="text-base font-bold text-stone-900">Général</h2>
        <div>
          <label htmlFor="title" className={label}>
            Titre du test (vu par le candidat)
          </label>
          <input id="title" name="title" defaultValue={v.title} className={`${input} mt-1`} />
          {errors?.title?.map((e) => (
            <p key={e} className="mt-1 text-sm text-red-700">
              {e}
            </p>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="passThreshold" className={label}>
              Seuil de réussite (sur 100)
            </label>
            <input
              id="passThreshold"
              name="passThreshold"
              type="number"
              min={0}
              max={100}
              defaultValue={v.passThreshold}
              className={`${input} mt-1`}
            />
          </div>
          <div>
            <label htmlFor="deadline" className={label}>
              Date limite de passage (facultatif)
            </label>
            <input id="deadline" name="deadline" type="date" defaultValue={v.deadline} className={`${input} mt-1`} />
            {errors?.deadline?.map((e) => (
              <p key={e} className="mt-1 text-sm text-red-700">
                {e}
              </p>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 text-base font-bold text-stone-900">Anti-triche</h2>
        <p className="mb-2 text-sm text-stone-600">
          Le candidat n&apos;est jamais bloqué : les signaux sont enregistrés et vous sont montrés.
        </p>
        <Toggle name="shuffleQuestions" checked={v.shuffleQuestions} title="Ordre des questions mélangé" help="Et tirage dans la réserve : chaque candidat a une version différente." />
        <Toggle name="shuffleChoices" checked={v.shuffleChoices} title="Ordre des réponses mélangé (QCM)" />
        <Toggle name="blockPaste" checked={v.blockPaste} title="Copier-coller désactivé dans les réponses" />
        <Toggle name="requireFullscreen" checked={v.requireFullscreen} title="Plein écran demandé sur ordinateur" />
        <Toggle
          name="webcamEnabled"
          checked={v.webcamEnabled}
          title="Option webcam : une photo toutes les 30 à 60 secondes"
          help="Avec l'accord du candidat. Photos supprimées 90 jours après le test. Aucune reconnaissance faciale."
        />
        <div className="ml-8 max-w-xs">
          <label htmlFor="webcamIntervalSec" className={label}>
            Intervalle entre deux photos (secondes)
          </label>
          <input
            id="webcamIntervalSec"
            name="webcamIntervalSec"
            type="number"
            min={30}
            max={60}
            defaultValue={v.webcamIntervalSec}
            className={`${input} mt-1`}
          />
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 font-semibold text-stone-900">Résultats</h2>
        <Toggle name="showScoreToCandidate" checked={v.showScoreToCandidate} title="Montrer son score au candidat à la fin du test" />
        <Toggle
          name="badgesEnabled"
          checked={v.badgesEnabled}
          title="Badges « Compétence vérifiée » sur KTZ Emploi"
          help="Le candidat qui atteint le seuil sur une compétence pourra afficher un badge sur son profil, s'il le souhaite."
        />
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <ActionButton name="next" value="save" className={btn.secondary}>
          Enregistrer
        </ActionButton>
        <ActionButton name="next" value="publish" className={btn.primary} pendingText="Vérification du test…">
          Enregistrer et publier le test
        </ActionButton>
      </div>
      <p className="text-sm text-stone-600">
        Une fois publié, le test ne peut plus être modifié (vous pourrez le dupliquer pour en faire une nouvelle version).
      </p>
    </form>
  );
}
