// Calcul des scores : par compétence (sur 100) et global (sur 100, pondéré
// par le poids des compétences). Fonction pure, testée dans tests/grade.test.ts.

export type ScoredItem = {
  skillId: string;
  weight: number; // poids de la compétence, en %
  maxPoints: number;
  points: number | null; // null = pas encore corrigé
};

export type Scores = {
  skillScores: Record<string, number>;
  globalScore: number | null; // null tant que tout n'est pas corrigé
  complete: boolean;
};

const round1 = (n: number) => Math.round(n * 10) / 10;

export function computeScores(items: ScoredItem[]): Scores {
  const bySkill = new Map<string, { weight: number; max: number; got: number; pending: boolean }>();
  for (const it of items) {
    const s = bySkill.get(it.skillId) ?? { weight: it.weight, max: 0, got: 0, pending: false };
    s.max += it.maxPoints;
    if (it.points === null) s.pending = true;
    else s.got += Math.max(0, Math.min(it.points, it.maxPoints));
    bySkill.set(it.skillId, s);
  }
  const skillScores: Record<string, number> = {};
  let weighted = 0;
  let totalWeight = 0;
  let complete = true;
  for (const [skillId, s] of bySkill) {
    const score = s.max > 0 ? (s.got / s.max) * 100 : 0;
    // Une compétence dont des réponses attendent la correction n'a pas encore de score.
    if (s.pending) complete = false;
    else skillScores[skillId] = round1(score);
    weighted += score * s.weight;
    totalWeight += s.weight;
  }
  return {
    skillScores,
    globalScore: complete && totalWeight > 0 ? round1(weighted / totalWeight) : null,
    complete,
  };
}
