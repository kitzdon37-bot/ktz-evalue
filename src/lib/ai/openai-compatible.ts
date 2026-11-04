import "server-only";
import * as z from "zod";
import type { AiProvider, StructuredRequest, StructuredResult } from "./provider";

// Fournisseurs d'IA « compatibles OpenAI » (même format d'appel) : Mistral, Groq, et d'autres
// (Cerebras, OpenRouter…) si besoin. Utilisés gratuitement, en secours de Claude, uniquement
// pour rédiger des questions : leurs formules gratuites peuvent réutiliser les données envoyées,
// donc aucune réponse de candidat ne leur est transmise (personalData: false).

type Config = {
  name: string;
  /** Variable de .env.local qui contient la clé. */
  keyVar: string;
  baseUrl: string;
  /** Modèle par défaut, remplaçable par une variable de .env.local (ex. MISTRAL_MODEL). */
  model: string;
  modelVar: string;
};

const TIMEOUT_MS = 120_000;
const MAX_RATE_RETRIES = 3;
const MAX_WAIT_MS = 35_000;

// Délai demandé par le service avant de réessayer (en-tête Retry-After, ou message
// « Please try again in 10.9s » / « in 1m2.5s »), avec une petite marge. null si inconnu.
export function retryDelayMs(retryAfter: string | null, body: string): number | null {
  const header = Number.parseFloat(retryAfter ?? "");
  if (Number.isFinite(header) && header >= 0) return Math.ceil(header * 1000) + 500;
  const m = body.match(/try again in (?:(\d+)m)?([\d.]+)s/i);
  if (m) return Math.ceil((Number(m[1] ?? 0) * 60 + Number(m[2])) * 1000) + 500;
  return null;
}

// Extrait l'objet JSON d'une réponse (avec ou sans bloc ```json).
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced ? fenced[1] : text).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("La réponse de l'IA ne contient pas de JSON.");
  return JSON.parse(raw.slice(start, end + 1));
}

export function openAiCompatibleProvider(cfg: Config): AiProvider {
  const model = () => process.env[cfg.modelVar]?.trim() || cfg.model;

  async function call(system: string, prompt: string, maxTokens: number) {
    let res: Response | undefined;
    for (let attempt = 0; attempt <= MAX_RATE_RETRIES; attempt++) {
      res = await fetch(`${cfg.baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env[cfg.keyVar]}` },
        body: JSON.stringify({
          model: model(),
          temperature: 0.4,
          max_tokens: maxTokens,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      // Limite par minute de la formule gratuite : on patiente le temps indiqué, puis on réessaie.
      if (res.status !== 429 || attempt === MAX_RATE_RETRIES) break;
      const wait = retryDelayMs(res.headers.get("retry-after"), await res.clone().text());
      if (wait === null || wait > MAX_WAIT_MS) break;
      await new Promise((r) => setTimeout(r, wait));
    }
    if (!res) throw new Error(`${cfg.name} : pas de réponse.`);
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      throw new Error(`${cfg.name} : erreur ${res.status} ${detail}`);
    }
    const body = (await res.json()) as {
      model?: string;
      choices?: { message?: { content?: string }; finish_reason?: string }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const choice = body.choices?.[0];
    if (choice?.finish_reason === "length") throw new Error(`${cfg.name} : réponse incomplète (trop longue).`);
    return {
      text: choice?.message?.content ?? "",
      model: body.model ?? model(),
      inputTokens: body.usage?.prompt_tokens ?? 0,
      outputTokens: body.usage?.completion_tokens ?? 0,
    };
  }

  return {
    name: cfg.name,
    free: true,
    personalData: false,
    isConfigured: () => Boolean(process.env[cfg.keyVar]?.trim()),

    async generate<T extends z.ZodType>(req: StructuredRequest<T>): Promise<StructuredResult<z.infer<T>>> {
      // Le format attendu est décrit par un schéma JSON, puis la réponse est vérifiée (zod).
      const schema = JSON.stringify(z.toJSONSchema(req.schema));
      const system = `${req.system}\n\nRéponds UNIQUEMENT avec un objet JSON valide, sans texte autour, conforme à ce schéma JSON :\n${schema}`;
      const maxTokens = Math.min(req.maxTokens ?? 8000, 8000);

      let prompt = req.prompt;
      let tokensIn = 0;
      let tokensOut = 0;
      for (let attempt = 0; attempt < 2; attempt++) {
        const r = await call(system, prompt, maxTokens);
        tokensIn += r.inputTokens;
        tokensOut += r.outputTokens;
        let problem: string;
        try {
          const parsed = req.schema.safeParse(extractJson(r.text));
          if (parsed.success) {
            return { data: parsed.data as z.infer<T>, model: r.model, inputTokens: tokensIn, outputTokens: tokensOut, costMicroUsd: 0 };
          }
          problem = parsed.error.issues.slice(0, 5).map((i) => `${i.path.join(".")} : ${i.message}`).join(" ; ");
        } catch (e) {
          problem = e instanceof Error ? e.message : "JSON illisible";
        }
        // Une seconde chance, en signalant ce qui n'allait pas.
        prompt = `${req.prompt}\n\nTa réponse précédente ne respectait pas le format (${problem}). Recommence en respectant exactement le schéma JSON.`;
      }
      throw new Error(`${cfg.name} : la réponse n'a pas le format attendu.`);
    },
  };
}

export const mistralProvider = openAiCompatibleProvider({
  name: "mistral",
  keyVar: "MISTRAL_API_KEY",
  baseUrl: "https://api.mistral.ai/v1",
  model: "mistral-large-latest",
  modelVar: "MISTRAL_MODEL",
});

export const groqProvider = openAiCompatibleProvider({
  name: "groq",
  keyVar: "GROQ_API_KEY",
  baseUrl: "https://api.groq.com/openai/v1",
  model: "openai/gpt-oss-120b",
  modelVar: "GROQ_MODEL",
});
