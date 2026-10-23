// Tirage des questions d'un candidat : chaque candidat reçoit une version
// différente (questions tirées dans la réserve, ordre des questions et des choix mélangé).
// Fonction pure, testée dans tests/candidate.test.ts.

export type DrawSkill = {
  questions: { id: string; isReserve: boolean; choiceIds: string[] | null }[];
};

export type DrawnQuestion = { questionId: string; choiceOrder: string[] | null };

function shuffle<T>(list: T[], random: () => number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function drawQuestions(
  skills: DrawSkill[],
  opts: { shuffleQuestions: boolean; shuffleChoices: boolean },
  random: () => number = Math.random,
): DrawnQuestion[] {
  const picked: DrawSkill["questions"] = [];
  for (const skill of skills) {
    // Chaque compétence garde le nombre de questions choisi par le recruteur (hors réserve).
    const mainCount = skill.questions.filter((q) => !q.isReserve).length;
    if (opts.shuffleQuestions) {
      picked.push(...shuffle(skill.questions, random).slice(0, mainCount));
    } else {
      picked.push(...skill.questions.filter((q) => !q.isReserve));
    }
  }
  const ordered = opts.shuffleQuestions ? shuffle(picked, random) : picked;
  return ordered.map((q) => ({
    questionId: q.id,
    choiceOrder: q.choiceIds ? (opts.shuffleChoices ? shuffle(q.choiceIds, random) : q.choiceIds) : null,
  }));
}
