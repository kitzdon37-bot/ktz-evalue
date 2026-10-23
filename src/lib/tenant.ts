import "server-only";
import { requireUser, type CurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

// Règle de sécurité n°1 : toute lecture ou écriture de données d'entreprise
// passe par requireCompany(), et chaque requête filtre sur le companyId renvoyé.
// On ne fait jamais confiance à un identifiant d'entreprise envoyé par le navigateur.
export async function requireCompany(): Promise<CurrentUser & { companyId: string; companyName: string }> {
  const user = await requireUser();
  if (!user.companyId || !user.companyName) redirect("/connexion");
  return { ...user, companyId: user.companyId, companyName: user.companyName };
}
