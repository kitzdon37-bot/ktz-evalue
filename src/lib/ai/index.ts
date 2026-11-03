import "server-only";
import type * as z from "zod";
import { db } from "@/lib/db";
import type { AiOperation } from "@/generated/prisma/client";
import { anthropicProvider } from "./anthropic";
import { AiBudgetError, AiUnavailableError, type AiProvider, type StructuredRequest } from "./provider";

export { AiBudgetError, AiUnavailableError } from "./provider";

// Ordre d'essai : Claude d'abord, puis le fournisseur de secours (à ajouter ici
// quand il sera choisi ; il doit respecter la même interface AiProvider).
const PROVIDERS: AiProvider[] = [anthropicProvider];

export function isAiConfigured() {
  return PROVIDERS.some((p) => p.isConfigured());
}

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

// Plafonds de dépense : par entreprise (Company.aiMonthlyCapCents) et global
// (AI_GLOBAL_MONTHLY_CAP_USD dans .env.local).
async function checkBudget(companyId: string) {
  const since = startOfMonth();
  const [company, companySpend, globalSpend] = await Promise.all([
    db.company.findUnique({ where: { id: companyId }, select: { aiMonthlyCapCents: true } }),
    db.aiUsage.aggregate({ where: { companyId, createdAt: { gte: since } }, _sum: { estimatedCostMicro: true } }),
    db.aiUsage.aggregate({ where: { createdAt: { gte: since } }, _sum: { estimatedCostMicro: true } }),
  ]);
  const companyCapMicro = (company?.aiMonthlyCapCents ?? 0) * 10_000;
  if ((companySpend._sum.estimatedCostMicro ?? 0) >= companyCapMicro) {
    throw new AiBudgetError(
      "Votre plafond mensuel de génération par IA est atteint. Utilisez un modèle de la bibliothèque ou écrivez les questions vous-même.",
    );
  }
  // Valeur absente, vide ou invalide → 50 $ par défaut (une ligne « AI_GLOBAL_MONTHLY_CAP_USD= »
  // vide ne doit pas être lue comme un plafond de 0 $, qui bloquerait toute génération).
  const parsedCap = Number.parseFloat(process.env.AI_GLOBAL_MONTHLY_CAP_USD ?? "");
  const globalCapUsd = Number.isFinite(parsedCap) && parsedCap > 0 ? parsedCap : 50;
  if ((globalSpend._sum.estimatedCostMicro ?? 0) >= globalCapUsd * 1_000_000) {
    throw new AiBudgetError();
  }
}

// Appelle l'IA avec une sortie structurée et vérifiée (zod), enregistre la
// consommation, et passe au fournisseur suivant en cas de panne.
export async function runAi<T extends z.ZodType>(
  opts: { companyId: string; operation: AiOperation },
  req: StructuredRequest<T>,
): Promise<z.infer<T>> {
  const providers = PROVIDERS.filter((p) => p.isConfigured());
  if (providers.length === 0) {
    throw new AiUnavailableError("L'IA n'est pas encore configurée (clé ANTHROPIC_API_KEY manquante).");
  }
  await checkBudget(opts.companyId);

  for (const provider of providers) {
    const started = Date.now();
    try {
      const result = await provider.generate(req);
      await db.aiUsage.create({
        data: {
          companyId: opts.companyId,
          operation: opts.operation,
          provider: provider.name,
          model: result.model,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          estimatedCostMicro: result.costMicroUsd,
          success: true,
          durationMs: Date.now() - started,
        },
      });
      return result.data;
    } catch (e) {
      console.error(`[ia] échec ${provider.name}`, e);
      await db.aiUsage.create({
        data: {
          companyId: opts.companyId,
          operation: opts.operation,
          provider: provider.name,
          model: "inconnu",
          estimatedCostMicro: 0,
          success: false,
          error: e instanceof Error ? e.message.slice(0, 500) : "erreur inconnue",
          durationMs: Date.now() - started,
        },
      });
    }
  }
  throw new AiUnavailableError();
}
