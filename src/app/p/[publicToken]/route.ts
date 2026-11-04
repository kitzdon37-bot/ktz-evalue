// Lien public d'un test : à coller dans une offre ou sur WhatsApp.
// Le candidat donne son nom et son email ou téléphone, puis passe le test.
import { NextResponse, type NextRequest } from "next/server";
import * as z from "zod";
import { db } from "@/lib/db";
import { createInvitation } from "@/lib/invitations";
import { normalizePhone } from "@/lib/phone";
import { sendCandidateMessage } from "@/lib/messages";
import { messagePage, publicSignupPage, testPhoto } from "@/lib/candidate/views";

const HTML_HEADERS = { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
const html = (body: string, status = 200) => new NextResponse(body, { status, headers: HTML_HEADERS });

async function loadTest(publicToken: string) {
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(publicToken)) return null;
  return db.test.findUnique({
    where: { publicToken },
    select: {
      id: true,
      title: true,
      jobTitle: true,
      status: true,
      deadline: true,
      durationMinutes: true,
      publicMaxAttempts: true,
      companyId: true,
      company: { select: { name: true, primaryColor: true, country: true } },
    },
  });
}

type PublicTest = NonNullable<Awaited<ReturnType<typeof loadTest>>>;

async function unavailable(test: PublicTest | null): Promise<string | null> {
  if (!test) return "Ce lien de test n'existe pas.";
  if (test.status !== "PUBLISHED") return "Ce test n'est plus ouvert.";
  if (test.deadline && test.deadline < new Date()) return "La date limite pour passer ce test est dépassée.";
  if (test.publicMaxAttempts) {
    const used = await db.invitation.count({ where: { testId: test.id, channel: "PUBLIC_LINK" } });
    if (used >= test.publicMaxAttempts) return "Le nombre maximal de candidats pour ce test est atteint.";
  }
  return null;
}

export async function GET(_req: NextRequest, ctx: RouteContext<"/p/[publicToken]">) {
  const { publicToken } = await ctx.params;
  const test = await loadTest(publicToken);
  const reason = await unavailable(test);
  if (reason || !test) return html(messagePage("Test indisponible", reason ?? ""), 410);
  return html(
    publicSignupPage({
      publicToken,
      photo: testPhoto(test.jobTitle, test.id),
      color: test.company.primaryColor,
      companyName: test.company.name,
      testTitle: test.title,
      durationMinutes: test.durationMinutes,
    }),
  );
}

const SignupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().max(200),
  phone: z.string().trim().max(30),
});

export async function POST(req: NextRequest, ctx: RouteContext<"/p/[publicToken]">) {
  const { publicToken } = await ctx.params;
  const test = await loadTest(publicToken);
  const reason = await unavailable(test);
  if (reason || !test) return html(messagePage("Test indisponible", reason ?? ""), 410);

  const form = await req.formData();
  const values = {
    name: String(form.get("name") ?? ""),
    email: String(form.get("email") ?? ""),
    phone: String(form.get("phone") ?? ""),
  };
  const page = (error: string) =>
    html(
      publicSignupPage({
        publicToken,
        photo: testPhoto(test.jobTitle, test.id),
        color: test.company.primaryColor,
        companyName: test.company.name,
        testTitle: test.title,
        durationMinutes: test.durationMinutes,
        error,
        values,
      }),
      400,
    );

  const parsed = SignupSchema.safeParse(values);
  if (!parsed.success) return page("Indiquez votre nom et prénom.");
  const email = parsed.data.email ? (z.email().safeParse(parsed.data.email).success ? parsed.data.email : null) : null;
  if (parsed.data.email && !email) return page("L'adresse email n'est pas valide.");
  const phone = parsed.data.phone ? normalizePhone(parsed.data.phone, test.company.country) : null;
  if (parsed.data.phone && !phone) return page("Le numéro de téléphone n'est pas valide.");
  if (!email && !phone) return page("Indiquez votre email ou votre numéro de téléphone.");

  const { invitation, created } = await createInvitation({
    companyId: test.companyId,
    test,
    candidate: { name: parsed.data.name, email, phone },
    channel: "PUBLIC_LINK",
  });
  const color = test.company.primaryColor;
  if (invitation.status === "COMPLETED") {
    return html(messagePage("Test déjà passé", "Ce test a déjà été passé avec cet email ou ce numéro. Il ne peut être passé qu'une fois.", color));
  }
  if (!created) {
    // Invitation déjà existante : on ne donne pas son lien à n'importe qui, on le renvoie
    // aux coordonnées du candidat (sinon, connaître un email suffirait à prendre sa place).
    const recent = await db.message.count({
      where: { invitationId: invitation.id, createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) } },
    });
    if (recent === 0) await sendCandidateMessage(invitation.id, "invitation", ["EMAIL", "WHATSAPP"]);
    return html(
      messagePage(
        "Lien renvoyé",
        "Un test existe déjà pour cet email ou ce numéro. Le lien personnel vient d'y être renvoyé : ouvrez-le pour commencer ou reprendre le test.",
        color,
      ),
    );
  }
  return NextResponse.redirect(new URL(`/t/${invitation.token}`, req.url), 303);
}
