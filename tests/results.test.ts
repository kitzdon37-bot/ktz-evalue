import { describe, expect, it } from "vitest";
import { reliability, textSimilarity } from "@/lib/scoring/reliability";

describe("indice de fiabilité", () => {
  it("élevée sans signal ou avec un signal faible", () => {
    expect(reliability([])).toEqual({ level: "HIGH", summary: "Aucun signal" });
    expect(reliability([{ type: "FULLSCREEN_EXIT", durationMs: null }]).level).toBe("HIGH");
  });

  it("résume les signaux comme dans le cahier des charges", () => {
    const r = reliability([
      { type: "TAB_HIDDEN", durationMs: 14_000 },
      { type: "TAB_HIDDEN", durationMs: 3_000 },
      { type: "PASTE", durationMs: null },
    ]);
    expect(r.summary).toBe("2 sorties d'onglet (14 s, 3 s), 1 texte collé");
    expect(r.level).toBe("LOW");
  });

  it("« à vérifier » pour quelques signaux moyens", () => {
    expect(reliability([{ type: "FAST_ANSWER", durationMs: null }, { type: "TAB_HIDDEN", durationMs: 2000 }]).level).toBe("TO_CHECK");
  });
});

describe("textes très proches entre candidats", () => {
  const a =
    "Je vérifie d'abord la sécurité de l'équipe, puis j'informe la coordination et je cherche un itinéraire de contournement avec les partenaires.";
  it("détecte un texte recopié avec de petites modifications", () => {
    const b = a.replace("d'abord", "en premier").replace("partenaires.", "partenaires locaux.");
    expect(textSimilarity(a, b)).toBeGreaterThan(0.6);
  });
  it("ne confond pas deux réponses différentes sur le même sujet", () => {
    const c = "Je rassemble les chauffeurs, je préviens mon chef par téléphone satellite et j'attends des instructions avant de bouger les camions.";
    expect(textSimilarity(a, c)).toBeLessThan(0.2);
  });
});
