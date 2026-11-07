import "server-only";
import { db } from "@/lib/db";
import { sendCandidateMessage } from "@/lib/messages";
import { finishAttempt, loadInvitation } from "@/lib/candidate/attempt";

// Nombre maximal d'éléments traités par passage, pour rester court (limite de calcul serveur).
const BATCH = 100;

// Relances automatiques (par exemple 48 h puis 24 h avant la date limite)
// pour les candidats qui n'ont pas commencé le test.
export async function sendReminders(now = new Date()) {
  const candidates = await db.invitation.findMany({
    where: {
      status: { in: ["SENT", "OPENED"] },
      expiresAt: { gt: now },
      test: { status: "PUBLISHED", deadline: { not: null } },
    },
    include: { test: { select: { deadline: true, reminderHours: true } }, candidate: { select: { email: true, phone: true } } },
    take: 500,
  });
  let sent = 0;
  for (const inv of candidates) {
    if (sent >= BATCH) break;
    const hours = [...inv.test.reminderHours].sort((a, b) => b - a); // ex. [48, 24]
    // Nombre de relances qui auraient dû partir à cette heure-ci.
    const due = hours.filter((h) => now.getTime() >= inv.test.deadline!.getTime() - h * 3600_000).length;
    // Une relance au plus toutes les 12 h, même si le recruteur en a envoyé une à la main.
    const recent = inv.lastReminderAt && now.getTime() - inv.lastReminderAt.getTime() < 12 * 3600_000;
    if (due > inv.remindersSent && !recent) {
      const channels: ("EMAIL" | "WHATSAPP")[] = [];
      if (inv.candidate.email) channels.push("EMAIL");
      if (inv.candidate.phone) channels.push("WHATSAPP");
      await sendCandidateMessage(inv.id, "relance", channels);
      sent++;
    }
  }
  return sent;
}

// Liens expirés : les invitations non commencées passent à « Expirée ».
export async function expireInvitations(now = new Date()) {
  const { count } = await db.invitation.updateMany({
    where: { status: { in: ["PENDING", "SENT", "OPENED"] }, expiresAt: { lt: now } },
    data: { status: "EXPIRED" },
  });
  return count;
}

// Tests abandonnés : chronomètre global écoulé sans que le candidat revienne.
export async function closeAbandonedAttempts(now = new Date()) {
  const attempts = await db.attempt.findMany({
    where: { status: "IN_PROGRESS", endsAt: { lt: new Date(now.getTime() - 5 * 60_000) } },
    select: { id: true, invitation: { select: { token: true } } },
    take: BATCH,
  });
  for (const a of attempts) {
    const inv = await loadInvitation(a.invitation.token);
    if (inv) await finishAttempt(inv, a.id, "TIMED_OUT");
  }
  return attempts.length;
}

// Journal des connexions et sessions expirées : on ne garde pas les données plus longtemps que nécessaire.
export const LOGIN_LOG_MONTHS = 12;
export async function pruneLoginData(now = new Date()) {
  const limit = new Date(now);
  limit.setMonth(limit.getMonth() - LOGIN_LOG_MONTHS);
  const [events, sessions] = await Promise.all([
    db.loginEvent.deleteMany({ where: { createdAt: { lt: limit } } }),
    db.session.deleteMany({ where: { expiresAt: { lt: now } } }),
  ]);
  return { events: events.count, sessions: sessions.count };
}
