// Lecture du formulaire d'édition d'une question (éditeur du recruteur).
// Fonction pure, testée dans tests/question-form.test.ts.
import {
  choiceId,
  isMcq,
  LEVELS,
  RUBRIC_GRADED,
  type Level,
  type QuestionData,
  type QuestionType,
} from "./model";

export const MAX_CHOICES = 6;
export const MAX_CRITERIA = 6;

function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function int(fd: FormData, key: string, fallback: number) {
  const n = Number.parseInt(str(fd, key), 10);
  return Number.isFinite(n) ? n : fallback;
}

export function parseQuestionForm(type: QuestionType, fd: FormData): QuestionData {
  const difficulty = str(fd, "difficulty") as Level;
  const data: QuestionData = {
    type,
    prompt: str(fd, "prompt"),
    choices: null,
    correctAnswer: null,
    rubric: null,
    explanation: str(fd, "explanation") || null,
    difficulty: LEVELS.includes(difficulty) ? difficulty : "CONFIRMED",
    suggestedTimeSec: int(fd, "suggestedTimeSec", 60),
    points: int(fd, "points", 1),
  };

  if (isMcq(type)) {
    const choices = [];
    const correct: string[] = [];
    const single = str(fd, "correct");
    for (let i = 0; i < MAX_CHOICES; i++) {
      const text = str(fd, `choice_${i}`);
      if (!text) continue;
      // Les identifiants sont renumérotés pour rester a, b, c… sans trou.
      const id = choiceId(choices.length);
      choices.push({ id, text });
      const isCorrect = type === "MCQ_SINGLE" ? single === String(i) : fd.get(`correct_${i}`) === "on";
      if (isCorrect) correct.push(id);
    }
    data.choices = choices;
    data.correctAnswer = { choiceIds: correct };
  }

  if (type === "TRUE_FALSE") {
    const tf = str(fd, "tf");
    data.correctAnswer = tf === "true" ? { value: true } : tf === "false" ? { value: false } : null;
  }

  if (type === "SHORT_ANSWER") {
    const tolerance = Number.parseFloat(str(fd, "tolerance").replace(",", "."));
    data.correctAnswer = {
      value: str(fd, "expected"),
      tolerance: Number.isFinite(tolerance) && tolerance >= 0 ? tolerance : null,
    };
  }

  if (RUBRIC_GRADED.includes(type)) {
    const criteria = [];
    for (let i = 0; i < MAX_CRITERIA; i++) {
      const label = str(fd, `criterion_${i}`);
      if (!label) continue;
      criteria.push({ label, points: Math.max(0, int(fd, `criterion_points_${i}`, 1)) });
    }
    data.rubric = { criteria, example: str(fd, "example") || null };
  }

  return data;
}

// Question vide créée par « Ajouter une question ».
export function blankQuestion(type: QuestionType, difficulty: Level): QuestionData {
  const open = RUBRIC_GRADED.includes(type);
  return {
    type,
    prompt: "",
    choices: isMcq(type) ? [0, 1, 2, 3].map((i) => ({ id: choiceId(i), text: "" })) : null,
    correctAnswer: null,
    rubric: open ? { criteria: [], example: null } : null,
    explanation: null,
    difficulty,
    suggestedTimeSec: open ? (type === "ORAL" ? 90 : 300) : type === "SHORT_ANSWER" ? 120 : 60,
    points: open ? 5 : 1,
  };
}
