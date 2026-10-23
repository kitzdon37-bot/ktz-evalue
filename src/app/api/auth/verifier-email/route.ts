import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { consumeAuthToken } from "@/lib/auth/auth-tokens";

// Lien reçu par email après l'inscription : confirme l'adresse.
// Ne connecte pas l'utilisateur (un antivirus de messagerie peut ouvrir ce lien).
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("jeton");
  const userId = token ? await consumeAuthToken(token, "EMAIL_VERIFICATION") : null;
  if (!userId) {
    return NextResponse.redirect(new URL("/connexion?email=lien-invalide", request.url));
  }
  await db.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
  return NextResponse.redirect(new URL("/connexion?email=confirme", request.url));
}
