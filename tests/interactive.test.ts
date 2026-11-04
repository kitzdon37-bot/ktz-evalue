import { describe, expect, it, vi } from "vitest";

// Le module d'exécution est réservé au serveur : on neutralise « server-only » pour le tester.
vi.mock("server-only", () => ({}));

import { codePoints, runCodeTests, sameValue } from "@/lib/scoring/code-runner";
import { gradeClosed } from "@/lib/scoring/grade";
import { checkQuestion, isAllowedImage, type CodeSpec, type QuestionData } from "@/lib/tests/model";
import { looseArgs, looseJson, parseQuestionForm } from "@/lib/tests/question-form";
import { drawQuestions } from "@/lib/candidate/draw";

const ordering: QuestionData = {
  type: "ORDERING",
  prompt: "Classez du plus ancien au plus récent.",
  choices: [
    { id: "a", text: "1960" },
    { id: "b", text: "1963" },
    { id: "c", text: "1993" },
    { id: "d", text: "2002" },
  ],
  correctAnswer: { order: ["a", "b", "c", "d"] },
  rubric: null,
  explanation: null,
  difficulty: "CONFIRMED",
  suggestedTimeSec: 90,
  points: 2,
};

describe("remettre dans l'ordre", () => {
  it("donne tous les points pour le bon ordre", () => {
    expect(gradeClosed(ordering, { order: ["a", "b", "c", "d"] })).toBe(2);
  });
  it("donne des points partiels selon les éléments bien placés", () => {
    expect(gradeClosed(ordering, { order: ["a", "b", "d", "c"] })).toBe(1);
    expect(gradeClosed(ordering, { order: ["d", "c", "b", "a"] })).toBe(0);
  });
  it("refuse une réponse incomplète", () => {
    expect(gradeClosed(ordering, { order: ["a", "b"] })).toBe(0);
    expect(gradeClosed(ordering, null)).toBe(0);
  });
  it("ne montre jamais les éléments déjà dans le bon ordre", () => {
    for (let i = 0; i < 50; i++) {
      const [d] = drawQuestions(
        [{ questions: [{ id: "q", isReserve: false, choiceIds: ["a", "b", "c"], alwaysShuffle: true }] }],
        { shuffleQuestions: false, shuffleChoices: false },
      );
      expect(d.choiceOrder).not.toEqual(["a", "b", "c"]);
      expect([...(d.choiceOrder ?? [])].sort()).toEqual(["a", "b", "c"]);
    }
  });
  it("exige au moins 3 éléments", () => {
    expect(checkQuestion({ ...ordering, choices: ordering.choices!.slice(0, 2) })).toContain("Indiquez au moins 3 éléments à remettre dans l'ordre.");
    expect(checkQuestion(ordering)).toEqual([]);
  });
});

const spec: CodeSpec = {
  language: "javascript",
  functionName: "somme",
  starter: "function somme(tableau) {\n}\n",
  tests: [
    { args: [[1, 2, 3]], expected: 6, hidden: false },
    { args: [[]], expected: 0, hidden: false },
    { args: [[-5, 10, 2.5]], expected: 7.5, hidden: true },
  ],
};

describe("exercice de code", () => {
  it("réussit tous les tests avec un code juste", async () => {
    const r = await runCodeTests("function somme(t){return t.reduce(function(a,b){return a+b},0)}", spec);
    expect(r.every((x) => x.passed)).toBe(true);
    expect(codePoints(r, 5)).toBe(5);
  });
  it("donne des points partiels", async () => {
    const r = await runCodeTests("function somme(t){ if(t.length===0) return 0; return 6 }", spec);
    expect(r.map((x) => x.passed)).toEqual([true, true, false]);
    expect(codePoints(r, 6)).toBe(4);
  });
  it("arrête une boucle infinie", async () => {
    const start = Date.now();
    const r = await runCodeTests("function somme(t){ while(true){} }", { ...spec, tests: spec.tests.slice(0, 1) });
    expect(r[0].passed).toBe(false);
    expect(r[0].error).toMatch(/Temps dépassé/);
    expect(Date.now() - start).toBeLessThan(5000);
  });
  it("n'a aucun accès au serveur", async () => {
    const r = await runCodeTests(
      "function somme(){ return [typeof process, typeof require, typeof fetch, typeof globalThis.process].join(',') }",
      { ...spec, tests: [{ args: [], expected: "undefined,undefined,undefined,undefined", hidden: false }] },
    );
    expect(r[0].passed).toBe(true);
  });
  it("signale une fonction absente ou une erreur", async () => {
    const r1 = await runCodeTests("function autre(){}", { ...spec, tests: spec.tests.slice(0, 1) });
    expect(r1[0].error).toMatch(/introuvable/);
    const r2 = await runCodeTests("function somme(t){ return t.inconnu.x }", { ...spec, tests: spec.tests.slice(0, 1) });
    expect(r2[0].passed).toBe(false);
    expect(r2[0].error).toBeTruthy();
  });
  it("compare les tableaux et objets en profondeur", () => {
    expect(sameValue([1, { a: 2, b: [3] }], [1, { b: [3], a: 2 }])).toBe(true);
    expect(sameValue(0.1 + 0.2, 0.3)).toBe(true);
    expect(sameValue("5", 5)).toBe(false);
  });
});

describe("éditeur : saisie des tests de code", () => {
  it("lit les valeurs comme en JavaScript", () => {
    expect(looseArgs("2, 3")).toEqual([2, 3]);
    expect(looseArgs("[1, 2, 3]")).toEqual([[1, 2, 3]]);
    expect(looseArgs('"Bangui"')).toEqual(["Bangui"]);
    expect(looseArgs("Bangui")).toEqual(["Bangui"]);
    expect(looseJson("6")).toBe(6);
    expect(looseJson("Bangui")).toBe("Bangui");
    expect(looseJson("[18, 12]")).toEqual([18, 12]);
  });
  it("construit l'exercice depuis le formulaire", () => {
    const fd = new FormData();
    fd.set("prompt", "Écrivez somme(tableau).");
    fd.set("functionName", "somme");
    fd.set("starter", "function somme(tableau) {\r\n}\r\n");
    fd.set("test_args_0", "[1, 2, 3]");
    fd.set("test_expected_0", "6");
    fd.set("test_args_1", "[]");
    fd.set("test_expected_1", "0");
    fd.set("test_hidden_1", "on");
    fd.set("points", "5");
    fd.set("suggestedTimeSec", "600");
    const q = parseQuestionForm("CODE", fd);
    expect(q.correctAnswer?.code?.tests).toEqual([
      { args: [[1, 2, 3]], expected: 6, hidden: false },
      { args: [[]], expected: 0, hidden: true },
    ]);
    expect(q.correctAnswer?.code?.starter).toBe("function somme(tableau) {\n}\n");
    expect(checkQuestion(q)).toEqual([]);
  });
});

describe("illustrations", () => {
  it("accepte les images de la banque et les images compressées", () => {
    expect(isAllowedImage("/illustrations/drapeau-rca.svg")).toBe(true);
    expect(isAllowedImage("data:image/jpeg;base64,/9j/4AAQSkZJRg==")).toBe(true);
  });
  it("refuse les SVG envoyés, les liens externes et les chemins piégés", () => {
    expect(isAllowedImage("data:image/svg+xml;base64,PHN2Zz4=")).toBe(false);
    expect(isAllowedImage("https://exemple.com/image.png")).toBe(false);
    expect(isAllowedImage("/illustrations/../secret.svg")).toBe(false);
    expect(isAllowedImage('/illustrations/x.svg" onerror="alert(1)')).toBe(false);
  });
});
