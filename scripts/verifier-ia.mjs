// Vérifie que chaque IA configurée dans .env.local répond : Claude (Anthropic, payant),
// puis Mistral et Groq (formules gratuites, utilisées en secours pour rédiger les questions).
// Usage : node scripts/verifier-ia.mjs   (ou double-clic sur Verifier-IA.cmd)
// Envoie une toute petite demande à chacune ; n'affiche jamais les clés.
import { config } from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

config({ path: new URL("../.env.local", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"), quiet: true });

const env = (k) => process.env[k]?.trim() ?? "";
let working = 0;

async function checkClaude() {
  if (!env("ANTHROPIC_API_KEY")) return console.log("•  Claude (payant) : pas de clé ANTHROPIC_API_KEY.");
  try {
    const client = new Anthropic({ apiKey: env("ANTHROPIC_API_KEY"), maxRetries: 0, timeout: 60_000 });
    await client.messages.create({ model: "claude-opus-5-5", max_tokens: 20, messages: [{ role: "user", content: "Réponds seulement : OK" }] });
    working++;
    console.log("✓  Claude (payant) : fonctionne. Il génère les questions et corrige les réponses écrites.");
  } catch (e) {
    const msg = String(e?.error?.error?.message ?? e?.message ?? e);
    if (/credit balance is too low/i.test(msg)) console.log("✗  Claude (payant) : crédit insuffisant → console.anthropic.com, rubrique Plans & Billing.");
    else if (e?.status === 401) console.log("✗  Claude (payant) : clé refusée (invalide ou supprimée).");
    else console.log("✗  Claude (payant) :", msg.slice(0, 200));
  }
}

async function checkCompatible(label, keyVar, url, model, site) {
  if (!env(keyVar)) return console.log(`•  ${label} (gratuit) : pas de clé ${keyVar}. Créez-la sur ${site}`);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env(keyVar)}` },
      body: JSON.stringify({ model, max_tokens: 20, messages: [{ role: "user", content: "Réponds seulement : OK" }] }),
      signal: AbortSignal.timeout(60_000),
    });
    if (res.ok) {
      working++;
      return console.log(`✓  ${label} (gratuit) : fonctionne. Il génère les questions si Claude n'est pas disponible.`);
    }
    const detail = (await res.text()).slice(0, 160);
    if (res.status === 401) console.log(`✗  ${label} (gratuit) : clé refusée (invalide ou supprimée).`);
    else if (res.status === 429) console.log(`✗  ${label} (gratuit) : quota gratuit atteint pour le moment, réessayez plus tard.`);
    else console.log(`✗  ${label} (gratuit) : erreur ${res.status} ${detail}`);
  } catch (e) {
    console.log(`✗  ${label} (gratuit) : pas de réponse (${e?.message ?? e}).`);
  }
}

await checkClaude();
await checkCompatible("Mistral", "MISTRAL_API_KEY", "https://api.mistral.ai/v1/chat/completions", env("MISTRAL_MODEL") || "mistral-large-latest", "https://console.mistral.ai");
await checkCompatible("Groq", "GROQ_API_KEY", "https://api.groq.com/openai/v1/chat/completions", env("GROQ_MODEL") || "openai/gpt-oss-120b", "https://console.groq.com");
console.log("");
console.log(working > 0 ? `→ La génération de questions par IA est disponible (${working} IA en état de marche).` : "→ Aucune IA ne fonctionne pour le moment : le site utilise la banque de questions KTZ (gratuite).");
process.exit(working > 0 ? 0 : 1);
