import "server-only";

// Envoi WhatsApp par WasenderAPI (déjà utilisé par KTZ Emploi).
// Sans clé, en développement, le message est affiché dans le terminal.
export async function sendWhatsApp(to: string, text: string): Promise<{ id: string | null }> {
  const apiKey = process.env.WASENDER_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("WASENDER_API_KEY manquante : impossible d'envoyer le message WhatsApp.");
    }
    console.log(`\n[WhatsApp de test] À : ${to}\n${text}\n`);
    return { id: null };
  }
  const res = await fetch("https://www.wasenderapi.com/api/send-message", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ to, text }),
  });
  if (!res.ok) {
    throw new Error(`Échec de l'envoi WhatsApp (WasenderAPI ${res.status}).`);
  }
  const body = (await res.json().catch(() => null)) as { data?: { msgId?: string | number } } | null;
  return { id: body?.data?.msgId != null ? String(body.data.msgId) : null };
}
