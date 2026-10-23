import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateToken, hashToken } from "@/lib/auth/tokens";
import { afterFailedLogin, isLocked, LOCK_MINUTES, MAX_FAILED_LOGINS } from "@/lib/auth/lockout";
import { LoginSchema, SignupSchema } from "@/lib/auth/schemas";

describe("mots de passe", () => {
  it("vérifie le bon mot de passe et refuse un mauvais", async () => {
    const h = await hashPassword("motdepasse123");
    expect(h).not.toContain("motdepasse123");
    expect(await verifyPassword(h, "motdepasse123")).toBe(true);
    expect(await verifyPassword(h, "autrechose123")).toBe(false);
  });

  it("refuse une empreinte invalide sans planter", async () => {
    expect(await verifyPassword("pas-une-empreinte", "x")).toBe(false);
  });
});

describe("jetons", () => {
  it("génère des jetons différents et une empreinte stable", () => {
    const a = generateToken();
    const b = generateToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(40);
    expect(hashToken(a)).toBe(hashToken(a));
    expect(hashToken(a)).not.toBe(a);
  });
});

describe("blocage après échecs de connexion", () => {
  const now = new Date("2026-10-23T10:00:00Z");

  it("compte les échecs puis bloque le compte", () => {
    expect(afterFailedLogin(0, now)).toEqual({ failedLogins: 1, lockedUntil: null });
    const locked = afterFailedLogin(MAX_FAILED_LOGINS - 1, now);
    expect(locked.failedLogins).toBe(0);
    expect(locked.lockedUntil?.getTime()).toBe(now.getTime() + LOCK_MINUTES * 60_000);
  });

  it("débloque une fois le délai passé", () => {
    expect(isLocked(null, now)).toBe(false);
    expect(isLocked(new Date(now.getTime() + 1000), now)).toBe(true);
    expect(isLocked(new Date(now.getTime() - 1000), now)).toBe(false);
  });
});

describe("validation des formulaires", () => {
  it("accepte une inscription valide et met l'email en minuscules", () => {
    const r = SignupSchema.safeParse({
      name: "Donald",
      companyName: "KTZ",
      email: "  Donald@Exemple.CF ",
      password: "motdepasse123",
    });
    expect(r.success).toBe(true);
    expect(r.data?.email).toBe("donald@exemple.cf");
  });

  it("refuse un mot de passe trop faible et un email invalide", () => {
    const r = SignupSchema.safeParse({ name: "D", companyName: "K", email: "pas-un-email", password: "court" });
    expect(r.success).toBe(false);
    const errors = r.error!.flatten().fieldErrors;
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
    expect(errors.name).toBeDefined();
  });

  it("exige un mot de passe à la connexion", () => {
    expect(LoginSchema.safeParse({ email: "a@b.cf", password: "" }).success).toBe(false);
  });
});
