import "server-only";

type Email = { to: string; subject: string; text: string; html: string };

// Envoi d'email par Resend. Sans clé Resend, en développement, l'email est
// affiché dans le terminal pour pouvoir tester sans compte.
export async function sendEmail(email: Email): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY manquante : impossible d'envoyer l'email.");
    }
    console.log(`\n[email de test] À : ${email.to}\nObjet : ${email.subject}\n${email.text}\n`);
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
    }),
  });
  if (!res.ok) {
    throw new Error(`Échec de l'envoi de l'email (Resend ${res.status}).`);
  }
}

export function appUrl(path: string): string {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return new URL(path, base).toString();
}

function escapeHtml(s: string): string {
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
<p><a href="${opts.url}" style="display:inline-block;background:#0f766e;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">${escapeHtml(opts.label)}</a></p>
<p style="font-size:13px;color:#6b7280">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
<p style="font-size:13px;color:#6b7280">KTZ Évalue</p></div>`,
  };
}
