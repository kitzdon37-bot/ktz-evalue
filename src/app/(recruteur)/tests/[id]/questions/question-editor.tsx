"use client";

import { useActionState } from "react";
import { ActionButton, FormMessage } from "@/components/form";
import { btn, input, label } from "@/components/ui";
import {
  isAiType,
  isMcq,
  LEVEL_LABELS,
  LEVELS,
  QUESTION_TYPE_LABELS,
  RUBRIC_GRADED,
  type QuestionData,
} from "@/lib/tests/model";
import { MAX_CHOICES, MAX_CODE_TESTS, MAX_CRITERIA, MAX_ORDER_ITEMS } from "@/lib/tests/question-form";
import { deleteQuestion, moveQuestion, regenerateQuestionAction, updateQuestion } from "../../actions";
import { ImageField } from "./image-field";

export type EditorQuestion = QuestionData & { id: string; isReserve: boolean; origin: string; problems: string[] };

function contentKey(q: EditorQuestion) {
  return JSON.stringify([q.prompt, q.image, q.choices, q.correctAnswer, q.rubric, q.explanation, q.points, q.suggestedTimeSec, q.difficulty, q.isReserve]);
}

// Affichage d'une valeur de test de code dans le formulaire (JSON lisible).
const show = (v: unknown) => (v === undefined ? "" : JSON.stringify(v));
const showArgs = (args: unknown[]) => args.map((a) => JSON.stringify(a)).join(", ");

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
    <details className="group rounded-lg border border-stone-200 bg-white" open={q.problems.length > 0 && q.prompt === ""}>
      <summary className="flex cursor-pointer list-none items-start gap-3 p-4">
        <span className="mt-0.5 shrink-0 rounded bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-700">{index}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-stone-900">{q.prompt || <em className="text-stone-500">Question vide</em>}</span>
          <span className="mt-1 flex flex-wrap gap-2 text-xs text-stone-600">
            <span>{QUESTION_TYPE_LABELS[q.type]}</span>
            <span>· {q.points} pt</span>
            <span>· {q.suggestedTimeSec} s</span>
            {q.isReserve && <span className="rounded bg-sky-100 px-1.5 text-sky-900">Réserve</span>}
            {q.problems.length > 0 && <span className="rounded bg-red-100 px-1.5 text-red-800">À corriger</span>}
          </span>
        </span>
        <span className="text-sm text-brand-800 group-open:hidden">Modifier</span>
      </summary>

      <div className="space-y-4 border-t border-stone-100 p-4">
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

          <ImageField name={name} initial={q.image} />

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
              <p className="mt-1 text-xs text-stone-500">Laissez un champ vide pour supprimer ce choix.</p>
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

          {q.type === "ORDERING" && (
            <fieldset>
              <legend className={label}>Éléments, dans le BON ordre</legend>
              <p className="mt-0.5 text-xs text-stone-500">
                Ils seront mélangés pour chaque candidat, qui devra les remettre dans cet ordre (glisser-déposer ou flèches).
              </p>
              <div className="mt-2 space-y-2">
                {pad(q.choices ?? [], Math.min(MAX_ORDER_ITEMS, Math.max(4, (q.choices?.length ?? 0) + 1)), () => ({ id: "", text: "" })).map(
                  (c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-800">
                        {i + 1}
                      </span>
                      <input name={`item_${i}`} defaultValue={c.text} placeholder={`Élément n° ${i + 1}`} className={input} />
                    </div>
                  ),
                )}
              </div>
              <p className="mt-1 text-xs text-stone-500">Laissez un champ vide pour le retirer ; enregistrez pour ajouter une ligne.</p>
            </fieldset>
          )}

          {q.type === "CODE" && (
            <fieldset className="space-y-3">
              <legend className={label}>Exercice de programmation (JavaScript)</legend>
              <div className="grid gap-3 sm:grid-cols-[14rem_1fr]">
                <div>
                  <label htmlFor={`${name}-fn`} className="text-xs font-semibold text-stone-600">
                    Nom de la fonction à écrire
                  </label>
                  <input
                    id={`${name}-fn`}
                    name="functionName"
                    defaultValue={q.correctAnswer?.code?.functionName ?? "solution"}
                    className={`${input} mt-1 font-mono`}
                    spellCheck={false}
                  />
                </div>
                <p className="self-end text-xs text-stone-500">
                  Le candidat complète cette fonction. Son code est exécuté dans un bac à sable et vérifié avec les tests ci-dessous.
                </p>
              </div>
              <div>
                <label htmlFor={`${name}-starter`} className="text-xs font-semibold text-stone-600">
                  Code de départ montré au candidat
                </label>
                <textarea
                  id={`${name}-starter`}
                  name="starter"
                  rows={6}
                  spellCheck={false}
                  defaultValue={q.correctAnswer?.code?.starter ?? ""}
                  className={`${input} mt-1 bg-stone-900 font-mono text-sm text-stone-100`}
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-600">Tests : arguments → résultat attendu</p>
                <p className="text-xs text-stone-500">
                  Écrivez les valeurs comme en JavaScript : <code>2, 3</code> · <code>[1, 2, 3]</code> · <code>&quot;Bangui&quot;</code> ·{" "}
                  <code>true</code>. Les tests « cachés » ne sont pas montrés au candidat.
                </p>
                <div className="mt-2 space-y-2">
                  {pad(q.correctAnswer?.code?.tests ?? [], Math.min(MAX_CODE_TESTS, (q.correctAnswer?.code?.tests.length ?? 0) + 2), () => ({
                    args: [] as unknown[],
                    expected: undefined as unknown,
                    hidden: false,
                  })).map((t, i) => (
                    <div key={i} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:grid-cols-[1fr_auto_1fr_auto]">
                      <input
                        name={`test_args_${i}`}
                        defaultValue={showArgs(t.args)}
                        placeholder="Arguments, ex. : [1, 2, 3]"
                        aria-label={`Arguments du test ${i + 1}`}
                        className={`${input} font-mono text-sm`}
                        spellCheck={false}
                      />
                      <span className="text-stone-400">→</span>
                      <input
                        name={`test_expected_${i}`}
                        defaultValue={show(t.expected)}
                        placeholder="Résultat, ex. : 6"
                        aria-label={`Résultat attendu du test ${i + 1}`}
                        className={`${input} font-mono text-sm`}
                        spellCheck={false}
                      />
                      <label className="col-span-3 flex items-center gap-1.5 text-xs text-stone-600 sm:col-span-1">
                        <input type="checkbox" name={`test_hidden_${i}`} defaultChecked={t.hidden} className="h-4 w-4" /> Caché
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </fieldset>
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
              <p className="text-xs text-stone-500">Enregistrez pour ajouter une ligne de critère supplémentaire.</p>
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

          <label className="flex items-center gap-2 text-sm text-stone-800">
            <input type="checkbox" name="isReserve" defaultChecked={q.isReserve} className="h-5 w-5" />
            Question de réserve (tirée au sort pour varier les versions entre candidats)
          </label>

          <ActionButton className={btn.primary}>Enregistrer la question</ActionButton>
        </form>

        <div className="flex flex-wrap gap-2 border-t border-stone-100 pt-3">
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
          {aiAvailable && isAiType(q.type) && (
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
