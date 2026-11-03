import { describe, expect, it } from "vitest";
import { ALL_SKILLS, bestJob, describeJob, normalize, searchJobs, searchSkills, suggestSkills } from "@/lib/tests/suggestions";

describe("suggestions de postes et de compétences", () => {
  it("ignore les accents et la casse", () => {
    expect(normalize("Infirmière")).toBe("infirmiere");
  });

  it("propose des postes dès les premières lettres", () => {
    expect(searchJobs("compt").map((j) => j.title)).toContain("Comptable");
    expect(searchJobs("infirmiere")[0].title).toBe("Infirmier / Infirmière");
    expect(searchJobs("ong").some((j) => j.family === "Humanitaire & ONG")).toBe(true);
  });

  it("montre des postes fréquents quand rien n'est tapé", () => {
    expect(searchJobs("", 5)).toHaveLength(5);
  });

  it("reconnaît un poste écrit autrement", () => {
    expect(bestJob("chauffeur poids lourd")?.title).toBe("Chauffeur");
    expect(bestJob("ab")).toBeNull();
  });

  it("suggère les compétences du métier, sans doublon ni compétence déjà choisie", () => {
    const skills = suggestSkills("Comptable", ["Fiscalité et TVA"]);
    expect(skills[0]).toBe("Comptabilité OHADA (SYSCOHADA)");
    expect(skills).not.toContain("Fiscalité et TVA");
    expect(new Set(skills).size).toBe(skills.length);
    expect(skills.length).toBeLessThanOrEqual(12);
  });

  it("propose au moins des compétences générales pour un poste inconnu", () => {
    expect(suggestSkills("Astronaute")).toContain("Travail en équipe");
  });

  it("trouve des compétences pendant la frappe, sans accents ni casse", () => {
    expect(searchSkills("compta")).toContain("Comptabilité OHADA (SYSCOHADA)");
    expect(searchSkills("securite").some((s) => s.includes("Sécurité"))).toBe(true);
    expect(searchSkills("excel", { limit: 3 })).toHaveLength(3);
  });

  it("ne propose pas de mots qui contiennent seulement les lettres au milieu", () => {
    const r = searchSkills("tre");
    expect(r).toContain("Trésorerie");
    expect(r.some((s) => s.startsWith("Entretien"))).toBe(false);
  });

  it("exclut les compétences déjà choisies et met celles du poste en premier", () => {
    expect(searchSkills("compta", { exclude: ["Comptabilité OHADA (SYSCOHADA)"] })).not.toContain("Comptabilité OHADA (SYSCOHADA)");
    expect(searchSkills("gestion", { jobTitle: "Magasinier" })[0]).toBe("Gestion des stocks (FIFO, inventaires)");
  });

  it("sans texte, propose les compétences du poste", () => {
    expect(searchSkills("", { jobTitle: "Chauffeur" })[0]).toBe("Code de la route");
  });

  it("le catalogue de compétences n'a pas de doublon", () => {
    expect(new Set(ALL_SKILLS.map(normalize)).size).toBe(ALL_SKILLS.length);
    expect(ALL_SKILLS.length).toBeGreaterThan(150);
  });

  it("prépare une description qui reprend les compétences", () => {
    expect(describeJob("Comptable", ["Paie"])).toContain("- Paie");
  });
});
