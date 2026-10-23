// Tâche planifiée lancée toutes les heures par Vercel (voir vercel.json).
import { NextResponse, type NextRequest } from "next/server";
import { closeAbandonedAttempts, expireInvitations, sendReminders } from "@/lib/jobs/hourly";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  // Vercel envoie « Authorization: Bearer <CRON_SECRET> » : personne d'autre ne peut lancer la tâche.
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const result = {
    abandoned: await closeAbandonedAttempts(),
    expired: await expireInvitations(),
    reminders: await sendReminders(),
  };
  return NextResponse.json(result);
}
