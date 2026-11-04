// Tirage des questions d'un candidat : chaque candidat reçoit une version
// différente (questions tirées dans la réserve, ordre des questions et des choix mélangé).
// Fonction pure, testée dans tests/candidate.test.ts.

export type DrawSkill = {
  /** alwaysShuffle : éléments à remettre dans l'ordre, toujours mélangés (jamais dans le bon ordre). */
  questions: { id: string; isReserve: boolean; choiceIds: string[] | null; alwaysShuffle?: boolean }[];
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

// Mélange garanti différent de l'ordre d'origine (s'il y a au moins 2 éléments).
function scramble(ids: string[], random: () => number): string[] {
  if (ids.length < 2) return [...ids];
  for (let i = 0; i < 8; i++) {
    const s = shuffle(ids, random);
    if (s.some((id, k) => id !== ids[k])) return s;
  }
  return [...ids.slice(1), ids[0]];
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
    choiceOrder: q.choiceIds
      ? q.alwaysShuffle
        ? scramble(q.choiceIds, random)
        : opts.shuffleChoices
          ? shuffle(q.choiceIds, random)
          : q.choiceIds
      : null,
  }));
}
