// Logo d'entreprise : envoyé depuis la fiche entreprise, compressé dans le navigateur
// (PNG ou JPEG, 512 px maximum), puis gardé en base sous forme de « data URL ».
// Les pages candidat le chargent par une adresse courte (/logo/<id>?v=…) pour rester légères.

export const MAX_LOGO_CHARS = 400_000; // ≈ 300 Ko d'image
const LOGO_RE = /^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/;

export function isValidLogo(dataUrl: string): boolean {
  return dataUrl.length <= MAX_LOGO_CHARS && LOGO_RE.test(dataUrl);
}

export function decodeLogo(dataUrl: string | null | undefined): { type: string; bytes: Buffer } | null {
  if (!dataUrl) return null;
  const m = LOGO_RE.exec(dataUrl);
  if (!m) return null;
  return { type: `image/${m[1]}`, bytes: Buffer.from(m[2], "base64") };
}

export function logoPublicPath(companyId: string, version = Date.now()): string {
  return `/logo/${companyId}?v=${version.toString(36)}`;
}

// Le logo est-il servi par KTZ Évalue (et donc lisible directement en base) ?
export function isInternalLogo(url: string | null | undefined): boolean {
  return Boolean(url && url.startsWith("/logo/"));
}

// Site web saisi par l'entreprise : on ajoute https:// si besoin, et on refuse tout le reste.
export function normalizeWebsite(raw: string): string | null {
  const v = raw.trim();
  if (!v) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    if (!/^https?:$/.test(url.protocol) || !url.hostname.includes(".")) return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}
