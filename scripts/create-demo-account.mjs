// Crée le compte de démonstration dans la base LOCALE, à partir de
// DEMO_EMAIL et DEMO_PASSWORD lus dans .env.local (rien n'est affiché).
// Usage : node scripts/create-demo-account.mjs
import { config } from "dotenv";
import { hash } from "@node-rs/argon2";
import pg from "pg";
import { randomBytes } from "node:crypto";

config({ path: ".env.local", quiet: true });

const { DATABASE_URL, DEMO_EMAIL, DEMO_PASSWORD } = process.env;
if (!DATABASE_URL || !DEMO_EMAIL || !DEMO_PASSWORD) {
  console.error("DATABASE_URL, DEMO_EMAIL et DEMO_PASSWORD doivent être remplis dans .env.local.");
  process.exit(1);
}
if (!/localhost|127\.0\.0\.1/.test(DATABASE_URL)) {
  console.error("Refusé : ce script ne s'utilise que sur une base locale.");
  process.exit(1);
}

const id = () => "demo" + randomBytes(10).toString("hex");
const client = new pg.Client({ connectionString: DATABASE_URL });
await client.connect();
try {
  const existing = await client.query('SELECT id FROM "User" WHERE email = $1', [DEMO_EMAIL]);
  if (existing.rowCount) {
    console.log("Le compte de démonstration existe déjà.");
  } else {
    const passwordHash = await hash(DEMO_PASSWORD, { memoryCost: 19456, timeCost: 2, parallelism: 1 });
    const companyId = id();
    await client.query("BEGIN");
    await client.query('INSERT INTO "Company" (id, name) VALUES ($1, $2)', [companyId, "Entreprise Démo"]);
    await client.query(
      'INSERT INTO "User" (id, email, "passwordHash", name, role, "companyId", "emailVerifiedAt") VALUES ($1, $2, $3, $4, $5, $6, now())',
      [id(), DEMO_EMAIL, passwordHash, "Compte Démo", "OWNER", companyId],
    );
    await client.query("COMMIT");
    console.log("Compte de démonstration créé.");
  }
} finally {
  await client.end();
}
