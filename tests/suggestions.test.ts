import { describe, expect, it } from "vitest";
import { bestJob, describeJob, normalize, searchJobs, suggestSkills } from "@/lib/tests/suggestions";

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

  it("prépare une description qui reprend les compétences", () => {
    expect(describeJob("Comptable", ["Paie"])).toContain("- Paie");
  });
});
