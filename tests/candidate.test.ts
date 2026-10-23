import { describe, expect, it } from "vitest";
import { drawQuestions } from "@/lib/candidate/draw";
import { gradeClosed, parseNumber } from "@/lib/scoring/grade";
import { computeScores } from "@/lib/scoring/score";
import { parseCandidates, splitRows } from "@/lib/candidates/parse";
import { normalizePhone } from "@/lib/phone";
import { esc } from "@/lib/candidate/views";
import type { QuestionData } from "@/lib/tests/model";

// Générateur pseudo-aléatoire reproductible pour les tests.
function seeded(seed: number) {
  return () => {
    seed = (seed * 1103515245 + 12345) % 2 ** 31;
    return seed / 2 ** 31;
  };
}

const skills = [
  {
    questions: [
      { id: "a1", isReserve: false, choiceIds: ["a", "b", "c"] },
      { id: "a2", isReserve: false, choiceIds: null },
      { id: "a3", isReserve: true, choiceIds: null },
    ],
  },
  { questions: [{ id: "b1", isReserve: false, choiceIds: ["a", "b"] }, { id: "b2", isReserve: true, choiceIds: null }] },
];

describe("tirage des questions", () => {
  it("sans mélange : questions principales dans l'ordre, sans la réserve", () => {
    const d = drawQuestions(skills, { shuffleQuestions: false, shuffleChoices: false });
    expect(d.map((x) => x.questionId)).toEqual(["a1", "a2", "b1"]);
    expect(d[0].choiceOrder).toEqual(["a", "b", "c"]);
  });

  it("avec mélange : même nombre de questions par compétence, tirées dans la réserve", () => {
    for (let s = 1; s < 30; s++) {
      const d = drawQuestions(skills, { shuffleQuestions: true, shuffleChoices: true }, seeded(s));
      const ids = d.map((x) => x.questionId);
      expect(ids.length).toBe(3);
      expect(ids.filter((i) => i.startsWith("a")).length).toBe(2);
      expect(ids.filter((i) => i.startsWith("b")).length).toBe(1);
      expect(new Set(ids).size).toBe(3);
      const a1 = d.find((x) => x.questionId === "a1");
      if (a1) expect([...a1.choiceOrder!].sort()).toEqual(["a", "b", "c"]);
    }
  });

  it("produit des versions différentes selon les candidats", () => {
    const versions = new Set(
      Array.from({ length: 20 }, (_, s) =>
        drawQuestions(skills, { shuffleQuestions: true, shuffleChoices: true }, seeded(s + 1))
          .map((x) => x.questionId + (x.choiceOrder ?? []).join(""))
          .join("|"),
      ),
    );
    expect(versions.size).toBeGreaterThan(3);
  });
});

const base: QuestionData = {
  type: "MCQ_SINGLE",
  prompt: "x",
  choices: [
    { id: "a", text: "A" },
    { id: "b", text: "B" },
    { id: "c", text: "C" },
  ],
  correctAnswer: { choiceIds: ["b"] },
  rubric: null,
  explanation: null,
  difficulty: "CONFIRMED",
  suggestedTimeSec: 60,
  points: 2,
};

describe("correction automatique", () => {
  it("QCM à une réponse", () => {
    expect(gradeClosed(base, { choiceIds: ["b"] })).toBe(2);
    expect(gradeClosed(base, { choiceIds: ["a"] })).toBe(0);
    expect(gradeClosed(base, null)).toBe(0);
  });

  it("QCM à plusieurs réponses : proportionnel, une erreur annule", () => {
    const q = { ...base, type: "MCQ_MULTI" as const, correctAnswer: { choiceIds: ["a", "b"] } };
    expect(gradeClosed(q, { choiceIds: ["a", "b"] })).toBe(2);
    expect(gradeClosed(q, { choiceIds: ["a"] })).toBe(1);
    expect(gradeClosed(q, { choiceIds: ["a", "c"] })).toBe(0);
  });

  it("vrai/faux", () => {
    const q = { ...base, type: "TRUE_FALSE" as const, choices: null, correctAnswer: { value: false } };
    expect(gradeClosed(q, { value: false })).toBe(2);
    expect(gradeClosed(q, { value: true })).toBe(0);
  });

  it("réponse chiffrée avec espaces, virgule et tolérance", () => {
    const q = { ...base, type: "SHORT_ANSWER" as const, choices: null, correctAnswer: { value: "2380000", tolerance: 0 } };
    expect(gradeClosed(q, { text: "2 380 000 FCFA" })).toBe(2);
    expect(gradeClosed(q, { text: "2 380 001" })).toBe(0);
    const t = { ...q, correctAnswer: { value: "12,5", tolerance: 0.5 } };
    expect(gradeClosed(t, { text: "12.9" })).toBe(2);
    expect(parseNumber("25 %")).toBe(25);
  });

  it("réponse courte en texte (heure)", () => {
    const q = { ...base, type: "SHORT_ANSWER" as const, choices: null, correctAnswer: { value: "16:15" } };
    expect(gradeClosed(q, { text: "16 h 15" })).toBe(2);
    expect(gradeClosed(q, { text: "16:30" })).toBe(0);
  });

  it("question ouverte : pas de correction automatique", () => {
    expect(gradeClosed({ ...base, type: "FREE_TEXT", choices: null, correctAnswer: null }, { text: "x" })).toBeNull();
  });
});

describe("calcul des scores", () => {
  it("pondère les compétences et attend la correction des réponses ouvertes", () => {
    const done = computeScores([
      { skillId: "s1", weight: 60, maxPoints: 2, points: 2 },
      { skillId: "s1", weight: 60, maxPoints: 2, points: 0 },
      { skillId: "s2", weight: 40, maxPoints: 4, points: 4 },
    ]);
    expect(done.skillScores).toEqual({ s1: 50, s2: 100 });
    expect(done.globalScore).toBe(70);
    const pending = computeScores([
      { skillId: "s1", weight: 100, maxPoints: 2, points: 2 },
      { skillId: "s1", weight: 100, maxPoints: 5, points: null },
    ]);
    expect(pending.complete).toBe(false);
    expect(pending.globalScore).toBeNull();
    expect(pending.skillScores).toEqual({});
  });
});

describe("import de candidats", () => {
  it("reconnaît les colonnes, ignore l'en-tête et les doublons", () => {
    const rows = splitRows("Nom;Email;Téléphone\nMarie Yakité;marie@exemple.cf;75 12 34 56\nJean;jean@ex.cf\nmarie@exemple.cf;Marie bis\n;;\nSans contact");
    const { valid, errors } = parseCandidates(rows);
    expect(valid).toEqual([
      { name: "Marie Yakité", email: "marie@exemple.cf", phone: "+23675123456" },
      { name: "Jean", email: "jean@ex.cf", phone: null },
    ]);
    expect(errors).toEqual(["Ligne 6 : il faut un email ou un numéro de téléphone."]);
  });

  it("met les numéros au format international", () => {
    expect(normalizePhone("75 12 34 56")).toBe("+23675123456");
    expect(normalizePhone("00236 75123456")).toBe("+23675123456");
    expect(normalizePhone("+237 6 99 99 99 99")).toBe("+237699999999");
    expect(normalizePhone("12")).toBeNull();
  });
});

describe("pages candidat", () => {
  it("échappe le contenu pour éviter l'injection de code", () => {
    expect(esc(`<script>alert("x")</script>`)).not.toContain("<");
  });
});
