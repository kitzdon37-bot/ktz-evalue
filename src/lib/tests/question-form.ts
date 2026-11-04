// Lecture du formulaire d'édition d'une question (éditeur du recruteur).
// Fonction pure, testée dans tests/question-form.test.ts.
import {
  choiceId,
  isAllowedImage,
  isMcq,
  LEVELS,
  RUBRIC_GRADED,
  type Level,
  type QuestionData,
  type QuestionType,
} from "./model";

export const MAX_CHOICES = 6;
export const MAX_CRITERIA = 6;
export const MAX_ORDER_ITEMS = 8;
export const MAX_CODE_TESTS = 8;

// Valeur saisie par le recruteur pour un test de code : du JSON (5, "Bangui", [1, 2], true…),
// ou, à défaut, le texte tel quel (Bangui sans guillemets devient "Bangui").
export function looseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Arguments d'un appel : « 2, 3 » ou « [1, 2, 3] » (un seul argument tableau) ou « "Bangui" ».
export function looseArgs(text: string): unknown[] {
  try {
    const v = JSON.parse(`[${text}]`);
    if (Array.isArray(v)) return v;
  } catch {
    // texte libre : un seul argument chaîne
  }
  return [text];
}

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
  const image = str(fd, "image");
  const data: QuestionData = {
    type,
    prompt: str(fd, "prompt"),
    image: isAllowedImage(image) ? image : null,
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

  if (type === "ORDERING") {
    // Les éléments sont saisis dans le BON ordre ; ils seront mélangés pour chaque candidat.
    const items = [];
    for (let i = 0; i < MAX_ORDER_ITEMS; i++) {
      const text = str(fd, `item_${i}`);
      if (text) items.push({ id: choiceId(items.length), text });
    }
    data.choices = items;
    data.correctAnswer = { order: items.map((c) => c.id) };
  }

  if (type === "CODE") {
    const tests = [];
    for (let i = 0; i < MAX_CODE_TESTS; i++) {
      const args = str(fd, `test_args_${i}`);
      const expected = str(fd, `test_expected_${i}`);
      if (!args && !expected) continue;
      tests.push({ args: looseArgs(args), expected: looseJson(expected), hidden: fd.get(`test_hidden_${i}`) === "on" });
    }
    const raw = fd.get("starter");
    data.correctAnswer = {
      code: {
        language: "javascript",
        functionName: str(fd, "functionName"),
        starter: typeof raw === "string" ? raw.replace(/\r\n/g, "\n") : "",
        tests,
      },
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
  if (type === "ORDERING") {
    return {
      type, prompt: "", image: null, explanation: null, difficulty, rubric: null,
      choices: [0, 1, 2, 3].map((i) => ({ id: choiceId(i), text: "" })),
      correctAnswer: null, suggestedTimeSec: 90, points: 2,
    };
  }
  if (type === "CODE") {
    return {
      type, prompt: "", image: null, explanation: null, difficulty, rubric: null, choices: null,
      correctAnswer: {
        code: { language: "javascript", functionName: "solution", starter: "function solution(a, b) {\n  // Votre code ici\n}\n", tests: [] },
      },
      suggestedTimeSec: 600, points: 5,
    };
  }
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
