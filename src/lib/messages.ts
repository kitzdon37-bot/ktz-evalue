import "server-only";
import { db } from "@/lib/db";
import { appUrl, linkEmail, sendEmail } from "@/lib/email";
import { sendWhatsApp } from "@/lib/whatsapp";
import { candidateThanks, employerResults } from "@/lib/reports/result-email";

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

// Envoie un message et garde sa trace (table Message), sans jamais faire échouer la suite.
async function tracked(
  data: { companyId: string; invitationId?: string; channel: "EMAIL" | "WHATSAPP"; recipient: string; template: string },
  send: () => Promise<string | null | void>,
) {
  const message = await db.message.create({ data });
  try {
    const providerId = await send();
    await db.message.update({ where: { id: message.id }, data: { status: "SENT", sentAt: new Date(), providerMessageId: providerId || null } });
    return true;
  } catch (e) {
    await db.message.update({
      where: { id: message.id },
      data: { status: "FAILED", error: e instanceof Error ? e.message.slice(0, 500) : "erreur" },
    });
    return false;
  }
}

// Fin du test : le candidat reçoit un message qui le remercie et lui annonce que l'entreprise
// reviendra vers lui (par email, et par WhatsApp si le service est configuré).
export async function thankCandidate(attemptId: string) {
  const a = await db.attempt.findUnique({
    where: { id: attemptId },
    include: {
      candidate: { select: { name: true, email: true, phone: true } },
      test: { select: { title: true } },
      company: { select: { name: true, contactEmail: true, contactPhone: true } },
    },
  });
  if (!a) return;
  const msg = candidateThanks({
    candidateName: a.candidate.name,
    companyName: a.company.name,
    testTitle: a.test.title,
    contactEmail: a.company.contactEmail,
    contactPhone: a.company.contactPhone,
  });
  const base = { companyId: a.companyId, invitationId: a.invitationId, template: "remerciement_candidat" };
  if (a.candidate.email) {
    const to = a.candidate.email;
    await tracked({ ...base, channel: "EMAIL", recipient: to }, () => sendEmail({ to, subject: msg.subject, text: msg.text, html: msg.html }));
  }
  if (a.candidate.phone && isChannelConfigured("WHATSAPP")) {
    const to = a.candidate.phone;
    await tracked({ ...base, channel: "WHATSAPP", recipient: to }, async () => (await sendWhatsApp(to, msg.whatsapp)).id);
  }
}

// Envoie à l'employeur les résultats du candidat avec la correction question par question,
// et le rapport PDF complet en pièce jointe. Appelé après la correction automatique et l'IA.
export async function notifyRecruiterOfCompletion(attemptId: string) {
  // Import différé : le rapport dépend du module des passages, qui dépend de celui-ci.
  const { loadCandidateReport, renderReportPdf } = await import("@/lib/reports/candidate-report");
  const loaded = await loadCandidateReport(attemptId);
  if (!loaded) return;
  const { attempt, report, filename } = loaded;
  const creator = await db.user.findUnique({ where: { id: attempt.test.createdById }, select: { email: true } });
  if (!creator) return;
  const url = appUrl(`/tests/${attempt.testId}/resultats/${attempt.id}`);
  const mail = employerResults({
    candidateName: report.candidateName,
    candidateContact: report.candidateContact,
    testTitle: report.testTitle,
    globalScore: report.globalScore,
    passThreshold: report.passThreshold,
    passed: report.passed,
    pending: report.pending,
    durationText: report.durationText,
    reliabilityLabel: report.reliabilityLabel,
    skills: report.skills,
    correction: report.correction ?? [],
    url,
  });
  let attachments: { filename: string; content: string }[] | undefined;
  try {
    attachments = [{ filename: `${filename || "rapport"}.pdf`, content: (await renderReportPdf(report)).toString("base64") }];
  } catch (e) {
    console.error("[fin du test] rapport PDF", e); // l'email part quand même, sans pièce jointe
  }
  await tracked(
    { companyId: attempt.companyId, invitationId: attempt.invitationId, channel: "EMAIL", recipient: creator.email, template: "candidat_termine" },
    () => sendEmail({ to: creator.email, subject: mail.subject, text: mail.text, html: mail.html, attachments }),
  );
}
