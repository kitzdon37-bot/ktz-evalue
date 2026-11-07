import { NextResponse, type NextRequest } from "next/server";
import { isOAuthConfigured, isOAuthProvider, OAUTH_COOKIE, OAUTH_COOKIE_MAX_AGE, startOAuth } from "@/lib/auth/oauth";

// Bouton « Continuer avec Google » : envoie vers la page de choix de compte de Google.
export async function GET(request: NextRequest, { params }: RouteContext<"/api/auth/oauth/[provider]">) {
  const { provider } = await params;
  if (!isOAuthProvider(provider) || !isOAuthConfigured(provider)) {
    return NextResponse.redirect(new URL("/connexion?oauth=indisponible", request.url));
  }
  const { url, pending } = startOAuth(provider);
  const response = NextResponse.redirect(url);
  response.cookies.set(OAUTH_COOKIE, JSON.stringify(pending), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/oauth",
    maxAge: OAUTH_COOKIE_MAX_AGE,
  });
  return response;
}
