"use client";

import { useState } from "react";
import { ArrowRight, Check, RotateCcw, X } from "lucide-react";

// « Essayez une question » : le visiteur répond à de vraies questions de la banque KTZ
// et voit tout de suite la bonne réponse, comme le recruteur la verra.
const QUESTIONS = [
  {
    tag: "Raisonnement",
    prompt: "Quel nombre complète la suite : 2, 6, 12, 20, 30, … ?",
    image: null,
    choices: ["36", "40", "42", "48"],
    answer: 2,
    explanation: "Les écarts augmentent de 2 : +4, +6, +8, +10, puis +12. 30 + 12 = 42.",
  },
  {
    tag: "Raisonnement illustré",
    prompt: "Combien de points faut-il dans la case vide ?",
    image: "/illustrations/matrice-points.svg",
    choices: ["3", "4", "5", "6"],
    answer: 2,
    explanation: "Dans chaque ligne et chaque colonne, on ajoute un point : 3, 4, puis 5.",
  },
  {
    tag: "Culture générale",
    prompt: "À quel pays appartient ce drapeau ?",
    image: "/illustrations/drapeau-rca.svg",
    choices: ["Cameroun", "République centrafricaine", "Gabon", "Congo"],
    answer: 1,
    explanation: "Bleu, blanc, vert, jaune, une bande rouge et une étoile jaune : le drapeau centrafricain.",
  },
];

export function TryQuestion() {
  const [k, setK] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const finished = k >= QUESTIONS.length;
  const q = QUESTIONS[Math.min(k, QUESTIONS.length - 1)];

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setScore((s) => s + 1);
  };
  const next = () => {
    setPicked(null);
    setK((x) => x + 1);
  };
  const restart = () => {
    setK(0);
    setPicked(null);
    setScore(0);
  };

  if (finished) {
    return (
      <div className="try-in rounded-[1.75rem] bg-white p-8 text-center shadow-lift ring-1 ring-stone-200/70">
        <p className="text-sm font-bold uppercase tracking-wider text-brand-600">Votre score</p>
        <p className="mt-2 text-6xl font-extrabold tracking-tight text-stone-900">
          {score}
          <span className="text-3xl text-stone-400">/{QUESTIONS.length}</span>
        </p>
        <p className="mx-auto mt-3 max-w-sm text-stone-600">
          Vos candidats vivent la même expérience, sur leur téléphone. Vous recevez leurs scores par compétence et un classement.
        </p>
        <button
          type="button"
          onClick={restart}
          className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-brand-700 ring-1 ring-brand-200 transition hover:bg-brand-50"
        >
          <RotateCcw className="h-4 w-4" /> Recommencer
        </button>
      </div>
    );
  }

  return (
    <div key={k} className="try-in overflow-hidden rounded-[1.75rem] bg-white shadow-lift ring-1 ring-stone-200/70">
      <div className="h-1.5 bg-gradient-to-r from-brand-400 to-brand-600" />
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
            Question {k + 1} sur {QUESTIONS.length} · {q.tag}
          </span>
          <span className="flex gap-1.5" aria-hidden="true">
            {QUESTIONS.map((_, i) => (
              <span key={i} className={`h-1.5 w-6 rounded-full transition-colors ${i < k ? "bg-brand-500" : i === k ? "bg-brand-300" : "bg-stone-200"}`} />
            ))}
          </span>
        </div>
        <p className="mt-4 text-xl font-bold leading-snug text-brand-600 sm:text-2xl">{q.prompt}</p>
        {q.image && (
          // eslint-disable-next-line @next/next/no-img-element -- petite illustration SVG locale
          <img src={q.image} alt="Illustration de la question" className="mx-auto mt-4 max-h-44 w-auto rounded-xl border border-stone-200" />
        )}
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {q.choices.map((c, i) => {
            const isAnswer = i === q.answer;
            const state = picked === null ? "idle" : isAnswer ? "good" : picked === i ? "bad" : "dim";
            return (
              <button
                key={c}
                type="button"
                onClick={() => pick(i)}
                disabled={picked !== null}
                className={`group flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-semibold transition-all duration-300 ${
                  state === "idle"
                    ? "border-stone-200 text-stone-800 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
                    : state === "good"
                      ? "answer-pop border-emerald-500 bg-emerald-50 text-emerald-900"
                      : state === "bad"
                        ? "answer-shake border-red-400 bg-red-50 text-red-800"
                        : "border-stone-200 text-stone-400 opacity-60"
                }`}
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-sm font-extrabold transition-colors ${
                    state === "good" ? "bg-emerald-500 text-white" : state === "bad" ? "bg-red-500 text-white" : "bg-stone-100 text-stone-500 group-hover:bg-brand-500 group-hover:text-white"
                  }`}
                >
                  {state === "good" ? <Check className="h-4 w-4" strokeWidth={3} /> : state === "bad" ? <X className="h-4 w-4" strokeWidth={3} /> : String.fromCharCode(65 + i)}
                </span>
                {c}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <div className="try-in mt-5 flex flex-col gap-4 rounded-2xl bg-stone-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-stone-700">
              <strong className={picked === q.answer ? "text-emerald-700" : "text-red-700"}>{picked === q.answer ? "Bonne réponse ! " : "Pas tout à fait. "}</strong>
              {q.explanation}
            </p>
            <button
              type="button"
              onClick={next}
              className="btn-shine inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              {k + 1 < QUESTIONS.length ? "Question suivante" : "Voir mon score"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
