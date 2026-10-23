import "server-only";
import { db } from "@/lib/db";
import type { AuthTokenType } from "@/generated/prisma/client";
import { generateToken, hashToken } from "./tokens";

const LIFETIME_MINUTES: Record<AuthTokenType, number> = {
  EMAIL_VERIFICATION: 48 * 60,
  PASSWORD_RESET: 60,
  MAGIC_LINK: 15,
};

// Délai minimum entre deux emails du même type, pour éviter les abus.
const RESEND_DELAY_SECONDS = 60;

// Crée un jeton à usage unique et renvoie sa valeur en clair (à mettre dans le lien),
// ou null si un jeton du même type vient d'être envoyé.
export async function issueAuthToken(userId: string, type: AuthTokenType): Promise<string | null> {
  const recent = await db.authToken.findFirst({
    where: { userId, type, createdAt: { gt: new Date(Date.now() - RESEND_DELAY_SECONDS * 1000) } },
    select: { id: true },
  });
  if (recent) return null;
  const token = generateToken();
  await db.authToken.create({
    data: {
      userId,
      type,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + LIFETIME_MINUTES[type] * 60_000),
    },
  });
  return token;
}

// Utilise un jeton : renvoie l'utilisateur concerné si le jeton est valide,
// non expiré et pas encore utilisé. Le jeton ne peut servir qu'une fois.
export async function consumeAuthToken(token: string, type: AuthTokenType): Promise<string | null> {
  const now = new Date();
  const record = await db.authToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, userId: true, type: true, usedAt: true, expiresAt: true },
  });
  if (!record || record.type !== type || record.usedAt || record.expiresAt < now) return null;
  // Mise à jour conditionnelle : si deux requêtes arrivent en même temps, une seule gagne.
  const { count } = await db.authToken.updateMany({
    where: { id: record.id, usedAt: null },
    data: { usedAt: now },
  });
  return count === 1 ? record.userId : null;
}
