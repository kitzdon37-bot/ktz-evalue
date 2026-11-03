"use client";

import { useActionState, useMemo, useState } from "react";
import { Lightbulb, Plus } from "lucide-react";
import { ActionButton, FormMessage } from "@/components/form";
import { btn, Card, input } from "@/components/ui";
import { evenWeights } from "@/lib/tests/model";
import { suggestSkills } from "@/lib/tests/suggestions";
import { proposeSkills, saveSkills } from "../../actions";

type Row = { key: string; id: string; name: string; weight: number; questions: number };

let counter = 0;
const newKey = () => `n${++counter}`;

export function SkillsForm({
  testId,
  skills,
  aiAvailable,
  hasQuestions,
  jobTitle = "",
}: {
  testId: string;
  skills: { id: string; name: string; weight: number; questions: number }[];
  aiAvailable: boolean;
  hasQuestions: boolean;
  jobTitle?: string;
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

  // Propositions selon le poste (sans IA) ; un clic ajoute la compétence et répartit les poids.
  const proposals = useMemo(() => suggestSkills(jobTitle, rows.map((r) => r.name)).slice(0, 10), [jobTitle, rows]);
  const addSuggestion = (name: string) => {
    const filled = rows.filter((r) => r.name.trim());
    if (filled.length >= 6) return;
    const next = [...filled, { key: newKey(), id: "", name, weight: 0, questions: 0 }];
    const w = evenWeights(next.length);
    setRows(next.map((r, i) => ({ ...r, weight: w[i] })));
  };

  return (
    <div className="space-y-4">
      {proposals.length > 0 && (
        <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4 sm:p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-stone-900">
            <Lightbulb className="h-4 w-4 text-brand-600" /> Suggestions pour ce poste
          </p>
          <p className="mt-1 text-sm text-stone-600">Un clic ajoute la compétence et répartit les poids également (6 compétences au plus).</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {proposals.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSuggestion(s)}
                disabled={rows.filter((r) => r.name.trim()).length >= 6}
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" /> {s}
              </button>
            ))}
          </div>
        </div>
      )}
      <form action={action} className="space-y-4">
        <FormMessage state={state} />
        <Card className="space-y-3">
          <div className="hidden grid-cols-[1fr_7rem_2.5rem] gap-2 text-sm font-medium text-stone-700 sm:grid">
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
            <span className={`text-sm font-semibold ${total === 100 ? "text-brand-800" : "text-red-700"}`}>
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
        <form action={propose} className="border-t border-stone-200 pt-4">
          <FormMessage state={proposeState} />
          <p className="mb-2 text-sm text-stone-600">
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
