// Remplit la bibliothèque de modèles de tests. Sans effet sur les modèles déjà présents
// (repérés par leur titre). Usage : npx prisma db seed
import { config } from "dotenv";
import pg from "pg";
import { randomBytes } from "node:crypto";
import { TEMPLATES as BASE_TEMPLATES } from "./templates.mjs";
import { TEMPLATES_2 } from "./templates-2.mjs";

const TEMPLATES = [...BASE_TEMPLATES, ...TEMPLATES_2];

config({ path: ".env.local", quiet: true });

const id = () => "c" + randomBytes(12).toString("hex");
const letter = (i) => String.fromCharCode(97 + i);

function toRow(q) {
  const base = { choices: null, correctAnswer: null, rubric: null };
  if (q.type === "MCQ_SINGLE" || q.type === "MCQ_MULTI") {
    base.choices = q.choices.map((text, i) => ({ id: letter(i), text }));
    const answers = Array.isArray(q.answer) ? q.answer : [q.answer];
    base.correctAnswer = { choiceIds: answers.map(letter) };
  } else if (q.type === "TRUE_FALSE") {
    base.correctAnswer = { value: q.answer };
  } else if (q.type === "SHORT_ANSWER") {
    base.correctAnswer = q.answer;
  } else {
    base.rubric = { criteria: q.rubric.map(([label, points]) => ({ label, points })), example: q.example ?? null };
  }
  return base;
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
let created = 0;
try {
  for (const t of TEMPLATES) {
    const exists = await client.query('SELECT 1 FROM "Template" WHERE title = $1', [t.title]);
    if (exists.rowCount) continue;
    await client.query("BEGIN");
    const templateId = id();
    await client.query(
      'INSERT INTO "Template" (id, profession, title, description, level, language) VALUES ($1, $2, $3, $4, $5, $6)',
      [templateId, t.profession, t.title, t.description, t.level, "FR"],
    );
    for (const [si, s] of t.skills.entries()) {
      const skillId = id();
      await client.query('INSERT INTO "Skill" (id, "templateId", name, weight, position) VALUES ($1, $2, $3, $4, $5)', [
        skillId,
        templateId,
        s.name,
        s.weight,
        si,
      ]);
      for (const [qi, q] of s.questions.entries()) {
        const row = toRow(q);
        await client.query(
          `INSERT INTO "Question" (id, "skillId", type, prompt, choices, "correctAnswer", rubric, explanation, difficulty, "suggestedTimeSec", points, origin, position)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'BANK', $12)`,
          [
            id(),
            skillId,
            q.type,
            q.prompt,
            row.choices && JSON.stringify(row.choices),
            row.correctAnswer && JSON.stringify(row.correctAnswer),
            row.rubric && JSON.stringify(row.rubric),
            q.explanation,
            t.level,
            q.time,
            q.points,
            qi,
          ],
        );
      }
    }
    await client.query("COMMIT");
    created++;
  }
  console.log(`Bibliothèque : ${created} modèle(s) ajouté(s), ${TEMPLATES.length - created} déjà présent(s).`);
} catch (e) {
  await client.query("ROLLBACK");
  throw e;
} finally {
  await client.end();
}
