"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { afterFailedLogin, isLocked } from "@/lib/auth/lockout";
import { createSession, deleteSession, getCurrentUser } from "@/lib/auth/session";
import { consumeAuthToken, issueAuthToken } from "@/lib/auth/auth-tokens";
import { appUrl, linkEmail, sendEmail } from "@/lib/email";
import { hashToken } from "@/lib/auth/tokens";
import {
  AcceptInvitationSchema,
  EmailSchema,
  LoginSchema,
  ResetPasswordSchema,
  SignupSchema,
  type FormState,
} from "@/lib/auth/schemas";

const GENERIC_EMAIL_SENT =
  "Si un compte existe avec cette adresse, un email vient d'être envoyé. Pensez à regarder dans les courriers indésirables.";

// Empreinte factice : on vérifie un mot de passe même quand le compte n'existe pas,
// pour que le temps de réponse ne révèle pas quels emails sont inscrits.
let dummyHash: Promise<string> | undefined;
function getDummyHash() {
  dummyHash ??= hashPassword("mot-de-passe-factice-0");
  return dummyHash;
}

async function sendVerificationEmail(userId: string, email: string) {
  const token = await issueAuthToken(userId, "EMAIL_VERIFICATION");
  if (!token) return;
  await sendEmail(
    linkEmail({
      to: email,
      subject: "Confirmez votre adresse email — KTZ Évalue",
      intro: "Bienvenue sur KTZ Évalue. Cliquez sur le bouton ci-dessous pour confirmer votre adresse email.",
      label: "Confirmer mon email",
      url: appUrl(`/api/auth/verifier-email?jeton=${token}`),
    }),
  );
}

export async function signup(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = SignupSchema.safeParse({
    name: formData.get("name"),
    companyName: formData.get("companyName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  const { name, companyName, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return { errors: { email: ["Un compte existe déjà avec cette adresse. Connectez-vous."] } };
  }

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "OWNER",
      company: { create: { name: companyName } },
    },
    select: { id: true },
  });

  try {
    await sendVerificationEmail(user.id, email);
  } catch (e) {
    // Le compte est créé : l'email pourra être renvoyé depuis le tableau de bord.
    console.error(e);
  }
  await createSession(user.id);
  redirect("/tableau-de-bord");
}

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  const { email, password } = parsed.data;
  const invalid = { message: "Email ou mot de passe incorrect." };

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, failedLogins: true, lockedUntil: true, deletedAt: true },
  });
  if (!user || !user.passwordHash || user.deletedAt) {
    await verifyPassword(await getDummyHash(), password);
    return invalid;
  }
  if (isLocked(user.lockedUntil)) {
    return {
      message:
        "Trop de tentatives. Votre compte est bloqué pendant 15 minutes. Vous pouvez aussi demander un lien de connexion par email.",
    };
  }
  if (!(await verifyPassword(user.passwordHash, password))) {
    await db.user.update({ where: { id: user.id }, data: afterFailedLogin(user.failedLogins) });
    return invalid;
  }

  await db.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null } });
  await createSession(user.id);
  redirect("/tableau-de-bord");
}

export async function logout() {
  await deleteSession();
  redirect("/connexion");
}

export async function requestMagicLink(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = EmailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, deletedAt: true },
  });
  if (user && !user.deletedAt) {
    const token = await issueAuthToken(user.id, "MAGIC_LINK");
    if (token) {
      await sendEmail(
        linkEmail({
          to: user.email,
          subject: "Votre lien de connexion — KTZ Évalue",
          intro:
            "Cliquez sur le bouton ci-dessous pour vous connecter à KTZ Évalue. Ce lien est valable 15 minutes et ne sert qu'une fois.",
          label: "Me connecter",
          url: appUrl(`/lien-magique?jeton=${token}`),
        }),
      );
    }
  }
  return { success: GENERIC_EMAIL_SENT };
}

// Le lien magique ouvre une page avec un bouton : certains antivirus de messagerie
// ouvrent les liens automatiquement, ce qui « consommerait » le lien si la connexion
// se faisait dès l'ouverture.
export async function confirmMagicLink(_state: FormState, formData: FormData): Promise<FormState> {
  const token = String(formData.get("token") ?? "");
  const userId = token ? await consumeAuthToken(token, "MAGIC_LINK") : null;
  if (!userId) {
    return { message: "Ce lien n'est plus valable. Demandez un nouveau lien de connexion." };
  }
  // Recevoir le lien prouve que l'adresse email est valide.
  const user = await db.user.findUnique({ where: { id: userId }, select: { emailVerifiedAt: true } });
  await db.user.update({
    where: { id: userId },
    data: { failedLogins: 0, lockedUntil: null, emailVerifiedAt: user?.emailVerifiedAt ?? new Date() },
  });
  await createSession(userId);
  redirect("/tableau-de-bord");
}

export async function requestPasswordReset(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = EmailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, deletedAt: true },
  });
  if (user && !user.deletedAt) {
    const token = await issueAuthToken(user.id, "PASSWORD_RESET");
    if (token) {
      await sendEmail(
        linkEmail({
          to: user.email,
          subject: "Nouveau mot de passe — KTZ Évalue",
          intro: "Vous avez demandé à changer votre mot de passe. Ce lien est valable 1 heure.",
          label: "Choisir un nouveau mot de passe",
          url: appUrl(`/mot-de-passe-oublie/nouveau?jeton=${token}`),
        }),
      );
    }
  }
  return { success: GENERIC_EMAIL_SENT };
}

export async function resetPassword(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = ResetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  const userId = await consumeAuthToken(parsed.data.token, "PASSWORD_RESET");
  if (!userId) {
    return { message: "Ce lien n'est plus valable. Refaites une demande de nouveau mot de passe." };
  }
  const passwordHash = await hashPassword(parsed.data.password);
  // Nouveau mot de passe : on ferme toutes les sessions ouvertes ailleurs.
  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { passwordHash, failedLogins: 0, lockedUntil: null },
    }),
    db.session.deleteMany({ where: { userId } }),
  ]);
  await createSession(userId);
  redirect("/tableau-de-bord");
}

// Un membre invité crée son compte depuis le lien reçu par email.
export async function acceptInvitation(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = AcceptInvitationSchema.safeParse({
    token: formData.get("token"),
    name: formData.get("name"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const { token, name, password } = parsed.data;

  const invitation = await db.teamInvitation.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
    return { message: "Cette invitation n'est plus valable. Demandez une nouvelle invitation à votre responsable." };
  }
  if (await db.user.findUnique({ where: { email: invitation.email }, select: { id: true } })) {
    return { message: "Un compte existe déjà avec cette adresse. Connectez-vous." };
  }
  const passwordHash = await hashPassword(password);
  const user = await db.$transaction(async (tx) => {
    // Mise à jour conditionnelle : l'invitation ne peut servir qu'une fois.
    const { count } = await tx.teamInvitation.updateMany({
      where: { id: invitation.id, acceptedAt: null },
      data: { acceptedAt: new Date() },
    });
    if (count !== 1) return null;
    return tx.user.create({
      data: {
        name,
        email: invitation.email,
        passwordHash,
        role: invitation.role,
        companyId: invitation.companyId,
        // Le lien reçu par email prouve que l'adresse est valide.
        emailVerifiedAt: new Date(),
      },
      select: { id: true },
    });
  });
  if (!user) return { message: "Cette invitation a déjà été utilisée." };
  await createSession(user.id);
  redirect("/tableau-de-bord");
}

export async function resendVerification(): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  if (user.emailVerified) return { success: "Votre adresse est déjà confirmée." };
  await sendVerificationEmail(user.id, user.email);
  return { success: "Email envoyé. Pensez à regarder dans les courriers indésirables." };
}
