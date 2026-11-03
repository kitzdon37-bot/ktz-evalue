// Aperçu réel du test pour le recruteur : les mêmes pages que le candidat (accueil, une
// question à la fois, chronomètre, page de fin), dans un onglet à part. Rien n'est enregistré.
// ?q=0 (ou absent) : accueil · ?q=1…n : questions · ?q=n+1 : fin.
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireCompany } from "@/lib/tenant";
import { getCompanyTest, fromDb } from "@/lib/tests/repository";
import { donePage, messagePage, previewBanner, questionPage, welcomePage } from "@/lib/candidate/views";

const HEADERS = { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

export async function GET(req: NextRequest, ctx: RouteContext<"/tests/[id]/apercu/candidat">) {
  const { id } = await ctx.params;
  const user = await requireCompany();
  const test = await getCompanyTest(id, user.companyId);
  const company = await db.company.findUniqueOrThrow({
    where: { id: user.companyId },
    select: { name: true, primaryColor: true, logoUrl: true },
  });

  // Questions posées (hors réserve), dans l'ordre des compétences.
  const questions = test.skills.flatMap((s) => s.questions.filter((q) => !q.isReserve));
  const base = `/tests/${id}/apercu/candidat`;
  const banner = previewBanner(base);
  const raw = Number.parseInt(req.nextUrl.searchParams.get("q") ?? "0", 10);
  const step = Number.isFinite(raw) ? Math.max(0, Math.min(raw, questions.length + 1)) : 0;

  if (questions.length === 0) {
    return new NextResponse(messagePage("Aperçu indisponible", "Ce test n'a pas encore de questions.", company.primaryColor), { headers: HEADERS });
  }

  let html: string;
  if (step === 0) {
    html = welcomePage({
      token: "apercu",
      companyName: company.name,
      color: company.primaryColor,
      logoUrl: company.logoUrl,
      testTitle: test.title,
      candidateName: "Candidat",
      durationMinutes: test.durationMinutes,
      questionCount: questions.length,
      extraTimePercent: 0,
      expiresAt: test.deadline ?? new Date(Date.now() + 14 * 24 * 3600 * 1000),
      webcam: test.webcamEnabled,
      fullscreen: test.requireFullscreen,
      preview: { startUrl: `${base}?q=1`, banner },
    });
  } else if (step <= questions.length) {
    const q = questions[step - 1];
    const data = fromDb(q);
    // Temps restant du test estimé à partir des questions déjà « passées » dans l'aperçu.
    const elapsed = questions.slice(0, step - 1).reduce((n, x) => n + x.suggestedTimeSec, 0);
    html = questionPage({
      token: "apercu",
      color: company.primaryColor,
      companyName: company.name,
      testTitle: test.title,
      index: step,
      total: questions.length,
      question: { ...data, id: q.id },
      choiceOrder: data.choices?.map((c) => c.id) ?? null,
      questionRemainingSec: data.suggestedTimeSec,
      questionTotalSec: data.suggestedTimeSec,
      totalRemainingSec: Math.max(60, test.durationMinutes * 60 - elapsed),
      blockPaste: test.blockPaste,
      requireFullscreen: false,
      preview: { nextUrl: `${base}?q=${step + 1}`, banner },
    });
  } else {
    html = donePage({
      color: company.primaryColor,
      companyName: company.name,
      testTitle: test.title,
      timedOut: false,
      score: test.showScoreToCandidate ? 78 : null,
      showScore: test.showScoreToCandidate,
      pending: false,
      banner,
    });
  }
  return new NextResponse(html, { headers: HEADERS });
}
