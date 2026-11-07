import { describe, expect, it } from "vitest";
import { decodeLogo, isInternalLogo, isValidLogo, logoPublicPath, MAX_LOGO_CHARS, normalizeWebsite } from "@/lib/company/logo";

// PNG de 1×1 pixel.
const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

describe("logo d'entreprise", () => {
  it("accepte un PNG ou un JPEG et refuse le reste", () => {
    expect(isValidLogo(PNG)).toBe(true);
    expect(isValidLogo(PNG.replace("image/png", "image/jpeg"))).toBe(true);
    expect(isValidLogo(PNG.replace("image/png", "image/svg+xml"))).toBe(false); // SVG : risque de script
    expect(isValidLogo("https://exemple.com/logo.png")).toBe(false);
    expect(isValidLogo(`${PNG}<script>`)).toBe(false);
    expect(isValidLogo("data:image/png;base64," + "A".repeat(MAX_LOGO_CHARS))).toBe(false);
  });

  it("décode le logo pour l'envoyer aux candidats et au rapport PDF", () => {
    const logo = decodeLogo(PNG);
    expect(logo?.type).toBe("image/png");
    expect(logo?.bytes.subarray(1, 4).toString()).toBe("PNG");
    expect(decodeLogo(null)).toBeNull();
    expect(decodeLogo("pas une image")).toBeNull();
  });

  it("change d'adresse à chaque nouveau logo", () => {
    expect(logoPublicPath("abc", 1000)).not.toBe(logoPublicPath("abc", 2000));
    expect(isInternalLogo(logoPublicPath("abc"))).toBe(true);
    expect(isInternalLogo("https://cdn.exemple.com/l.png")).toBe(false);
  });

  it("complète et vérifie le site web", () => {
    expect(normalizeWebsite("www.ktz-group.com")).toBe("https://www.ktz-group.com");
    expect(normalizeWebsite("http://exemple.cf/")).toBe("http://exemple.cf");
    expect(normalizeWebsite("  ")).toBe("");
    expect(normalizeWebsite("javascript:alert(1)")).toBeNull();
    expect(normalizeWebsite("pas un site")).toBeNull();
  });
});
