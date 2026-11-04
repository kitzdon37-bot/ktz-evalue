import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { runCodeTests } from "@/lib/scoring/code-runner";
import { gradeClosed } from "@/lib/scoring/grade";
import { checkQuestion, type QuestionData } from "@/lib/tests/model";
// Fichiers de données JavaScript du script de chargement de la banque.
import { TEMPLATES } from "../prisma/seed/templates.mjs";
import { TEMPLATES_2 } from "../prisma/seed/templates-2.mjs";
import { TEMPLATES_3 } from "../prisma/seed/templates-3.mjs";
import { TEMPLATES_4 } from "../prisma/seed/templates-4.mjs";
import { MODULES } from "../prisma/seed/modules.mjs";

// Contrôle de toute la banque de questions KTZ : chaque question doit passer les contrôles de
// qualité, chaque illustration exister, chaque réponse courte être reconnue, et chaque exercice
// de code être réussi par une solution de référence (et pas par le code de départ seul).

type SeedQuestion = {
  type: QuestionData["type"];
  prompt: string;
  image?: string;
  choices?: string[];
  answer?: unknown;
  items?: string[];
  spec?: { functionName: string; starter: string; tests: { args: unknown[]; expected: unknown; hidden?: boolean }[] };
  rubric?: [string, number][];
  example?: string;
  explanation: string | null;
  time: number;
  points: number;
};
type SeedTemplate = { title: string; level: QuestionData["difficulty"]; skills: { name: string; weight: number; questions: SeedQuestion[] }[] };

const ALL = [...TEMPLATES, ...TEMPLATES_2, ...TEMPLATES_3, ...TEMPLATES_4, ...MODULES] as unknown as SeedTemplate[];
const letter = (i: number) => String.fromCharCode(97 + i);

function toData(q: SeedQuestion, level: QuestionData["difficulty"]): QuestionData {
  const d: QuestionData = {
    type: q.type, prompt: q.prompt, image: q.image ?? null, choices: null, correctAnswer: null, rubric: null,
    explanation: q.explanation, difficulty: level, suggestedTimeSec: q.time, points: q.points,
  };
  if (q.type === "MCQ_SINGLE" || q.type === "MCQ_MULTI") {
    d.choices = q.choices!.map((text, i) => ({ id: letter(i), text }));
    d.correctAnswer = { choiceIds: (Array.isArray(q.answer) ? q.answer : [q.answer]).map((i) => letter(i as number)) };
  } else if (q.type === "TRUE_FALSE") d.correctAnswer = { value: q.answer as boolean };
  else if (q.type === "SHORT_ANSWER") d.correctAnswer = q.answer as { value: string; tolerance: number | null };
  else if (q.type === "ORDERING") {
    d.choices = q.items!.map((text, i) => ({ id: letter(i), text }));
    d.correctAnswer = { order: q.items!.map((_, i) => letter(i)) };
  } else if (q.type === "CODE") {
    d.correctAnswer = { code: { language: "javascript", ...q.spec!, tests: q.spec!.tests.map((t) => ({ hidden: false, ...t })) } };
  } else d.rubric = { criteria: q.rubric!.map(([label, points]) => ({ label, points })), example: q.example ?? null };
  return d;
}

const SOLUTIONS: Record<string, string> = {
  somme: "function somme(t){return t.reduce(function(a,b){return a+b},0)}",
  ttc: "function ttc(m){return Math.round(m*1.19)}",
  inverser: "function inverser(t){return t.split('').reverse().join('')}",
  compterVoyelles: "function compterVoyelles(t){var n=0;for(var c of t.toLowerCase()){if('aeiouy'.includes(c))n++}return n}",
  estPalindrome: "function estPalindrome(m){var x=m.toLowerCase();return x===x.split('').reverse().join('')}",
  plusGrand: "function plusGrand(t){var m=t[0];for(var x of t){if(x>m)m=x}return m}",
  classer: "function classer(s){return [...s].sort(function(a,b){return b-a})}",
};

describe("banque de questions KTZ", () => {
  const questions = ALL.flatMap((t) => t.skills.flatMap((s) => s.questions.map((q) => ({ t, q, d: toData(q, t.level) }))));

  it("a des titres de modèles uniques et des poids qui font 100 %", () => {
    expect(new Set(ALL.map((t) => t.title)).size).toBe(ALL.length);
    for (const t of ALL) expect(t.skills.reduce((a, s) => a + s.weight, 0), t.title).toBe(100);
  });

  it("ne contient que des questions valides", () => {
    for (const { t, q, d } of questions) expect(checkQuestion(d), `${t.title} — ${q.prompt}`).toEqual([]);
  });

  it("a toutes ses illustrations, bien formées", () => {
    for (const { q } of questions) if (q.image) expect(existsSync(`public${q.image}`), q.image).toBe(true);
    for (const f of readdirSync("public/illustrations").filter((x) => x.endsWith(".svg"))) {
      const svg = readFileSync(`public/illustrations/${f}`, "utf8");
      expect(svg.startsWith("<svg "), f).toBe(true);
      // Deux attributs collés (points="…"fill="…") rendent le SVG illisible par le navigateur.
      expect(/"[a-z-]+=/.test(svg), `${f} : attributs collés`).toBe(false);
      expect(/<script|on[a-z]+=/i.test(svg), `${f} : pas de script dans une illustration`).toBe(false);
    }
  });

  it("reconnaît la réponse attendue des réponses courtes", () => {
    for (const { q, d } of questions.filter((x) => x.q.type === "SHORT_ANSWER")) {
      expect(gradeClosed(d, { text: (q.answer as { value: string }).value }), q.prompt).toBe(q.points);
    }
  });

  it("a des exercices de code justes, réussis par une solution de référence", async () => {
    for (const { q, d } of questions.filter((x) => x.q.type === "CODE")) {
      const spec = d.correctAnswer!.code!;
      const solution = SOLUTIONS[spec.functionName];
      expect(solution, `solution de référence pour ${spec.functionName}`).toBeTruthy();
      const results = await runCodeTests(solution, spec);
      expect(results.every((r) => r.passed), `${spec.functionName} : ${JSON.stringify(results)}`).toBe(true);
      const starter = await runCodeTests(q.spec!.starter, spec);
      expect(starter.some((r) => r.passed), `${spec.functionName} : le code de départ réussit déjà un test`).toBe(false);
    }
  });
});
