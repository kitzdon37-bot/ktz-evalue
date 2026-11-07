import { describe, expect, it } from "vitest";
import { correctionRow } from "@/lib/reports/correction";
import { candidateThanks, employerResults } from "@/lib/reports/result-email";
import type { QuestionData } from "@/lib/tests/model";

const mcq: QuestionData = {
  type: "MCQ_SINGLE",
  prompt: "Quel compte enregistre les achats de marchandises ?",
  choices: [
    { id: "a", text: "601" },
    { id: "b", text: "701" },
  ],
  correctAnswer: { choiceIds: ["a"] },
  rubric: null,
  explanation: "",
  difficulty: "CONFIRMED",
  suggestedTimeSec: 60,
  points: 1,
} as QuestionData;

const answer = (content: unknown, autoScore: number | null) => ({ content, autoScore, aiScore: null, overrideScore: null });

describe("correction question par question", () => {
  it("indique la réponse du candidat, la bonne réponse et le statut", () => {
    expect(correctionRow(1, "Comptabilité", mcq, answer({ choiceIds: ["a"] }, 1))).toMatchObject({
      given: "601",
      expected: "601",
      status: "juste",
      points: 1,
      max: 1,
    });
    expect(correctionRow(2, "Comptabilité", mcq, answer({ choiceIds: ["b"] }, 0))).toMatchObject({ given: "701", status: "faux", points: 0 });
    expect(correctionRow(3, "Comptabilité", mcq, undefined)).toMatchObject({ given: "Pas de réponse", status: "sans-reponse", points: 0 });
  });

  it("met « À corriger » une réponse écrite pas encore notée", () => {
    const free = { ...mcq, type: "FREE_TEXT", choices: null, correctAnswer: null, points: 5 } as QuestionData;
    expect(correctionRow(1, "Rédaction", free, answer({ text: "Ma réponse" }, null))).toMatchObject({ status: "attente", points: null });
  });
});

describe("messages de fin de test", () => {
  it("remercie le candidat et annonce que l'entreprise reviendra vers lui", () => {
    const m = candidateThanks({ candidateName: "Awa Koné", companyName: "Banque du Centre", testTitle: "Comptable", contactPhone: "+236 70 00 00 00" });
    expect(m.subject).toContain("Merci");
    expect(m.text).toContain("Bonjour Awa,");
    expect(m.text).toContain("reviendra vers vous très bientôt");
    expect(m.text).toContain("+236 70 00 00 00");
    expect(m.html).not.toContain("<script");
  });

  it("donne à l'employeur le score, les compétences et la correction", () => {
    const rows = [
      correctionRow(1, "Comptabilité", mcq, answer({ choiceIds: ["a"] }, 1)),
      correctionRow(2, "Comptabilité", mcq, answer({ choiceIds: ["b"] }, 0)),
    ];
    const m = employerResults({
      candidateName: "Awa <b>Koné</b>",
      candidateContact: "awa@exemple.cf",
      testTitle: "Comptable",
      globalScore: 72.4,
      passThreshold: 60,
      passed: true,
      pending: false,
      durationText: "18 min",
      reliabilityLabel: "Élevée",
      skills: [{ name: "Comptabilité", score: 72.4 }],
      correction: rows,
      url: "http://localhost:3100/tests/t/resultats/a",
    });
    expect(m.subject).toContain("72/100");
    expect(m.text).toContain("1 juste(s) sur 2");
    expect(m.text).toContain("Attendu : 601");
    expect(m.html).toContain("Correction question par question");
    expect(m.html).toContain("Awa &#60;b&#62;Koné&#60;/b&#62;"); // le nom est échappé
  });
});
