import { describe, expect, it } from "vitest";
import { ALL_SKILLS, bestJob, describeJob, JOB_SUGGESTIONS, normalize, searchJobs, searchSkills, skillSimilarity, suggestSkills } from "@/lib/tests/suggestions";
// Modèles de la banque, écrits en JavaScript (prisma/seed).
import { TEMPLATES_2 } from "../prisma/seed/templates-2.mjs";

type T = { profession: string; skills: { name: string; weight: number; questions: { type: string; answer?: unknown; choices?: string[] }[] }[] };

describe("banque de questions (modèles de la série 2)", () => {
  it("rapproche les compétences sans faux positifs", () => {
    expect(skillSimilarity("Comptabilité OHADA (SYSCOHADA)", "Comptabilité OHADA")).toBe(1);
    expect(skillSimilarity("Fiscalité et TVA", "Fiscalité et paie")).toBeGreaterThanOrEqual(0.5);
    expect(skillSimilarity("Gestion de caisse", "Gestion des stocks (FIFO, inventaires)")).toBe(0);
    // Un seul mot en commun sur deux : trop faible pour rapprocher deux métiers différents (seuil 0,75).
    expect(skillSimilarity("Contrôle des accès", "Contrôle et rigueur")).toBeLessThan(0.75);
    expect(skillSimilarity("Contrôle interne et audit", "Contrôle interne")).toBe(1);
  });

  it("chaque modèle correspond à un métier du catalogue, avec des compétences du catalogue", () => {
    const titles = new Set(JOB_SUGGESTIONS.map((j) => j.title));
    const skills = new Set(ALL_SKILLS.map(normalize));
    for (const t of TEMPLATES_2 as T[]) {
      expect(titles.has(t.profession), t.profession).toBe(true);
      for (const s of t.skills) expect(skills.has(normalize(s.name)), s.name).toBe(true);
    }
  });

  it("chaque modèle est cohérent : poids à 100 %, au moins 10 questions, bonnes réponses valides", () => {
    for (const t of TEMPLATES_2 as T[]) {
      expect(t.skills.reduce((a, s) => a + s.weight, 0), t.profession).toBe(100);
      const qs = t.skills.flatMap((s) => s.questions);
      expect(qs.length, t.profession).toBeGreaterThanOrEqual(10);
      for (const q of qs) {
        if (q.type === "MCQ_SINGLE") expect((q.answer as number) < (q.choices?.length ?? 0)).toBe(true);
        if (q.type === "TRUE_FALSE") expect(typeof q.answer).toBe("boolean");
      }
    }
  });
});

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
