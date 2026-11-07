import "server-only";
import { createHash } from "node:crypto";
import { appUrl } from "@/lib/email";
import { generateToken } from "./tokens";

// Connexion « Continuer avec Google » (OpenID Connect, code d'autorisation + PKCE).
// Aucune bibliothèque : uniquement les adresses publiques de Google.
// Le bouton n'apparaît que si GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET sont renseignés.

export type OAuthProvider = "google";

type ProviderConfig = {
  label: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string;
  clientId?: string;
  clientSecret?: string;
};

function config(provider: OAuthProvider): ProviderConfig {
  switch (provider) {
    case "google":
      return {
        label: "Google",
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
        scope: "openid email profile",
        clientId: process.env.GOOGLE_CLIENT_ID?.trim(),
        clientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim(),
      };
  }
}

export function isOAuthProvider(value: string): value is OAuthProvider {
  return value === "google";
}

export function isOAuthConfigured(provider: OAuthProvider): boolean {
  const c = config(provider);
  return Boolean(c.clientId && c.clientSecret);
}

export function redirectUri(provider: OAuthProvider): string {
  return appUrl(`/api/auth/oauth/${provider}/callback`);
}

export const OAUTH_COOKIE = "ktz_oauth";
export const OAUTH_COOKIE_MAX_AGE = 10 * 60; // 10 minutes pour revenir de Google

export type OAuthPending = { provider: OAuthProvider; state: string; verifier: string };

// Prépare l'adresse de Google et les secrets à garder dans un cookie le temps de l'aller-retour.
export function startOAuth(provider: OAuthProvider): { url: string; pending: OAuthPending } {
  const c = config(provider);
  const state = generateToken();
  const verifier = generateToken(48);
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const url = new URL(c.authUrl);
  url.search = new URLSearchParams({
    client_id: c.clientId ?? "",
    redirect_uri: redirectUri(provider),
    response_type: "code",
    scope: c.scope,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return { url: url.toString(), pending: { provider, state, verifier } };
}

export function readPending(raw: string | undefined): OAuthPending | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<OAuthPending>;
    if (typeof v.state === "string" && typeof v.verifier === "string" && typeof v.provider === "string" && isOAuthProvider(v.provider)) {
      return { provider: v.provider, state: v.state, verifier: v.verifier };
    }
  } catch {}
  return null;
}

export type OAuthIdentity = { email: string; name: string };

// Échange le code contre un jeton, puis lit l'identité (email vérifié uniquement).
export async function finishOAuth(provider: OAuthProvider, code: string, verifier: string): Promise<OAuthIdentity | null> {
  const c = config(provider);
  if (!c.clientId || !c.clientSecret) return null;
  const tokenRes = await fetch(c.tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: c.clientId,
      client_secret: c.clientSecret,
      code,
      code_verifier: verifier,
      grant_type: "authorization_code",
      redirect_uri: redirectUri(provider),
    }),
    cache: "no-store",
  });
  if (!tokenRes.ok) {
    console.error(`[oauth:${provider}] échange du code refusé (${tokenRes.status})`, await tokenRes.text().catch(() => ""));
    return null;
  }
  const { access_token } = (await tokenRes.json()) as { access_token?: string };
  if (!access_token) return null;

  const infoRes = await fetch(c.userInfoUrl, { headers: { authorization: `Bearer ${access_token}` }, cache: "no-store" });
  if (!infoRes.ok) {
    console.error(`[oauth:${provider}] lecture du profil refusée (${infoRes.status})`);
    return null;
  }
  const info = (await infoRes.json()) as { email?: string; email_verified?: boolean | string; name?: string; given_name?: string };
  const verified = info.email_verified === true || info.email_verified === "true";
  const email = info.email?.trim().toLowerCase();
  if (!email || !verified) return null;
  const name = (info.name || info.given_name || email.split("@")[0]).trim().slice(0, 100);
  return { email, name };
}
