import { describe, expect, it } from "vitest";
import {
  allocate,
  checkQuestion,
  checkTest,
  checkWeights,
  evenWeights,
  questionPlan,
  type QuestionData,
} from "@/lib/tests/model";
import { blankQuestion, parseQuestionForm } from "@/lib/tests/question-form";

const mcq: QuestionData = {
  type: "MCQ_SINGLE",
  prompt: "Quel document justifie un paiement fournisseur ?",
  choices: [
    { id: "a", text: "La facture" },
    { id: "b", text: "Le devis" },
  ],
  correctAnswer: { choiceIds: ["a"] },
  rubric: null,
  explanation: null,
  difficulty: "CONFIRMED",
  suggestedTimeSec: 60,
  points: 1,
};

function form(entries: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.append(k, v);
  return fd;
}

describe("contrôles de qualité des questions", () => {
  it("accepte un QCM correct", () => {
    expect(checkQuestion(mcq)).toEqual([]);
  });

  it("refuse un QCM sans bonne réponse ou avec deux bonnes réponses", () => {
    expect(checkQuestion({ ...mcq, correctAnswer: { choiceIds: [] } })).toContain("Indiquez la bonne réponse.");
    expect(checkQuestion({ ...mcq, correctAnswer: { choiceIds: ["a", "b"] } }).length).toBe(1);
  });

  it("refuse des choix identiques et un énoncé vide", () => {
    const p = checkQuestion({ ...mcq, prompt: "", choices: [{ id: "a", text: "Oui" }, { id: "b", text: "oui " }] });
    expect(p).toContain("Deux choix sont identiques.");
    expect(p).toContain("L'énoncé est vide ou trop court.");
  });

  it("exige une grille pour les questions ouvertes", () => {
    const q = { ...blankQuestion("FREE_TEXT", "CONFIRMED"), prompt: "Rédigez un e-mail au fournisseur." };
    expect(checkQuestion(q)).toContain("Ajoutez au moins un critère à la grille de correction.");
  });

  it("repère les doublons et un temps total trop long", () => {
    const problems = checkTest([mcq, { ...mcq, prompt: "Quel document justifie un paiement fournisseur ?!" }], {
      durationMinutes: 15,
      questionCount: 2,
    });
    expect(problems.some((p) => p.startsWith("Question en double"))).toBe(true);
    const long = checkTest([{ ...mcq, suggestedTimeSec: 900 }, { ...mcq, prompt: "Autre question", suggestedTimeSec: 900 }], {
      durationMinutes: 15,
      questionCount: 2,
    });
    expect(long.some((p) => p.includes("dépasse la durée"))).toBe(true);
  });
});

describe("poids et répartition", () => {
  it("vérifie que les poids font 100 %", () => {
    expect(checkWeights([40, 30, 30])).toBeNull();
    expect(checkWeights([40, 30])).toMatch(/100 %/);
    expect(checkWeights([])).not.toBeNull();
  });

  it("répartit également 100 %", () => {
    expect(evenWeights(3)).toEqual([34, 33, 33]);
    expect(evenWeights(3).reduce((a, b) => a + b)).toBe(100);
  });

  it("répartit les questions selon les poids, réserve de 50 % comprise", () => {
    expect(allocate([50, 30, 20], 10)).toEqual([5, 3, 2]);
    const plan = questionPlan([40, 30, 30], 15);
    expect(plan.reduce((a, p) => a + p.main, 0)).toBe(15);
    expect(plan.reduce((a, p) => a + p.total, 0)).toBeGreaterThanOrEqual(23);
    plan.forEach((p) => expect(p.total).toBeGreaterThanOrEqual(p.main));
  });
});

describe("formulaire d'édition d'une question", () => {
  it("lit un QCM à une réponse et renumérote les choix", () => {
    const q = parseQuestionForm(
      "MCQ_SINGLE",
      form({ prompt: " Énoncé ", choice_0: "A", choice_1: "", choice_2: "C", correct: "2", points: "2", suggestedTimeSec: "45", difficulty: "EXPERT" }),
    );
    expect(q.prompt).toBe("Énoncé");
    expect(q.choices).toEqual([
      { id: "a", text: "A" },
      { id: "b", text: "C" },
    ]);
    expect(q.correctAnswer).toEqual({ choiceIds: ["b"] });
    expect(q.points).toBe(2);
    expect(q.difficulty).toBe("EXPERT");
  });

  it("lit un QCM à plusieurs réponses", () => {
    const q = parseQuestionForm("MCQ_MULTI", form({ prompt: "x", choice_0: "A", choice_1: "B", correct_0: "on", correct_1: "on" }));
    expect(q.correctAnswer).toEqual({ choiceIds: ["a", "b"] });
  });

  it("lit vrai/faux, réponse chiffrée et grille", () => {
    expect(parseQuestionForm("TRUE_FALSE", form({ tf: "false" })).correctAnswer).toEqual({ value: false });
    expect(parseQuestionForm("SHORT_ANSWER", form({ expected: "2380000", tolerance: "0,5" })).correctAnswer).toEqual({
      value: "2380000",
      tolerance: 0.5,
    });
    const open = parseQuestionForm(
      "SCENARIO",
      form({ criterion_0: "Sécurité", criterion_points_0: "3", criterion_1: "", example: "Exemple" }),
    );
    expect(open.rubric).toEqual({ criteria: [{ label: "Sécurité", points: 3 }], example: "Exemple" });
  });
});
