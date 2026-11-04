import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type * as z from "zod";
import type { AiProvider, StructuredRequest, StructuredResult } from "./provider";

const MODEL = "claude-opus-5-5";
// Tarif en dollars par million de tokens (entrée / sortie).
const PRICE_IN = 4;
const PRICE_OUT = 20;

let client: Anthropic | undefined;
function getClient() {
  // maxRetries : 2 nouvelles tentatives automatiques en cas d'erreur réseau ou de surcharge.
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 2, timeout: 120_000 });
  return client;
}

export const anthropicProvider: AiProvider = {
  name: "anthropic",
  free: false,
  personalData: true,
  isConfigured: () => Boolean(process.env.ANTHROPIC_API_KEY),

  async generate<T extends z.ZodType>(req: StructuredRequest<T>): Promise<StructuredResult<z.infer<T>>> {
    const response = await getClient().beta.messages.parse({
      model: MODEL,
      max_tokens: req.maxTokens ?? 16000,
      // Si Claude refuse une demande, l'API relance automatiquement sur un autre modèle.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: betaZodOutputFormat(req.schema) },
      system: req.system,
      messages: [{ role: "user", content: req.prompt }],
    });
    if (response.stop_reason === "refusal") {
      throw new Error("La demande a été refusée par l'IA.");
    }
    if (response.stop_reason === "max_tokens") {
      throw new Error("La réponse de l'IA est incomplète (trop longue).");
    }
    if (!response.parsed_output) {
      throw new Error("La réponse de l'IA n'a pas le format attendu.");
    }
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    return {
      data: response.parsed_output as z.infer<T>,
      model: response.model,
      inputTokens,
      outputTokens,
      costMicroUsd: Math.round(inputTokens * PRICE_IN + outputTokens * PRICE_OUT),
    };
  },
};
