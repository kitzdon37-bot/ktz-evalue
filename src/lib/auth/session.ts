import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { generateToken, hashToken } from "./tokens";

const COOKIE_NAME = "ktz_session";
const SESSION_DAYS = 30;

// Crée une session après une connexion réussie. À appeler uniquement depuis
// une action serveur ou une route API (seules à pouvoir poser un cookie).
export async function createSession(userId: string) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const h = await headers();
  await db.session.create({
    data: {
      id: hashToken(token),
      userId,
      expiresAt,
      userAgent: h.get("user-agent")?.slice(0, 300),
      ip: h.get("x-forwarded-for")?.split(",")[0]?.trim(),
    },
  });
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    await db.session.deleteMany({ where: { id: hashToken(token) } });
  }
  cookieStore.delete(COOKIE_NAME);
}

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "RECRUITER" | "VIEWER";
  emailVerified: boolean;
  isPlatformAdmin: boolean;
  companyId: string | null;
  companyName: string | null;
  companyLogoUrl: string | null;
};

// Lit la session une seule fois par requête (cache de React).
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { id: hashToken(token) },
    select: {
      expiresAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerifiedAt: true,
          isPlatformAdmin: true,
          deletedAt: true,
          companyId: true,
          company: { select: { name: true, logoUrl: true } },
        },
      },
    },
  });
  if (!session || session.expiresAt < new Date() || session.user.deletedAt) return null;
  const u = session.user;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    emailVerified: u.emailVerifiedAt !== null,
    isPlatformAdmin: u.isPlatformAdmin,
    companyId: u.companyId,
    companyName: u.company?.name ?? null,
    companyLogoUrl: u.company?.logoUrl ?? null,
  };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  return user;
}
