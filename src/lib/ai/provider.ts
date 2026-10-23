import type * as z from "zod";

// Interface commune à tous les fournisseurs d'IA (Claude, et le fournisseur de
// secours qui sera choisi plus tard : voir question ouverte n°5 du cahier).
export type StructuredRequest<T extends z.ZodType> = {
  system: string;
  prompt: string;
  schema: T;
  maxTokens?: number;
};

export type StructuredResult<T> = {
  data: T;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costMicroUsd: number; // coût estimé en millionièmes de dollar
};

export interface AiProvider {
  name: string;
  isConfigured(): boolean;
  generate<T extends z.ZodType>(req: StructuredRequest<T>): Promise<StructuredResult<z.infer<T>>>;
}

export class AiUnavailableError extends Error {
  constructor(message = "L'IA est momentanément indisponible.") {
    super(message);
    this.name = "AiUnavailableError";
  }
}

export class AiBudgetError extends Error {
  constructor(message = "Le plafond de dépense IA est atteint.") {
    super(message);
    this.name = "AiBudgetError";
  }
}
