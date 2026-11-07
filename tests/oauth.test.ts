import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/email", () => ({ appUrl: (p: string) => new URL(p, "http://localhost:3100").toString() }));

const { finishOAuth, isOAuthConfigured, readPending, redirectUri, startOAuth } = await import("@/lib/auth/oauth");

beforeEach(() => {
  vi.stubEnv("GOOGLE_CLIENT_ID", "id-test.apps.googleusercontent.com");
  vi.stubEnv("GOOGLE_CLIENT_SECRET", "secret-test");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("connexion Google", () => {
  it("n'est proposée que si les deux clés sont renseignées", () => {
    expect(isOAuthConfigured("google")).toBe(true);
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "");
    expect(isOAuthConfigured("google")).toBe(false);
  });

  it("prépare une adresse Google avec PKCE et un état aléatoire", () => {
    const { url, pending } = startOAuth("google");
    const u = new URL(url);
    expect(u.origin + u.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(u.searchParams.get("redirect_uri")).toBe("http://localhost:3100/api/auth/oauth/google/callback");
    expect(u.searchParams.get("state")).toBe(pending.state);
    expect(u.searchParams.get("code_challenge_method")).toBe("S256");
    expect(u.searchParams.get("code_challenge")).toBe(createHash("sha256").update(pending.verifier).digest("base64url"));
    expect(u.searchParams.get("scope")).toBe("openid email profile");
    expect(startOAuth("google").pending.state).not.toBe(pending.state);
  });

  it("relit le cookie d'aller-retour et refuse un cookie abîmé", () => {
    const { pending } = startOAuth("google");
    expect(readPending(JSON.stringify(pending))).toEqual(pending);
    expect(readPending("pas du json")).toBeNull();
    expect(readPending(JSON.stringify({ ...pending, provider: "facebook" }))).toBeNull();
    expect(readPending(undefined)).toBeNull();
  });

  function mockGoogle(profile: Record<string, unknown>, tokenOk = true) {
    const calls: { url: string; body?: string }[] = [];
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
      calls.push({ url, body: init?.body?.toString() });
      if (url.includes("oauth2.googleapis.com/token")) {
        return tokenOk ? Response.json({ access_token: "jeton" }) : new Response("invalid_grant", { status: 400 });
      }
      return Response.json(profile);
    });
    return calls;
  }

  it("accepte une adresse vérifiée par Google (mise en minuscules)", async () => {
    const calls = mockGoogle({ email: "Awa.Kone@Gmail.com", email_verified: true, name: "Awa Koné" });
    expect(await finishOAuth("google", "code-1", "verif-1")).toEqual({ email: "awa.kone@gmail.com", name: "Awa Koné" });
    const body = new URLSearchParams(calls[0].body);
    expect(body.get("code_verifier")).toBe("verif-1");
    expect(body.get("redirect_uri")).toBe(redirectUri("google"));
  });

  it("refuse une adresse non vérifiée ou un code refusé", async () => {
    mockGoogle({ email: "x@exemple.com", email_verified: false, name: "X" });
    expect(await finishOAuth("google", "c", "v")).toBeNull();
    mockGoogle({ email: "x@exemple.com", email_verified: true }, false);
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await finishOAuth("google", "c", "v")).toBeNull();
  });

  it("donne un nom même si Google n'en fournit pas", async () => {
    mockGoogle({ email: "jean@exemple.cf", email_verified: "true" });
    expect(await finishOAuth("google", "c", "v")).toEqual({ email: "jean@exemple.cf", name: "jean" });
  });
});
