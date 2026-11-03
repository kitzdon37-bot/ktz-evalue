import "server-only";
import { db } from "@/lib/db";
import { appUrl, linkEmail, sendEmail } from "@/lib/email";
import { sendWhatsApp } from "@/lib/whatsapp";

type Kind = "invitation" | "relance";

function formatDate(d: Date) {
  return d.toLocaleDateString("fr-FR", { timeZone: "Africa/Bangui", day: "numeric", month: "long" });
}

/** Le service d'envoi automatique de ce canal est-il configuré (Resend, WasenderAPI) ? */
export function isChannelConfigured(channel: "EMAIL" | "WHATSAPP") {
  return Boolean(channel === "EMAIL" ? process.env.RESEND_API_KEY : process.env.WASENDER_API_KEY);
}

/**
 * Texte de l'invitation (ou de la relance) : utilisé pour l'envoi automatique, et pour les boutons
 * « WhatsApp » et « Email » qui ouvrent l'application du recruteur avec le message prérempli.
 */
export function buildInvitationMessage(
  inv: { token: string; expiresAt: Date; candidate: { name: string }; test: { title: string; durationMinutes: number }; company: { name: string } },
  kind: Kind,
) {
  const url = appUrl(`/t/${inv.token}`);
  const until = formatDate(inv.expiresAt);
  const firstName = inv.candidate.name.split(" ")[0];
  const intro =
    kind === "invitation"
      ? `Bonjour ${firstName}, ${inv.company.name} vous invite à passer un test en ligne pour le poste « ${inv.test.title} » (${inv.test.durationMinutes} minutes). Le test se passe sur téléphone ou ordinateur, sans créer de compte. Vous avez jusqu'au ${until}.`
      : `Bonjour ${firstName}, petit rappel : le test de ${inv.company.name} pour le poste « ${inv.test.title} » est à passer avant le ${until}.`;
  const subject = kind === "invitation" ? `Test de recrutement — ${inv.company.name}` : `Rappel : test de ${inv.company.name}`;
  return { url, intro, subject, text: `${intro}\n\nOuvrez ce lien pour commencer :\n${url}` };
}

// Envoie l'invitation (ou une relance) d'un candidat par email et/ou WhatsApp,
// et garde une trace de chaque envoi (table Message).
// Un canal sans service configuré n'est pas « envoyé » : il est compté dans `manual`
// (le recruteur utilise alors les boutons WhatsApp / Email de la page d'invitation).
export async function sendCandidateMessage(invitationId: string, kind: Kind, channels: ("EMAIL" | "WHATSAPP")[]) {
  const inv = await db.invitation.findUniqueOrThrow({
    where: { id: invitationId },
    include: {
      candidate: true,
      test: { select: { title: true, durationMinutes: true, language: true } },
      company: { select: { name: true } },
    },
  });
  const { url, intro, subject, text } = buildInvitationMessage(inv, kind);

  let sent = 0;
  let manual = 0;
  const errors: string[] = [];
  for (const channel of channels) {
    const recipient = channel === "EMAIL" ? inv.candidate.email : inv.candidate.phone;
    if (!recipient) continue;
    if (!isChannelConfigured(channel)) {
      manual++;
      continue;
    }
    const message = await db.message.create({
      data: { companyId: inv.companyId, invitationId: inv.id, channel, recipient, template: kind },
    });
    try {
      let providerId: string | null = null;
      if (channel === "EMAIL") {
        await sendEmail(linkEmail({ to: recipient, subject, intro, label: "Commencer le test", url }));
      } else {
        providerId = (await sendWhatsApp(recipient, text)).id;
      }
      await db.message.update({
        where: { id: message.id },
        data: { status: "SENT", sentAt: new Date(), providerMessageId: providerId },
      });
      sent++;
    } catch (e) {
      const error = e instanceof Error ? e.message : "erreur inconnue";
      errors.push(error);
      await db.message.update({ where: { id: message.id }, data: { status: "FAILED", error: error.slice(0, 500) } });
    }
  }

  if (sent > 0) {
    await db.invitation.update({
      where: { id: inv.id },
      data:
        kind === "invitation"
          ? { status: inv.status === "PENDING" ? "SENT" : inv.status }
          : { remindersSent: { increment: 1 }, lastReminderAt: new Date() },
    });
  }
  return { sent, manual, errors };
}

/** Le recruteur a envoyé lui-même l'invitation (bouton WhatsApp ou Email) : on le note. */
export async function recordManualShare(invitationId: string, companyId: string, channel: "EMAIL" | "WHATSAPP") {
  const inv = await db.invitation.findFirst({
    where: { id: invitationId, companyId },
    include: { candidate: { select: { email: true, phone: true } } },
  });
  if (!inv) return;
  await db.message.create({
    data: {
      companyId,
      invitationId: inv.id,
      channel,
      recipient: (channel === "EMAIL" ? inv.candidate.email : inv.candidate.phone) ?? "",
      template: "partage_manuel",
      status: "SENT",
      sentAt: new Date(),
    },
  });
  if (inv.status === "PENDING") await db.invitation.update({ where: { id: inv.id }, data: { status: "SENT" } });
}

// Prévient le recruteur qu'un candidat a terminé son test.
export async function notifyRecruiterOfCompletion(attemptId: string) {
  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: {
      candidate: { select: { name: true } },
      test: { select: { id: true, title: true, companyId: true, createdBy: { select: { email: true } } } },
    },
  });
  if (!attempt) return;
  const to = attempt.test.createdBy.email;
  const message = await db.message.create({
    data: { companyId: attempt.test.companyId, channel: "EMAIL", recipient: to, template: "candidat_termine" },
  });
  try {
    await sendEmail(
      linkEmail({
        to,
        subject: `${attempt.candidate.name} a terminé le test « ${attempt.test.title} »`,
        intro: `${attempt.candidate.name} vient de terminer le test « ${attempt.test.title} ». Les résultats sont disponibles dans votre espace.`,
        label: "Voir le test",
        url: appUrl(`/tests/${attempt.test.id}`),
      }),
    );
    await db.message.update({ where: { id: message.id }, data: { status: "SENT", sentAt: new Date() } });
  } catch (e) {
    await db.message.update({
      where: { id: message.id },
      data: { status: "FAILED", error: e instanceof Error ? e.message.slice(0, 500) : "erreur" },
    });
  }
}
