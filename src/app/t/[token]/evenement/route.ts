// Réception des signaux anti-triche envoyés par la page du candidat
// (sortie d'onglet, collage, sortie du plein écran).
import { NextResponse, type NextRequest } from "next/server";
import * as z from "zod";
import { db } from "@/lib/db";
import { attemptOrder } from "@/lib/candidate/attempt";

const EventSchema = z.object({
  type: z.enum(["TAB_HIDDEN", "PASTE", "FULLSCREEN_EXIT"]),
  questionId: z.string().max(40).nullable().optional(),
  durationMs: z.number().int().min(0).max(24 * 3600 * 1000).nullable().optional(),
});

// Limite par passage, pour éviter qu'un script ne remplisse la base.
const MAX_EVENTS = 300;

export async function POST(req: NextRequest, ctx: RouteContext<"/t/[token]/evenement">) {
  const { token } = await ctx.params;
  const parsed = EventSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 400 });

  const invitation = await db.invitation.findUnique({
    where: { token },
    select: {
      attempt: { select: { id: true, status: true, questionOrder: true, _count: { select: { integrityEvents: true } } } },
    },
  });
  const attempt = invitation?.attempt;
  if (!attempt || attempt.status !== "IN_PROGRESS" || attempt._count.integrityEvents >= MAX_EVENTS) {
    return new NextResponse(null, { status: 204 });
  }
  // On ne garde l'identifiant de question que s'il fait bien partie de ce passage.
  const questionId = attemptOrder(attempt).some((o) => o.questionId === parsed.data.questionId)
    ? parsed.data.questionId
    : null;
  await db.integrityEvent.create({
    data: {
      attemptId: attempt.id,
      type: parsed.data.type,
      questionId,
      durationMs: parsed.data.durationMs ?? null,
      occurredAt: new Date(),
    },
  });
  return new NextResponse(null, { status: 204 });
}
