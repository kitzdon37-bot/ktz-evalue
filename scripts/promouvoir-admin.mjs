// Donne (ou retire) l'accès à l'espace administrateur /admin à un compte existant.
// Utilisation :  node scripts/promouvoir-admin.mjs email@exemple.com        (donner)
//                node scripts/promouvoir-admin.mjs email@exemple.com --retirer
// La base utilisée est celle de DATABASE_URL (.env.local en local).
import { config } from "dotenv";
import pg from "pg";

config({ path: process.env.DOTENV_CONFIG_PATH ?? ".env.local", quiet: true });

const email = (process.argv[2] ?? "").trim().toLowerCase();
const remove = process.argv.includes("--retirer");
if (!email.includes("@")) {
  console.error("Indiquez l'adresse email du compte. Exemple : node scripts/promouvoir-admin.mjs moi@exemple.com");
  process.exit(1);
}
const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
const r = await c.query(`update "User" set "isPlatformAdmin" = $2 where email = $1 and "deletedAt" is null returning name`, [email, !remove]);
await c.end();
if (r.rowCount === 0) {
  console.error(`Aucun compte avec l'adresse ${email}. Créez d'abord le compte (inscription ou Google).`);
  process.exit(1);
}
console.log(remove ? `${r.rows[0].name} n'est plus administrateur.` : `${r.rows[0].name} est maintenant administrateur : espace /admin.`);
