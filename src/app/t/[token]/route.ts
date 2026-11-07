// Page de test du candidat (écrans 17, 18 et 19 du cahier des charges).
// Servie en HTML simple par une route serveur, sans React, pour rester très légère.
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  attemptOrder,
  enforceTime,
  loadInvitation,
  newDeviceId,
  questionIndex,
  startAttempt,
  submitAnswer,
  timeFactor,
  type LoadedAttempt,
  type LoadedInvitation,
} from "@/lib/candidate/attempt";
import { donePage, messagePage, questionPage, testPhoto, welcomePage } from "@/lib/candidate/views";

// La fin du test déclenche la correction par l'IA en arrière-plan.
export const maxDuration = 300;

const HTML_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  // Jamais de cache : chaque affichage reflète l'état réel du passage.
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex",
  "Referrer-Policy": "no-referrer",
};

function html(body: string, status = 200) {
  return new NextResponse(body, { status, headers: HTML_HEADERS });
}

const deviceCookie = (attemptId: string) => `ktz_d_${attemptId}`;

function closedReason(inv: LoadedInvitation): string | null {
  if (inv.status === "CANCELLED") return "Cette invitation a été annulée par le recruteur.";
  if (inv.attempt) return null; // un passage commencé peut toujours être repris ou consulté
  if (inv.test.status !== "PUBLISHED") return "Ce test n'est plus ouvert.";
  if (inv.expiresAt < new Date()) return "La date limite pour passer ce test est dépassée.";
  return null;
}

// Signale un changement d'appareil ou de navigateur pendant le test (sans bloquer le candidat).
async function checkDevice(attempt: LoadedAttempt): Promise<void> {
  const store = await cookies();
  const current = store.get(deviceCookie(attempt.id))?.value;
  if (current && current === attempt.deviceId) return;
  const deviceId = current ?? newDeviceId();
  const known = await db.integrityEvent.findFirst({
    where: { attemptId: attempt.id, type: "DEVICE_CHANGE", details: { path: ["deviceId"], equals: deviceId } },
    select: { id: true },
  });
  if (!known) {
    await db.integrityEvent.create({
      data: {
        attemptId: attempt.id,
        type: "DEVICE_CHANGE",
        occurredAt: new Date(),
        questionId: attemptOrder(attempt)[attempt.currentIndex]?.questionId ?? null,
        details: { deviceId },
      },
    });
  }
  if (!current) setDeviceCookie(store, attempt.id, deviceId);
}

function setDeviceCookie(store: Awaited<ReturnType<typeof cookies>>, attemptId: string, deviceId: string) {
  store.set(deviceCookie(attemptId), deviceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/t",
    maxAge: 60 * 60 * 24 * 30,
  });
}

function render(inv: LoadedInvitation, attempt: LoadedAttempt | null, error?: string) {
  const color = inv.company.primaryColor;
  if (!attempt) {
    const mainCount = inv.test.skills.reduce((n, s) => n + s.questions.filter((q) => !q.isReserve).length, 0);
    return html(
      welcomePage({
        token: inv.token,
        photo: testPhoto(inv.test.jobTitle, inv.test.id),
        companyName: inv.company.name,
        color,
        logoUrl: inv.company.logoUrl,
        about: { description: inv.company.description, website: inv.company.website },
        testTitle: inv.test.title,
        candidateName: inv.candidate.name,
        durationMinutes: inv.test.durationMinutes,
        questionCount: mainCount,
        extraTimePercent: inv.extraTimePercent,
        expiresAt: inv.expiresAt,
        webcam: inv.test.webcamEnabled,
        fullscreen: inv.test.requireFullscreen,
        error,
      }),
    );
  }
  const order = attemptOrder(attempt);
  if (attempt.status !== "IN_PROGRESS" || attempt.currentIndex >= order.length) {
    return html(
      donePage({
        color,
        companyName: inv.company.name,
        testTitle: inv.test.title,
        timedOut: attempt.status === "TIMED_OUT",
        score: attempt.globalScore,
        showScore: inv.test.showScoreToCandidate,
        pending: attempt.gradingStatus !== "DONE",
        contact: { email: inv.company.contactEmail, phone: inv.company.contactPhone },
      }),
    );
  }
  const drawn = order[attempt.currentIndex];
  const q = questionIndex(inv).get(drawn.questionId);
  if (!q) return html(messagePage("Erreur", "Cette question est introuvable. Contactez le recruteur.", color), 500);
  const now = Date.now();
  const qStart = (attempt.questionStartedAt ?? attempt.startedAt).getTime();
  return html(
    questionPage({
      token: inv.token,
      color,
      companyName: inv.company.name,
      logoUrl: inv.company.logoUrl,
      testTitle: inv.test.title,
      index: attempt.currentIndex + 1,
      total: order.length,
      question: { ...q.data, id: q.id },
      choiceOrder: drawn.choiceOrder,
      questionRemainingSec: Math.max(0, Math.round((qStart + q.data.suggestedTimeSec * timeFactor(inv) * 1000 - now) / 1000)),
      questionTotalSec: Math.round(q.data.suggestedTimeSec * timeFactor(inv)),
      totalRemainingSec: Math.max(0, Math.round((attempt.endsAt.getTime() - now) / 1000)),
      blockPaste: inv.test.blockPaste,
      requireFullscreen: inv.test.requireFullscreen,
    }),
  );
}

export async function GET(_req: NextRequest, ctx: RouteContext<"/t/[token]">) {
  const { token } = await ctx.params;
  const inv = await loadInvitation(token);
  if (!inv) return html(messagePage("Lien invalide", "Ce lien de test n'existe pas. Vérifiez le lien reçu."), 404);
  const reason = closedReason(inv);
  if (reason) return html(messagePage("Test indisponible", reason, inv.company.primaryColor), 410);

  if (!inv.attempt && (inv.status === "PENDING" || inv.status === "SENT")) {
    await db.invitation.update({ where: { id: inv.id }, data: { status: "OPENED" } });
  }
  let attempt = inv.attempt;
  if (attempt) {
    if (attempt.status === "IN_PROGRESS") await checkDevice(attempt);
    attempt = await enforceTime(inv, attempt);
  }
  return render(inv, attempt);
}

export async function POST(req: NextRequest, ctx: RouteContext<"/t/[token]">) {
  const { token } = await ctx.params;
  const wantsJson = req.headers.get("x-ktz") === "1";
  const done = () =>
    wantsJson
      ? NextResponse.json({ next: `/t/${token}` }, { headers: { "Cache-Control": "no-store" } })
      : NextResponse.redirect(new URL(`/t/${token}`, req.url), 303);

  const inv = await loadInvitation(token);
  if (!inv) return html(messagePage("Lien invalide", "Ce lien de test n'existe pas."), 404);
  const reason = closedReason(inv);
  if (reason) return html(messagePage("Test indisponible", reason, inv.company.primaryColor), 410);

  const form = await req.formData();
  const action = form.get("action");

  if (action === "start" && !inv.attempt) {
    if (form.get("consent") !== "1") return render(inv, null, "Cochez la case d'accord pour commencer le test.");
    if (inv.test.webcamEnabled && form.get("webcam") !== "1") {
      return render(inv, null, "Ce test demande l'accord pour les photos par la caméra.");
    }
    const deviceId = newDeviceId();
    await startAttempt(inv, {
      deviceId,
      userAgent: req.headers.get("user-agent"),
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      webcamConsent: form.get("webcam") === "1",
    });
    const fresh = await db.attempt.findUnique({ where: { invitationId: inv.id }, select: { id: true, deviceId: true } });
    if (fresh) setDeviceCookie(await cookies(), fresh.id, fresh.deviceId ?? deviceId);
    return done();
  }

  if (action === "answer" && inv.attempt) {
    const attempt = await enforceTime(inv, inv.attempt);
    await submitAnswer(inv, attempt, String(form.get("questionId") ?? ""), form);
    return done();
  }

  return done();
}
