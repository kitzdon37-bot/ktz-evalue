"use server";

import { refresh } from "next/cache";
import { readSheet } from "read-excel-file/node";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/tenant";
import { getCompanyTest } from "@/lib/tests/repository";
import { createInvitation, newInvitationToken } from "@/lib/invitations";
import { parseCandidates, splitRows } from "@/lib/candidates/parse";
import { recordManualShare, sendCandidateMessage } from "@/lib/messages";
import type { FormState } from "@/lib/auth/schemas";

const MAX_PER_BATCH = 200;
const MAX_FILE_BYTES = 2 * 1024 * 1024;

async function publishedTest(testId: string) {
  const user = await requireEditor();
  const test = await getCompanyTest(testId, user.companyId);
  if (test.status !== "PUBLISHED") throw new Error("Le test doit être publié pour inviter des candidats.");
  return { user, test };
}

async function readFileRows(file: File): Promise<string[][]> {
  if (file.size > MAX_FILE_BYTES) throw new Error("Fichier trop lourd (2 Mo maximum).");
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx")) {
    const rows = await readSheet(Buffer.from(await file.arrayBuffer()));
    return rows.map((r) => r.map((cell) => (cell == null ? "" : String(cell).trim())));
  }
  if (name.endsWith(".csv") || name.endsWith(".txt")) return splitRows(await file.text());
  throw new Error("Format non pris en charge : utilisez un fichier .csv ou .xlsx.");
}

export async function inviteCandidates(testId: string, _state: FormState, formData: FormData): Promise<FormState> {
  const { user, test } = await publishedTest(testId);
  const company = await db.company.findUniqueOrThrow({ where: { id: user.companyId }, select: { country: true } });

  let rows = splitRows(String(formData.get("list") ?? ""));
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    try {
      rows = [...rows, ...(await readFileRows(file))];
    } catch (e) {
      return { message: e instanceof Error ? e.message : "Fichier illisible." };
    }
  }
  const { valid, errors } = parseCandidates(rows, company.country);
  if (valid.length === 0) {
    return { message: errors.length ? errors.slice(0, 10).join("\n") : "Ajoutez au moins un candidat." };
  }
  if (valid.length > MAX_PER_BATCH) return { message: `${MAX_PER_BATCH} candidats maximum par envoi.` };

  const channels: ("EMAIL" | "WHATSAPP")[] = [];
  if (formData.get("byEmail") === "on") channels.push("EMAIL");
  if (formData.get("byWhatsapp") === "on") channels.push("WHATSAPP");

  let created = 0;
  let already = 0;
  let sent = 0;
  let manual = 0;
  const sendErrors = new Set<string>();
  for (const c of valid) {
    const { invitation, created: isNew } = await createInvitation({
      companyId: user.companyId,
      test,
      candidate: c,
      channel: channels.includes("WHATSAPP") && !channels.includes("EMAIL") ? "WHATSAPP" : "EMAIL",
    });
    if (!isNew) {
      already++;
      continue;
    }
    created++;
    if (channels.length) {
      const r = await sendCandidateMessage(invitation.id, "invitation", channels);
      if (r.sent > 0) sent++;
      if (r.manual > 0 && r.sent === 0) manual++;
      r.errors.forEach((e) => sendErrors.add(e));
    }
  }

  refresh();
  const parts = [`${created} candidat(s) invité(s)`];
  if (sent) parts.push(`${sent} message(s) envoyé(s) automatiquement`);
  if (already) parts.push(`${already} déjà invité(s)`);
  if (manual) {
    parts.push(
      `${manual} à envoyer vous-même : cliquez sur « WhatsApp » ou « Email » à côté du candidat, le message et le lien sont déjà écrits`,
    );
  }
  const problems = [...errors, ...sendErrors].slice(0, 8);
  return {
    success: `${parts.join(" · ")}.`,
    message: problems.length ? `À vérifier :\n${problems.join("\n")}` : undefined,
  };
}

// Le recruteur a envoyé l'invitation lui-même depuis son WhatsApp ou sa messagerie.
export async function markInvitationShared(invitationId: string, channel: "EMAIL" | "WHATSAPP") {
  const user = await requireEditor();
  await recordManualShare(invitationId, user.companyId, channel);
  refresh();
}

async function companyInvitation(invitationId: string) {
  const user = await requireEditor();
  const inv = await db.invitation.findFirst({
    where: { id: invitationId, companyId: user.companyId },
    include: { candidate: { select: { email: true, phone: true } } },
  });
  if (!inv) throw new Error("Invitation introuvable.");
  return inv;
}

export async function remindInvitation(invitationId: string) {
  const inv = await companyInvitation(invitationId);
  if (!["PENDING", "SENT", "OPENED"].includes(inv.status)) return;
  const channels: ("EMAIL" | "WHATSAPP")[] = [];
  if (inv.candidate.email) channels.push("EMAIL");
  if (inv.candidate.phone) channels.push("WHATSAPP");
  await sendCandidateMessage(inv.id, inv.status === "PENDING" ? "invitation" : "relance", channels);
  refresh();
}

export async function cancelInvitationAction(invitationId: string) {
  const inv = await companyInvitation(invitationId);
  if (inv.status === "STARTED" || inv.status === "COMPLETED") return;
  await db.invitation.update({ where: { id: inv.id }, data: { status: "CANCELLED" } });
  refresh();
}

export async function setExtraTime(invitationId: string, formData: FormData) {
  const inv = await companyInvitation(invitationId);
  if (inv.status === "STARTED" || inv.status === "COMPLETED") return;
  const extra = formData.get("extra") === "50" ? 50 : 0;
  await db.invitation.update({ where: { id: inv.id }, data: { extraTimePercent: extra } });
  refresh();
}

export async function updatePublicLink(testId: string, _state: FormState, formData: FormData): Promise<FormState> {
  const { test } = await publishedTest(testId);
  const enabled = formData.get("enabled") === "on";
  const maxRaw = String(formData.get("max") ?? "").trim();
  const max = maxRaw ? Number.parseInt(maxRaw, 10) : null;
  if (max !== null && (!Number.isFinite(max) || max < 1 || max > 10000)) {
    return { message: "Le nombre maximal de passages doit être entre 1 et 10 000." };
  }
  await db.test.update({
    where: { id: test.id },
    data: { publicToken: enabled ? (test.publicToken ?? newInvitationToken()) : null, publicMaxAttempts: max },
  });
  refresh();
  return { success: enabled ? "Lien public activé." : "Lien public désactivé." };
}
