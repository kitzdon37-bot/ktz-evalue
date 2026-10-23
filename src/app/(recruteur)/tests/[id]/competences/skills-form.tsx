"use client";

import { useActionState, useState } from "react";
import { ActionButton, FormMessage } from "@/components/form";
import { btn, Card, input } from "@/components/ui";
import { evenWeights } from "@/lib/tests/model";
import { proposeSkills, saveSkills } from "../../actions";

type Row = { key: string; id: string; name: string; weight: number; questions: number };

let counter = 0;
const newKey = () => `n${++counter}`;

export function SkillsForm({
  testId,
  skills,
  aiAvailable,
  hasQuestions,
}: {
  testId: string;
  skills: { id: string; name: string; weight: number; questions: number }[];
  aiAvailable: boolean;
  hasQuestions: boolean;
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    skills.length
      ? skills.map((s) => ({ ...s, key: s.id }))
      : [{ key: newKey(), id: "", name: "", weight: 100, questions: 0 }],
  );
  const [state, action] = useActionState(saveSkills.bind(null, testId), undefined);
  const [proposeState, propose] = useActionState(proposeSkills.bind(null, testId), undefined);
  const total = rows.reduce((a, r) => a + (Number(r.weight) || 0), 0);

  const update = (key: string, patch: Partial<Row>) => setRows(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const balance = () => {
    const w = evenWeights(rows.length);
    setRows(rows.map((r, i) => ({ ...r, weight: w[i] })));
  };

  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4">
        <FormMessage state={state} />
        <Card className="space-y-3">
          <div className="hidden grid-cols-[1fr_7rem_2.5rem] gap-2 text-sm font-medium text-gray-700 sm:grid">
            <span>Compétence</span>
            <span>Poids (%)</span>
            <span />
          </div>
          {rows.map((r) => (
            <div key={r.key} className="grid grid-cols-[1fr_5.5rem_2.5rem] items-center gap-2 sm:grid-cols-[1fr_7rem_2.5rem]">
              <input type="hidden" name="skillId" value={r.id} />
              <input
                name="skillName"
                value={r.name}
                onChange={(e) => update(r.key, { name: e.target.value })}
                placeholder="Ex. : Comptabilité OHADA"
                aria-label="Nom de la compétence"
                className={input}
              />
              <input
                name="skillWeight"
                type="number"
                min={1}
                max={100}
                value={r.weight}
                onChange={(e) => update(r.key, { weight: Number(e.target.value) })}
                aria-label="Poids en pourcentage"
                className={input}
              />
              <button
                type="button"
                onClick={() => setRows(rows.filter((x) => x.key !== r.key))}
                disabled={rows.length === 1}
                className={btn.small}
                aria-label={`Supprimer ${r.name || "la compétence"}`}
                title={r.questions ? `Supprime aussi ses ${r.questions} question(s)` : "Supprimer"}
              >
                ✕
              </button>
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex gap-2">
              <button
                type="button"
                className={btn.small}
                disabled={rows.length >= 6}
                onClick={() => setRows([...rows, { key: newKey(), id: "", name: "", weight: 0, questions: 0 }])}
              >
                + Ajouter une compétence
              </button>
              <button type="button" className={btn.small} onClick={balance}>
                Répartir également
              </button>
            </div>
            <span className={`text-sm font-semibold ${total === 100 ? "text-teal-800" : "text-red-700"}`}>
              Total : {total} %
            </span>
          </div>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {aiAvailable && (
            <ActionButton
              name="next"
              value="generate"
              className={btn.primary}
              pendingText="Génération des questions (1 à 2 minutes)…"
            >
              {hasQuestions ? "Compléter les questions avec l'IA" : "Générer les questions avec l'IA"}
            </ActionButton>
          )}
          <ActionButton name="next" value="manual" className={aiAvailable ? btn.secondary : btn.primary}>
            {hasQuestions ? "Voir les questions" : "Écrire les questions moi-même"}
          </ActionButton>
          <ActionButton name="next" value="save" className={btn.secondary}>
            Enregistrer
          </ActionButton>
        </div>
      </form>

      {aiAvailable && (
        <form action={propose} className="border-t border-gray-200 pt-4">
          <FormMessage state={proposeState} />
          <p className="mb-2 text-sm text-gray-600">
            Remplace la liste actuelle par une nouvelle proposition de l&apos;IA
            {hasQuestions ? " (les questions déjà écrites seront supprimées)" : ""}.
          </p>
          <ActionButton className={btn.secondary} pendingText="L'IA réfléchit…">
            Proposer avec l&apos;IA
          </ActionButton>
        </form>
      )}
    </div>
  );
}
