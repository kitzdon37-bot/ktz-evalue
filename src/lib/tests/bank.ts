import "server-only";
import { db } from "@/lib/db";
import { evenWeights, MIN_QUESTIONS, questionPlan, type QuestionType } from "./model";
import { fromDb, getCompanyTest, toDb } from "./repository";
import { normalize, skillSimilarity } from "./suggestions";

// Génération gratuite, sans IA en ligne : pour chaque compétence du test, on reprend les
// questions de la banque (modèles de la bibliothèque) dont la compétence lui correspond.
// Le test obtenu doit pouvoir être publié tel quel : on retire les compétences que la banque
// ne couvre pas et, s'il manque des questions, on ajoute d'autres compétences du même métier.
// Les questions restent modifiables ensuite, comme celles générées par l'IA.

// Ressemblance minimale entre deux noms de compétence : souple dans le même métier,
// stricte entre métiers différents (« Contrôle des accès » ≠ « Contrôle et rigueur » du comptable).
const MIN_SIMILARITY = 0.5;
const MIN_SIMILARITY_OTHER_JOB = 0.75;

export type BankResult = {
  added: number;
  /** Compétences retirées faute de questions dans la banque. */
  removed: string[];
  /** Compétences du même métier ajoutées pour atteindre le nombre de questions. */
  extra: string[];
  /** Compétences toujours sans question (si la banque ne couvre rien d'utile). */
  uncovered: string[];
  questionCount: number;
};

type BankSkill = Awaited<ReturnType<typeof loadBank>>[number];

function loadBank() {
  return db.skill.findMany({
    where: { template: { active: true } },
    select: {
      name: true,
      template: { select: { id: true, profession: true } },
      questions: { orderBy: { position: "asc" } },
    },
  });
}

export async function fillFromBank(testId: string, companyId: string): Promise<BankResult> {
  const test = await getCompanyTest(testId, companyId);
  const allowed = new Set(test.questionTypes as QuestionType[]);
  const bank = await loadBank();
  const job = normalize(test.jobTitle);
  const sameJob = (profession: string | undefined) => {
    const p = normalize(profession ?? "");
    return p.length > 0 && (p.includes(job) || job.includes(p));
  };
  const seen = new Set(test.skills.flatMap((s) => s.questions.map((q) => normalize(q.prompt))));

  // Questions de la banque utilisables pour un nom de compétence (meilleures correspondances d'abord).
  const candidatesFor = (name: string) =>
    bank
      .map((b) => {
        const same = sameJob(b.template?.profession);
        const sim = skillSimilarity(name, b.name);
        return { b, ok: sim >= (same ? MIN_SIMILARITY : MIN_SIMILARITY_OTHER_JOB), score: sim + (same ? 0.01 : 0) };
      })
      .filter((m) => m.ok)
      .sort((a, b) => b.score - a.score)
      .flatMap(({ b }) => b.questions)
      .filter((q) => allowed.has(q.type as QuestionType));

  const take = (pool: BankSkill["questions"], max: number) => {
    const rows: ReturnType<typeof toDb>[] = [];
    for (const q of pool) {
      if (rows.length >= max) break;
      const key = normalize(q.prompt);
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push(toDb(fromDb(q)));
    }
    return rows;
  };

  // 1. Questions pour les compétences déjà dans le test.
  const plan = questionPlan(test.skills.map((s) => s.weight), test.questionCount);
  const fills = test.skills.map((skill, i) => ({
    skill,
    rows: take(candidatesFor(skill.name), Math.max(0, plan[i].total - skill.questions.length)),
  }));
  const covered = fills.filter((f) => f.skill.questions.length + f.rows.length > 0);
  const removed = covered.length > 0 ? fills.filter((f) => !covered.includes(f)).map((f) => f.skill.name) : [];

  // 2. Pas assez de questions : on ajoute d'autres compétences du modèle le plus proche du métier.
  let total = covered.reduce((n, f) => n + f.skill.questions.length + f.rows.length, 0);
  const extra: { name: string; rows: ReturnType<typeof toDb>[] }[] = [];
  if (total < Math.max(MIN_QUESTIONS, test.questionCount)) {
    const keptNames = covered.map((f) => f.skill.name);
    const templateScore = new Map<string, number>();
    for (const b of bank) {
      const id = b.template?.id;
      if (!id) continue;
      const s = (sameJob(b.template?.profession) ? 10 : 0) + keptNames.reduce((a, n) => a + skillSimilarity(n, b.name), 0);
      templateScore.set(id, (templateScore.get(id) ?? 0) + s);
    }
    const bestTemplate = [...templateScore.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    for (const b of bank.filter((x) => x.template?.id === bestTemplate)) {
      if (total >= Math.max(MIN_QUESTIONS, test.questionCount)) break;
      if (keptNames.some((n) => skillSimilarity(n, b.name) >= MIN_SIMILARITY)) continue;
      const rows = take(b.questions.filter((q) => allowed.has(q.type as QuestionType)), 8);
      if (!rows.length) continue;
      extra.push({ name: b.name, rows });
      total += rows.length;
    }
  }

  const finalSkills = covered.length + extra.length;
  const questionCount = total >= MIN_QUESTIONS ? Math.min(test.questionCount, total) : test.questionCount;
  const weights = evenWeights(finalSkills);

  await db.$transaction(async (tx) => {
    if (removed.length) {
      await tx.skill.deleteMany({ where: { testId, id: { in: fills.filter((f) => !covered.includes(f)).map((f) => f.skill.id) } } });
    }
    // Compétences gardées : nouvelles questions + poids répartis également.
    for (const [i, f] of covered.entries()) {
      if (f.rows.length) {
        await tx.question.createMany({
          data: f.rows.map((r, k) => ({ ...r, skillId: f.skill.id, origin: "BANK" as const, position: f.skill.questions.length + k })),
        });
      }
      if (removed.length || extra.length) await tx.skill.update({ where: { id: f.skill.id }, data: { weight: weights[i], position: i } });
    }
    for (const [j, e] of extra.entries()) {
      const i = covered.length + j;
      await tx.skill.create({
        data: {
          testId,
          name: e.name,
          weight: weights[i],
          position: i,
          questions: { create: e.rows.map((r, k) => ({ ...r, origin: "BANK" as const, position: k })) },
        },
      });
    }
    if (questionCount !== test.questionCount) await tx.test.update({ where: { id: testId }, data: { questionCount } });
  });

  await splitReserve(testId, companyId, questionCount);
  return {
    added: total - test.skills.reduce((n, s) => n + s.questions.length, 0),
    removed,
    extra: extra.map((e) => e.name),
    uncovered: covered.length === 0 ? test.skills.map((s) => s.name) : [],
    questionCount,
  };
}

// Répartit questions posées / réserve selon les poids, comme pour la génération par IA,
// en garantissant au moins `questionCount` questions posées.
export async function splitReserve(testId: string, companyId: string, questionCount: number) {
  const test = await getCompanyTest(testId, companyId);
  const plan = questionPlan(test.skills.map((s) => s.weight), questionCount);
  const main: string[] = [];
  const reserve: string[] = [];
  test.skills.forEach((s, i) => s.questions.forEach((q, k) => (k < plan[i].main ? main : reserve).push(q.id)));
  // Une compétence avec peu de questions peut laisser un manque : on le comble avec la réserve.
  while (main.length < questionCount && reserve.length) main.push(reserve.shift()!);
  await db.$transaction([
    db.question.updateMany({ where: { id: { in: main } }, data: { isReserve: false } }),
    db.question.updateMany({ where: { id: { in: reserve } }, data: { isReserve: true } }),
  ]);
}
