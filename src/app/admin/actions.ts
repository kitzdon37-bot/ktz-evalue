"use server";

import { refresh } from "next/cache";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/admin";

// Déconnecte une personne de tous ses appareils (en cas de doute sur un accès).
export async function revokeSessions(userId: string) {
  const admin = await requirePlatformAdmin();
  if (userId === admin.id) return; // on ne se déconnecte pas soi-même par erreur
  await db.session.deleteMany({ where: { userId } });
  refresh();
}

// Ferme une seule session (un appareil).
export async function revokeSession(sessionId: string) {
  await requirePlatformAdmin();
  await db.session.deleteMany({ where: { id: sessionId } });
  refresh();
}
