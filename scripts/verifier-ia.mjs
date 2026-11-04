// Vérifie que l'IA (Anthropic) répond, avec la clé de .env.local.
// Usage : node scripts/verifier-ia.mjs   (ou double-clic sur Verifier-IA.cmd)
// Envoie une toute petite demande (quelques centimes de centime) ; n'affiche jamais la clé.
import { config } from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

config({ path: new URL("../.env.local", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"), quiet: true });

const key = process.env.ANTHROPIC_API_KEY;
if (!key) {
  console.log("✗ Aucune clé Anthropic dans .env.local (ligne ANTHROPIC_API_KEY=...).");
  process.exit(1);
}

try {
  const client = new Anthropic({ apiKey: key, maxRetries: 0, timeout: 60_000 });
  const res = await client.messages.create({
    model: "claude-opus-5-5", // même modèle que le site (src/lib/ai/anthropic.ts)
    max_tokens: 20,
    messages: [{ role: "user", content: "Réponds seulement : OK" }],
  });
  const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
  console.log(`✓ L'IA fonctionne (réponse : « ${text} »). La génération par IA est disponible dans le site.`);
} catch (e) {
  const msg = String(e?.error?.error?.message ?? e?.message ?? e);
  if (/credit balance is too low/i.test(msg)) {
    console.log("✗ Crédit insuffisant sur le compte Anthropic.");
    console.log("  Ajoutez du crédit sur https://console.anthropic.com → Plans & Billing, puis relancez cette vérification.");
  } else if (e?.status === 401 || /invalid x-api-key|authentication/i.test(msg)) {
    console.log("✗ Clé refusée : elle est invalide ou a été supprimée.");
    console.log("  Créez une nouvelle clé sur https://console.anthropic.com → API Keys et mettez-la dans .env.local.");
  } else {
    console.log("✗ L'IA ne répond pas :", msg.slice(0, 300));
  }
  process.exit(1);
}
