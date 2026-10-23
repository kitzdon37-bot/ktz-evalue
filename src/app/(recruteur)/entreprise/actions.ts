"use server";

import { refresh } from "next/cache";
import * as z from "zod";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/tenant";
import { generateToken, hashToken } from "@/lib/auth/tokens";
import { appUrl, linkEmail, sendEmail } from "@/lib/email";
import { COUNTRIES } from "@/lib/countries";
import type { FormState } from "@/lib/auth/schemas";

const MAX_MEMBERS = 3; // membres invités, en plus du propriétaire
const INVITE_DAYS = 7;

const CompanySchema = z.object({
  name: z.string().trim().min(2, { error: "Indiquez le nom de l'entreprise." }).max(120),
  sector: z.string().trim().max(80),
  country: z.string().refine((c) => c in COUNTRIES, { error: "Pays invalide." }),
  city: z.string().trim().max(80),
  primaryColor: z.union([z.literal(""), z.string().regex(/^#[0-9a-fA-F]{6}$/, { error: "Couleur invalide." })]),
});

export async function updateCompany(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireOwner();
  const parsed = CompanySchema.safeParse({
    name: formData.get("name"),
    sector: formData.get("sector") ?? "",
    country: formData.get("country"),
    city: formData.get("city") ?? "",
    primaryColor: formData.get("primaryColor") ?? "",
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const d = parsed.data;
  await db.company.update({
    where: { id: user.companyId },
    data: { name: d.name, sector: d.sector || null, country: d.country, city: d.city || null, primaryColor: d.primaryColor || null },
  });
  refresh();
  return { success: "Fiche entreprise enregistrée." };
}

const InviteSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email({ error: "Adresse email invalide." })),
  role: z.enum(["RECRUITER", "VIEWER"]),
});

export async function inviteMember(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireOwner();
  const parsed = InviteSchema.safeParse({ email: formData.get("email"), role: formData.get("role") });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const { email, role } = parsed.data;

  const [members, pending, existing] = await Promise.all([
    db.user.count({ where: { companyId: user.companyId, role: { not: "OWNER" }, deletedAt: null } }),
    db.teamInvitation.count({ where: { companyId: user.companyId, acceptedAt: null, expiresAt: { gt: new Date() } } }),
    db.user.findUnique({ where: { email }, select: { id: true } }),
  ]);
  if (members + pending >= MAX_MEMBERS) {
    return { message: `Vous pouvez inviter jusqu'à ${MAX_MEMBERS} membres. Retirez un membre ou annulez une invitation.` };
  }
  if (existing) {
    return { errors: { email: ["Cette adresse a déjà un compte KTZ Évalue."] } };
  }

  const token = generateToken();
  await db.$transaction([
    // Une nouvelle invitation remplace l'ancienne pour la même adresse.
    db.teamInvitation.deleteMany({ where: { companyId: user.companyId, email, acceptedAt: null } }),
    db.teamInvitation.create({
      data: {
        companyId: user.companyId,
        email,
        role,
        tokenHash: hashToken(token),
        invitedById: user.id,
        expiresAt: new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000),
      },
    }),
  ]);
  await sendEmail(
    linkEmail({
      to: email,
      subject: `${user.name} vous invite sur KTZ Évalue`,
      intro: `${user.name} vous invite à rejoindre l'équipe de recrutement de ${user.companyName} sur KTZ Évalue. Cette invitation est valable ${INVITE_DAYS} jours.`,
      label: "Rejoindre l'équipe",
      url: appUrl(`/rejoindre?jeton=${token}`),
    }),
  );
  refresh();
  return { success: `Invitation envoyée à ${email}.` };
}

export async function cancelInvitation(invitationId: string) {
  const user = await requireOwner();
  await db.teamInvitation.deleteMany({ where: { id: invitationId, companyId: user.companyId, acceptedAt: null } });
  refresh();
}

export async function changeRole(memberId: string, formData: FormData) {
  const user = await requireOwner();
  const role = formData.get("role");
  if (role !== "RECRUITER" && role !== "VIEWER") return;
  await db.user.updateMany({ where: { id: memberId, companyId: user.companyId, role: { not: "OWNER" } }, data: { role } });
  refresh();
}

export async function removeMember(memberId: string) {
  const user = await requireOwner();
  const member = await db.user.findFirst({
    where: { id: memberId, companyId: user.companyId, role: { not: "OWNER" } },
    select: { id: true },
  });
  if (!member) return;
  // Le compte est désactivé (pas supprimé) pour garder l'historique (tests créés, notes modifiées).
  await db.$transaction([
    db.user.update({ where: { id: member.id }, data: { deletedAt: new Date() } }),
    db.session.deleteMany({ where: { userId: member.id } }),
  ]);
  refresh();
}
