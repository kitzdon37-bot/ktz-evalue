// Configuration de Prisma (outil qui gère la base de données).
// Les adresses de connexion sont lues dans .env.local, jamais écrites ici.
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local", quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Les migrations passent par la connexion directe (DIRECT_URL) ;
    // le site, lui, utilise la connexion mutualisée (DATABASE_URL, voir src/lib/db.ts).
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
