// Configuration de Prisma (outil qui gère la base de données).
// Les adresses de connexion sont lues dans .env.local, jamais écrites ici.
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local", quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Modèles de la bibliothèque de tests.
    seed: "node prisma/seed/seed.mjs",
  },
  datasource: {
    // Les migrations passent par la connexion directe (DIRECT_URL) ;
    // le site, lui, utilise la connexion mutualisée (DATABASE_URL, voir src/lib/db.ts).
    // Neon (via Vercel) fournit la connexion directe sous le nom DATABASE_URL_UNPOOLED.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
    // Base temporaire pour préparer les migrations (en local seulement).
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
