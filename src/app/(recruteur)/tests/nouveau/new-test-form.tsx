"use client";

import { useActionState, useId, useMemo, useRef, useState } from "react";
import { Check, Lightbulb, Plus, Sparkles, Wand2 } from "lucide-react";
import { ActionButton, FormMessage } from "@/components/form";
import { SkillInput } from "@/components/skill-input";
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
import { bestJob, describeJob, normalize, searchJobs, searchSkills, suggestSkills } from "@/lib/tests/suggestions";
import { createTest } from "../actions";

const MAX_SKILLS = 6;

// Groupe de choix en « pastilles » (boutons radio stylés).
function ChoiceGroup({ legend, name, options, defaultValue }: { legend: string; name: string; options: string[][]; defaultValue: string }) {
  return (
    <fieldset>
      <legend className={label}>{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map(([value, text]) => (
          <label
            key={value}
            className="cursor-pointer rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-300 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-600 has-[:checked]:text-white has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-500/20"
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

  // ── Intitulé du poste avec suggestions ──
  const [title, setTitle] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const jobs = useMemo(() => searchJobs(title, 7), [title]);
  const matched = useMemo(() => bestJob(title), [title]);

  // ── Compétences suggérées (choisies par le recruteur) ──
  const [chosen, setChosen] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const proposals = useMemo(() => suggestSkills(title, chosen), [title, chosen]);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const pickJob = (t: string) => {
    setTitle(t);
    setOpen(false);
    // Pré-sélectionne les 4 premières compétences du métier choisi.
    setChosen(suggestSkills(t).slice(0, 4));
  };
  const toggle = (s: string) =>
    setChosen((c) => (c.includes(s) ? c.filter((x) => x !== s) : c.length >= MAX_SKILLS ? c : [...c, s]));
  const addSkill = (raw: string) => {
    const s = raw.trim();
    if (s.length >= 2) setChosen((c) => (c.includes(s) || c.length >= MAX_SKILLS ? c : [...c, s]));
    setCustom("");
  };
  // Bouton « Ajouter » : prend la meilleure suggestion si le texte tapé est un début de mot
  // (« nego » → « Négociation »), sinon le texte tel quel ; jamais un doublon d'une compétence déjà choisie.
  const addCustom = () => {
    const q = normalize(custom);
    if (q.length < 2 || chosen.some((c) => normalize(c).includes(q))) return setCustom("");
    const [best] = searchSkills(custom, { jobTitle: title, exclude: chosen, limit: 1 });
    addSkill(best && normalize(best).includes(q) ? best : custom);
  };

  return (
    <form action={action} className="space-y-5">
      <FormMessage state={state} />
      {chosen.map((s) => (
        <input key={s} type="hidden" name="suggestedSkill" value={s} />
      ))}
      <Card className="space-y-6">
        {/* Intitulé + liste de suggestions */}
        <div className="relative">
          <label htmlFor="jobTitle" className={label}>
            Intitulé du poste
          </label>
          <input
            id="jobTitle"
            name="jobTitle"
            required
            autoComplete="off"
            role="combobox"
            aria-expanded={open && jobs.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setOpen(true);
              setActive(0);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => {
              if (!open || jobs.length === 0) return;
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => (a + 1) % jobs.length);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => (a - 1 + jobs.length) % jobs.length);
              } else if (e.key === "Enter") {
                e.preventDefault();
                pickJob(jobs[active].title);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            className={`${input} mt-2`}
            placeholder="Commencez à taper : comptable, chauffeur, infirmier…"
          />
          {open && jobs.length > 0 && (
            <ul
              id={listId}
              role="listbox"
              className="absolute z-20 mt-2 max-h-80 w-full overflow-auto rounded-2xl border border-stone-200 bg-white p-1.5 shadow-lift"
            >
              {!title && <li className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wider text-stone-400">Postes fréquents</li>}
              {jobs.map((j, i) => (
                <li
                  key={j.title}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pickJob(j.title);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm ${i === active ? "bg-brand-50 text-brand-900" : "text-stone-800"}`}
                >
                  <span className="font-semibold">{j.title}</span>
                  <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">{j.family}</span>
                </li>
              ))}
            </ul>
          )}
          <Errors list={errors?.jobTitle} />
        </div>

        {/* Compétences proposées selon le poste */}
        {title.trim().length >= 2 && (
          <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-bold text-stone-900">
                <Lightbulb className="h-4 w-4 text-brand-600" />
                Compétences suggérées {matched ? <>pour « {matched.title} »</> : null}
              </p>
              <span className="text-xs font-semibold text-stone-500">
                {chosen.length} / {MAX_SKILLS} choisies
              </span>
            </div>
            <p className="mt-1 text-sm text-stone-600">Cliquez pour ajouter ou retirer. Vous pourrez les modifier et régler leur poids à l&apos;étape suivante.</p>

            {chosen.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {chosen.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(s)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                    title="Retirer"
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={3} /> {s}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {proposals.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle(s)}
                  disabled={chosen.length >= MAX_SKILLS}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" /> {s}
                </button>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <SkillInput
                className="flex-1"
                value={custom}
                onChange={setCustom}
                onPick={(s) => addSkill(s)}
                jobTitle={title}
                exclude={chosen}
                disabled={chosen.length >= MAX_SKILLS}
                placeholder="Ajouter une autre compétence : tapez pour voir des suggestions…"
                ariaLabel="Ajouter une compétence"
              />
              <button type="button" onClick={addCustom} className={btn.secondary} disabled={!custom.trim() || chosen.length >= MAX_SKILLS}>
                Ajouter
              </button>
            </div>
          </div>
        )}

        <div>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <label htmlFor="jobDescription" className={label}>
              Offre d&apos;emploi ou description du poste
            </label>
            {title.trim().length >= 2 && (
              <button
                type="button"
                className={btn.small}
                onClick={() => {
                  if (descRef.current && !descRef.current.value.trim()) descRef.current.value = describeJob(title.trim(), chosen);
                  else if (descRef.current) descRef.current.value += `\n\n${describeJob(title.trim(), chosen)}`;
                  descRef.current?.focus();
                }}
              >
                <Wand2 className="h-3.5 w-3.5" /> Remplir une description type
              </button>
            )}
          </div>
          <textarea
            ref={descRef}
            id="jobDescription"
            name="jobDescription"
            rows={8}
            className={`${input} mt-2`}
            placeholder="Collez ici le texte de l'offre, ou décrivez les missions et les compétences attendues. Plus c'est précis, meilleures seront les questions générées par l'IA."
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
                <input type="checkbox" name="questionTypes" value={t} defaultChecked={t !== "ORAL"} className="h-5 w-5 accent-brand-600" />
                {QUESTION_TYPE_LABELS[t]}
              </label>
            ))}
          </div>
          <Errors list={errors?.questionTypes} />
        </fieldset>
      </Card>

      {/* Génération */}
      <Card className="space-y-4">
        <div>
          <p className="flex items-center gap-2 font-bold text-stone-900">
            <Sparkles className="h-5 w-5 text-brand-600" /> Comment voulez-vous créer le test ?
          </p>
          <p className="mt-1 text-sm text-stone-600">Dans tous les cas, vous relirez chaque question avant de publier le test.</p>
        </div>
        {!aiAvailable && (
          <Notice tone="warning">
            La génération par IA n&apos;est pas encore activée (clé Anthropic manquante). Vous pouvez continuer avec les compétences
            choisies et écrire les questions vous-même, ou partir d&apos;un modèle de la bibliothèque.
          </Notice>
        )}
        <div className="grid gap-3 lg:grid-cols-3">
          <ActionButton
            name="mode"
            value="ai_full"
            disabled={!aiAvailable}
            className={`${btn.primary} h-full flex-col items-start gap-1 px-5 py-4 text-left`}
            pendingText="L'IA prépare tout le test (1 à 2 minutes)…"
          >
            <span className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4" /> Générer le test complet avec l&apos;IA
            </span>
            <span className="text-xs font-normal text-white/85">Compétences et questions, prêtes à relire.</span>
          </ActionButton>
          <ActionButton
            name="mode"
            value="ai"
            disabled={!aiAvailable}
            className={`${btn.secondary} h-full flex-col items-start gap-1 px-5 py-4 text-left`}
            pendingText="L'IA analyse le poste (jusqu'à une minute)…"
          >
            <span className="text-base">Proposer les compétences avec l&apos;IA</span>
            <span className="text-xs font-normal text-stone-500">Puis vous choisissez comment écrire les questions.</span>
          </ActionButton>
          <ActionButton name="mode" value="manual" className={`${btn.secondary} h-full flex-col items-start gap-1 px-5 py-4 text-left`}>
            <span className="text-base">Continuer sans IA</span>
            <span className="text-xs font-normal text-stone-500">
              {chosen.length ? `Avec les ${chosen.length} compétences choisies.` : "Vous saisissez compétences et questions."}
            </span>
          </ActionButton>
        </div>
      </Card>
    </form>
  );
}
