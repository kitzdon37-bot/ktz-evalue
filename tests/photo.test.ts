import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { testPhoto } from "@/lib/candidate/views";
import { JOB_SUGGESTIONS } from "@/lib/tests/suggestions";

// Photo du haut de la page de test, choisie selon le métier.
describe("photo de la page de test", () => {
  it("choisit une photo adaptée aux métiers courants", () => {
    expect(testPhoto("Comptable", "x")).toBe("/images/test/comptable.jpg");
    expect(testPhoto("Chauffeur", "x")).toBe("/images/test/chauffeur.jpg");
    expect(testPhoto("Développeur / Développeuse web", "x")).toBe("/images/test/informaticien.jpg");
    expect(testPhoto("Module : Programmation", "x")).toBe("/images/test/informaticien.jpg");
    expect(testPhoto("Chargé(e) de programme", "x")).toBe("/images/test/humanitaire.jpg");
    expect(testPhoto("Gestionnaire de stock / Magasinier", "x")).toBe("/images/test/logisticien.jpg");
    expect(testPhoto("Secrétaire de direction", "x")).toBe("/images/test/assistant.jpg");
  });
  it("varie la photo des autres métiers selon le test", () => {
    const photos = new Set(["a1", "b2", "c3", "d4", "e5", "f6", "g7", "h8"].map((id) => testPhoto("Infirmier / Infirmière", id)));
    expect(photos.size).toBeGreaterThan(1);
  });
  it("renvoie toujours une photo qui existe", () => {
    for (const j of JOB_SUGGESTIONS) {
      const p = testPhoto(j.title, j.title);
      expect(existsSync(`public${p}`), `${j.title} → ${p}`).toBe(true);
    }
  });
});
