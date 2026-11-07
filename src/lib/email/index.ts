import "server-only";

export type Email = {
  to: string;
  subject: string;
  text: string;
  html: string;
  /** Pièces jointes (contenu en base64), par exemple le rapport PDF d'un candidat. */
  attachments?: { filename: string; content: string }[];
};

// Envoi d'email par Resend. Sans clé Resend, en développement, l'email est
// affiché dans le terminal pour pouvoir tester sans compte.
export async function sendEmail(email: Email): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY manquante : impossible d'envoyer l'email.");
    }
    const files = email.attachments?.map((a) => `${a.filename} (${Math.round((a.content.length * 3) / 4 / 1024)} Ko)`).join(", ");
    console.log(`\n[email de test] À : ${email.to}\nObjet : ${email.subject}\n${email.text}${files ? `\nPièces jointes : ${files}` : ""}\n`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html,
      ...(email.attachments?.length ? { attachments: email.attachments } : {}),
    }),
  });
  if (!res.ok) {
    throw new Error(`Échec de l'envoi de l'email (Resend ${res.status}).`);
  }
}

export function appUrl(path: string): string {
  // Sur Vercel sans APP_URL : adresse principale du projet (ex. ktz-evalue.vercel.app).
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const base = process.env.APP_URL ?? (vercel ? `https://${vercel}` : "http://localhost:3000");
  return new URL(path, base).toString();
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// Email simple : un paragraphe et un bouton.
export function linkEmail(opts: { to: string; subject: string; intro: string; label: string; url: string }): Email {
  const intro = escapeHtml(opts.intro);
  return {
    to: opts.to,
    subject: opts.subject,
    text: `${opts.intro}\n\n${opts.label} : ${opts.url}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.\n\nKTZ Évalue`,
    html: `<div style="font-family:Arial,sans-serif;font-size:16px;color:#1f2937;max-width:520px">
<p>${intro}</p>
<p><a href="${opts.url}" style="display:inline-block;background:#ea580c;color:#fff;padding:12px 22px;border-radius:999px;font-weight:bold;text-decoration:none">${escapeHtml(opts.label)}</a></p>
<p style="font-size:13px;color:#6b7280">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
<p style="font-size:13px;color:#6b7280">KTZ Évalue</p></div>`,
  };
}
