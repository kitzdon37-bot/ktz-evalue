import "server-only";
import { requireUser, type CurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export type CompanyUser = CurrentUser & { companyId: string; companyName: string };

// Règle de sécurité n°1 : toute lecture ou écriture de données d'entreprise
// passe par requireCompany(), et chaque requête filtre sur le companyId renvoyé.
// On ne fait jamais confiance à un identifiant d'entreprise envoyé par le navigateur.
export async function requireCompany(): Promise<CompanyUser> {
  const user = await requireUser();
  if (!user.companyId || !user.companyName) redirect("/connexion");
  return { ...user, companyId: user.companyId, companyName: user.companyName };
}

export function canEdit(user: CurrentUser) {
  return user.role === "OWNER" || user.role === "RECRUITER";
}

// Propriétaire ou recruteur : peut créer et modifier les tests.
export async function requireEditor(): Promise<CompanyUser> {
  const user = await requireCompany();
  if (!canEdit(user)) throw new Error("Votre rôle (lecteur) ne permet pas de modifier les données.");
  return user;
}

// Propriétaire uniquement : fiche entreprise, équipe, abonnement.
export async function requireOwner(): Promise<CompanyUser> {
  const user = await requireCompany();
  if (user.role !== "OWNER") throw new Error("Seul le propriétaire du compte peut faire cette action.");
  return user;
}
