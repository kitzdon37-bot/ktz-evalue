import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import type { Channel } from "@/generated/prisma/client";

const DEFAULT_VALIDITY_DAYS = 14;

export function newInvitationToken() {
  return randomBytes(18).toString("base64url"); // 24 caractères, impossible à deviner
}

export type CandidateInput = { name: string; email: string | null; phone: string | null };

// Retrouve le candidat de l'entreprise par email ou téléphone, ou le crée.
async function findOrCreateCandidate(companyId: string, c: CandidateInput) {
  const existing = await db.candidate.findFirst({
    where: {
      companyId,
      OR: [...(c.email ? [{ email: c.email }] : []), ...(c.phone ? [{ phone: c.phone }] : [])],
    },
  });
  if (existing) {
    // Complète les coordonnées manquantes sans écraser celles déjà connues.
    const data: { email?: string; phone?: string } = {};
    if (!existing.email && c.email) data.email = c.email;
    if (!existing.phone && c.phone) data.phone = c.phone;
    if (Object.keys(data).length) {
      try {
        return await db.candidate.update({ where: { id: existing.id }, data });
      } catch {
        return existing; // coordonnée déjà utilisée par un autre candidat : on garde l'existant
      }
    }
    return existing;
  }
  return db.candidate.create({ data: { companyId, name: c.name, email: c.email, phone: c.phone } });
}

// Crée l'invitation d'un candidat à un test publié. Si le candidat est déjà invité
// à ce test, l'invitation existante est renvoyée (un seul passage par candidat).
export async function createInvitation(opts: {
  companyId: string;
  test: { id: string; deadline: Date | null };
  candidate: CandidateInput;
  channel: Channel;
  externalRef?: string | null;
  extraTimePercent?: number;
}) {
  if (!opts.candidate.email && !opts.candidate.phone) throw new Error("Email ou téléphone requis.");
  const candidate = await findOrCreateCandidate(opts.companyId, opts.candidate);
  const existing = await db.invitation.findFirst({
    where: { testId: opts.test.id, candidateId: candidate.id, status: { not: "CANCELLED" } },
  });
  if (existing) return { invitation: existing, created: false };
  const expiresAt = opts.test.deadline ?? new Date(Date.now() + DEFAULT_VALIDITY_DAYS * 24 * 60 * 60 * 1000);
  const invitation = await db.invitation.create({
    data: {
      companyId: opts.companyId,
      testId: opts.test.id,
      candidateId: candidate.id,
      channel: opts.channel,
      token: newInvitationToken(),
      expiresAt,
      externalRef: opts.externalRef ?? null,
      extraTimePercent: opts.extraTimePercent ?? 0,
    },
  });
  return { invitation, created: true };
}
