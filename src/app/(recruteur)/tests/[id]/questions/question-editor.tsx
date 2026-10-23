"use client";

import { useActionState } from "react";
import { ActionButton, FormMessage } from "@/components/form";
import { btn, input, label } from "@/components/ui";
import {
  isMcq,
  LEVEL_LABELS,
  LEVELS,
  QUESTION_TYPE_LABELS,
  RUBRIC_GRADED,
  type QuestionData,
} from "@/lib/tests/model";
import { MAX_CHOICES, MAX_CRITERIA } from "@/lib/tests/question-form";
import { deleteQuestion, moveQuestion, regenerateQuestionAction, updateQuestion } from "../../actions";

export type EditorQuestion = QuestionData & { id: string; isReserve: boolean; origin: string; problems: string[] };

function contentKey(q: EditorQuestion) {
  return JSON.stringify([q.prompt, q.choices, q.correctAnswer, q.rubric, q.explanation, q.points, q.suggestedTimeSec, q.difficulty, q.isReserve]);
}

function pad<T>(list: T[], n: number, make: () => T): T[] {
  return [...list, ...Array.from({ length: Math.max(0, n - list.length) }, make)];
}

export function QuestionEditor({
  testId,
  question: q,
  index,
  isFirst,
  isLast,
  aiAvailable,
}: {
  testId: string;
  question: EditorQuestion;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  aiAvailable: boolean;
}) {
  const [state, save] = useActionState(updateQuestion.bind(null, testId, q.id), undefined);
  const [regenState, regenerate] = useActionState(regenerateQuestionAction.bind(null, testId, q.id), undefined);
  const mcq = isMcq(q.type);
  const open = RUBRIC_GRADED.includes(q.type);
  const correct = new Set(q.correctAnswer?.choiceIds ?? []);
  const choices = pad(q.choices ?? [], mcq ? Math.min(MAX_CHOICES, Math.max(4, (q.choices?.length ?? 0) + 1)) : 0, () => ({
    id: "",
    text: "",
  }));
  const criteria = pad(q.rubric?.criteria ?? [], Math.min(MAX_CRITERIA, (q.rubric?.criteria.length ?? 0) + 1), () => ({
    label: "",
    points: 1,
  }));
  const name = `q-${q.id}`;

  return (
    <details className="group rounded-lg border border-gray-200 bg-white" open={q.problems.length > 0 && q.prompt === ""}>
      <summary className="flex cursor-pointer list-none items-start gap-3 p-4">
        <span className="mt-0.5 shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">{index}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-gray-900">{q.prompt || <em className="text-gray-500">Question vide</em>}</span>
          <span className="mt-1 flex flex-wrap gap-2 text-xs text-gray-600">
            <span>{QUESTION_TYPE_LABELS[q.type]}</span>
            <span>· {q.points} pt</span>
            <span>· {q.suggestedTimeSec} s</span>
            {q.isReserve && <span className="rounded bg-sky-100 px-1.5 text-sky-900">Réserve</span>}
            {q.problems.length > 0 && <span className="rounded bg-red-100 px-1.5 text-red-800">À corriger</span>}
          </span>
        </span>
        <span className="text-sm text-teal-800 group-open:hidden">Modifier</span>
      </summary>

      <div className="space-y-4 border-t border-gray-100 p-4">
        {q.problems.length > 0 && (
          <ul className="list-inside list-disc rounded-md bg-red-50 p-3 text-sm text-red-800">
            {q.problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}

        {/* La clé change quand le contenu change (enregistrement ou régénération) :
            les champs sont alors réinitialisés avec les nouvelles valeurs. */}
        <form key={contentKey(q)} action={save} className="space-y-4">
          <FormMessage state={state} />
          <div>
            <label htmlFor={`${name}-prompt`} className={label}>
              Énoncé
            </label>
            <textarea id={`${name}-prompt`} name="prompt" rows={3} defaultValue={q.prompt} className={`${input} mt-1`} />
          </div>

          {mcq && (
            <fieldset>
              <legend className={label}>
                Choix — cochez {q.type === "MCQ_SINGLE" ? "la bonne réponse" : "les bonnes réponses"}
              </legend>
              <div className="mt-2 space-y-2">
                {choices.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {q.type === "MCQ_SINGLE" ? (
                      <input
                        type="radio"
                        name="correct"
                        value={i}
                        defaultChecked={!!c.id && correct.has(c.id)}
                        className="h-5 w-5 shrink-0"
                        aria-label={`Choix ${i + 1} correct`}
                      />
                    ) : (
                      <input
                        type="checkbox"
                        name={`correct_${i}`}
                        defaultChecked={!!c.id && correct.has(c.id)}
                        className="h-5 w-5 shrink-0"
                        aria-label={`Choix ${i + 1} correct`}
                      />
                    )}
                    <input
                      name={`choice_${i}`}
                      defaultValue={c.text}
                      placeholder={`Choix ${i + 1}`}
                      className={input}
                    />
                  </div>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">Laissez un champ vide pour supprimer ce choix.</p>
            </fieldset>
          )}

          {q.type === "TRUE_FALSE" && (
            <fieldset>
              <legend className={label}>Bonne réponse</legend>
              <div className="mt-2 flex gap-4">
                {[
                  ["true", "Vrai"],
                  ["false", "Faux"],
                ].map(([v, l]) => (
                  <label key={v} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="tf"
                      value={v}
                      defaultChecked={String(q.correctAnswer?.value) === v}
                      className="h-5 w-5"
                    />
                    {l}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {q.type === "SHORT_ANSWER" && (
            <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
              <div>
                <label htmlFor={`${name}-expected`} className={label}>
                  Valeur attendue
                </label>
                <input
                  id={`${name}-expected`}
                  name="expected"
                  defaultValue={typeof q.correctAnswer?.value === "string" ? q.correctAnswer.value : ""}
                  className={`${input} mt-1`}
                />
              </div>
              <div>
                <label htmlFor={`${name}-tolerance`} className={label}>
                  Tolérance (chiffres)
                </label>
                <input
                  id={`${name}-tolerance`}
                  name="tolerance"
                  inputMode="decimal"
                  defaultValue={q.correctAnswer?.tolerance ?? ""}
                  placeholder="0"
                  className={`${input} mt-1`}
                />
              </div>
            </div>
          )}

          {open && (
            <fieldset className="space-y-2">
              <legend className={label}>Grille de correction (critères et points)</legend>
              {criteria.map((c, i) => (
                <div key={i} className="grid grid-cols-[1fr_5rem] gap-2">
                  <input
                    name={`criterion_${i}`}
                    defaultValue={c.label}
                    placeholder={`Critère ${i + 1}`}
                    aria-label={`Critère ${i + 1}`}
                    className={input}
                  />
                  <input
                    name={`criterion_points_${i}`}
                    type="number"
                    min={0}
                    defaultValue={c.points}
                    aria-label={`Points du critère ${i + 1}`}
                    className={input}
                  />
                </div>
              ))}
              <p className="text-xs text-gray-500">Enregistrez pour ajouter une ligne de critère supplémentaire.</p>
              <div>
                <label htmlFor={`${name}-example`} className={label}>
                  Exemple de bonne réponse
                </label>
                <textarea
                  id={`${name}-example`}
                  name="example"
                  rows={3}
                  defaultValue={q.rubric?.example ?? ""}
                  className={`${input} mt-1`}
                />
              </div>
            </fieldset>
          )}

          <div>
            <label htmlFor={`${name}-explanation`} className={label}>
              Explication (visible par le recruteur seulement)
            </label>
            <textarea
              id={`${name}-explanation`}
              name="explanation"
              rows={2}
              defaultValue={q.explanation ?? ""}
              className={`${input} mt-1`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label htmlFor={`${name}-points`} className={label}>
                Points
              </label>
              <input
                id={`${name}-points`}
                name="points"
                type="number"
                min={1}
                max={20}
                defaultValue={q.points}
                className={`${input} mt-1`}
              />
            </div>
            <div>
              <label htmlFor={`${name}-time`} className={label}>
                Temps (s)
              </label>
              <input
                id={`${name}-time`}
                name="suggestedTimeSec"
                type="number"
                min={10}
                max={900}
                defaultValue={q.suggestedTimeSec}
                className={`${input} mt-1`}
              />
            </div>
            <div className="col-span-2">
              <label htmlFor={`${name}-difficulty`} className={label}>
                Difficulté
              </label>
              <select id={`${name}-difficulty`} name="difficulty" defaultValue={q.difficulty} className={`${input} mt-1`}>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {LEVEL_LABELS[l]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input type="checkbox" name="isReserve" defaultChecked={q.isReserve} className="h-5 w-5" />
            Question de réserve (tirée au sort pour varier les versions entre candidats)
          </label>

          <ActionButton className={btn.primary}>Enregistrer la question</ActionButton>
        </form>

        <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3">
          <form action={moveQuestion.bind(null, testId, q.id, "up")}>
            <ActionButton className={btn.small} disabled={isFirst}>
              ↑ Monter
            </ActionButton>
          </form>
          <form action={moveQuestion.bind(null, testId, q.id, "down")}>
            <ActionButton className={btn.small} disabled={isLast}>
              ↓ Descendre
            </ActionButton>
          </form>
          {aiAvailable && (
            <form action={regenerate}>
              <ActionButton className={btn.small} pendingText="Régénération…">
                ↻ Régénérer avec l&apos;IA
              </ActionButton>
            </form>
          )}
          <form action={deleteQuestion.bind(null, testId, q.id)}>
            <ActionButton className={`${btn.small} text-red-700`}>Supprimer</ActionButton>
          </form>
        </div>
        <FormMessage state={regenState} />
      </div>
    </details>
  );
}
