import "server-only";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "@/lib/auth/session";

// Espace administrateur de la plateforme (équipe KTZ) : réservé aux comptes « isPlatformAdmin ».
// Pour les autres, la page n'existe pas (404) : on ne révèle pas l'existence de l'espace.
export async function requirePlatformAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  if (!user.isPlatformAdmin) notFound();
  return user;
}

/** Une session est « en ligne » si elle a eu de l'activité dans les 5 dernières minutes. */
export const ONLINE_MS = 5 * 60 * 1000;

export function timeAgo(d: Date, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - d.getTime()) / 1000));
  if (s < 60) return "à l'instant";
  const m = Math.round(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.round(h / 24);
  if (j < 31) return `il y a ${j} j`;
  return d.toLocaleDateString("fr-FR", { timeZone: "Africa/Bangui" });
}

export function formatDateTime(d: Date): string {
  return d.toLocaleString("fr-FR", { timeZone: "Africa/Bangui", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** Heure actuelle pour les pages d'administration (rendues côté serveur, à chaque visite). */
export function nowMs(): number {
  return Date.now();
}
