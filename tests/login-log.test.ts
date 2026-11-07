import { describe, expect, it } from "vitest";
import { describeDevice, describePlace, mapUrl, requestInfo } from "@/lib/auth/login-log";

const headers = (h: Record<string, string>) => ({ get: (k: string) => h[k.toLowerCase()] ?? null });

describe("journal des connexions", () => {
  it("lit l'adresse IP et le lieu donnés par l'hébergeur", () => {
    const info = requestInfo(
      headers({
        "x-forwarded-for": "41.78.12.9, 10.0.0.1",
        "user-agent": "Mozilla/5.0 (Linux; Android 13) Chrome/120 Mobile",
        "x-vercel-ip-country": "cf",
        "x-vercel-ip-city": "Bangui",
        "x-vercel-ip-country-region": "BGF",
      }),
    );
    expect(info).toMatchObject({ ip: "41.78.12.9", country: "CF", city: "Bangui", region: "BGF" });
  });

  it("décode les villes avec accents et reste vide sans en-têtes", () => {
    expect(requestInfo(headers({ "x-vercel-ip-city": "Bob%C3%B4-Dioulasso" })).city).toBe("Bobô-Dioulasso");
    expect(requestInfo(headers({}))).toEqual({ ip: null, userAgent: null, country: null, region: null, city: null });
  });

  it("décrit l'appareil en français", () => {
    expect(describeDevice("Mozilla/5.0 (Linux; Android 13) AppleWebKit Chrome/120 Mobile Safari/537")).toEqual({ label: "Chrome sur Android", mobile: true });
    expect(describeDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit Version/17 Mobile Safari/604")).toEqual({ label: "Safari sur iPhone", mobile: true });
    expect(describeDevice("Mozilla/5.0 (Windows NT 10.0) AppleWebKit Chrome/120 Safari/537 Edg/120").label).toBe("Edge sur Windows");
    expect(describeDevice(null).label).toBe("Appareil inconnu");
  });

  it("affiche le lieu avec le drapeau et un lien vers la carte", () => {
    expect(describePlace({ country: "CF", city: "Bangui" })).toBe("Bangui, 🇨🇫 Centrafrique");
    expect(describePlace({ ip: "::1" })).toBe("Réseau local (test)");
    expect(describePlace({ ip: "41.78.12.9" })).toBe("Lieu inconnu");
    expect(mapUrl({ country: "CF", city: "Bangui" })).toContain("openstreetmap.org/search?query=Bangui");
    expect(mapUrl({})).toBeNull();
  });
});
