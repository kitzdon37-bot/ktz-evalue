import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth/session";
import { finishOAuth, isOAuthProvider, OAUTH_COOKIE, readPending } from "@/lib/auth/oauth";

function sameText(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// Retour de Google : connecte le compte existant, ou crée un compte entreprise.
export async function GET(request: NextRequest, { params }: RouteContext<"/api/auth/oauth/[provider]/callback">) {
  const { provider } = await params;
  const back = (reason: string) => {
    const res = NextResponse.redirect(new URL(`/connexion?oauth=${reason}`, request.url));
    res.cookies.delete({ name: OAUTH_COOKIE, path: "/api/auth/oauth" });
    return res;
  };

  const search = request.nextUrl.searchParams;
  if (search.get("error")) return back("annule");
  const pending = readPending(request.cookies.get(OAUTH_COOKIE)?.value);
  const code = search.get("code");
  const state = search.get("state") ?? "";
  if (!isOAuthProvider(provider) || !pending || pending.provider !== provider || !code || !sameText(state, pending.state)) {
    return back("expire");
  }

  let identity;
  try {
    identity = await finishOAuth(provider, code, pending.verifier);
  } catch (e) {
    console.error(e);
    identity = null;
  }
  if (!identity) return back("echec");

  const existing = await db.user.findUnique({
    where: { email: identity.email },
    select: { id: true, deletedAt: true, emailVerifiedAt: true },
  });

  let destination = "/tableau-de-bord";
  if (existing) {
    if (existing.deletedAt) return back("compte-supprime");
    // Google garantit que l'adresse appartient bien à la personne.
    await db.user.update({
      where: { id: existing.id },
      data: { failedLogins: 0, lockedUntil: null, emailVerifiedAt: existing.emailVerifiedAt ?? new Date() },
    });
    await createSession(existing.id);
  } else {
    // Une invitation d'équipe attend cette adresse : il faut passer par le lien reçu,
    // sinon la personne se retrouverait dans une entreprise vide.
    const invited = await db.teamInvitation.findFirst({
      where: { email: identity.email, acceptedAt: null, expiresAt: { gt: new Date() } },
      select: { id: true },
    });
    if (invited) return back("invitation");

    const firstName = identity.name.split(/\s+/)[0] || identity.name;
    const user = await db.user.create({
      data: {
        name: identity.name,
        email: identity.email,
        role: "OWNER",
        emailVerifiedAt: new Date(),
        company: { create: { name: `Entreprise de ${firstName}`.slice(0, 120) } },
      },
      select: { id: true },
    });
    await createSession(user.id);
    destination = "/entreprise?bienvenue=1";
  }

  const res = NextResponse.redirect(new URL(destination, request.url));
  res.cookies.delete({ name: OAUTH_COOKIE, path: "/api/auth/oauth" });
  return res;
}
