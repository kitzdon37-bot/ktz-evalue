// Journal des connexions : qui, quand, comment, depuis quel appareil et quel lieu (approximatif).
// Le lieu vient des en-têtes ajoutés par l'hébergeur (Vercel) à partir de l'adresse IP :
// aucune adresse n'est envoyée à un service extérieur. En local, le lieu reste vide.

export type LoginMethod = "password" | "google" | "magic_link" | "signup" | "invitation" | "reset";

export const METHOD_LABELS: Record<string, string> = {
  password: "Mot de passe",
  google: "Google",
  magic_link: "Lien par email",
  signup: "Inscription",
  invitation: "Invitation d'équipe",
  reset: "Nouveau mot de passe",
};

export type RequestInfo = { ip: string | null; userAgent: string | null; country: string | null; region: string | null; city: string | null };

type HeaderBag = { get(name: string): string | null };

function decode(v: string | null): string | null {
  if (!v) return null;
  try {
    return decodeURIComponent(v).slice(0, 80);
  } catch {
    return v.slice(0, 80);
  }
}

export function requestInfo(h: HeaderBag): RequestInfo {
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "").trim() || null;
  return {
    ip: ip?.slice(0, 60) ?? null,
    userAgent: h.get("user-agent")?.slice(0, 300) ?? null,
    country: h.get("x-vercel-ip-country")?.slice(0, 2).toUpperCase() ?? null,
    region: decode(h.get("x-vercel-ip-country-region")),
    city: decode(h.get("x-vercel-ip-city")),
  };
}

// « Chrome sur Android (téléphone) » à partir de l'identifiant du navigateur.
export function describeDevice(ua: string | null | undefined): { label: string; mobile: boolean } {
  if (!ua) return { label: "Appareil inconnu", mobile: false };
  const os = /Android/i.test(ua)
    ? "Android"
    : /iPhone/i.test(ua)
      ? "iPhone"
      : /iPad/i.test(ua)
        ? "iPad"
        : /Windows/i.test(ua)
          ? "Windows"
          : /Mac OS X|Macintosh/i.test(ua)
            ? "Mac"
            : /CrOS/i.test(ua)
              ? "Chromebook"
              : /Linux/i.test(ua)
                ? "Linux"
                : "système inconnu";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /SamsungBrowser/.test(ua)
        ? "Samsung Internet"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Chrome\//.test(ua)
            ? "Chrome"
            : /Safari\//.test(ua)
              ? "Safari"
              : /curl|bot|spider|crawl/i.test(ua)
                ? "Robot"
                : "Navigateur inconnu";
  const mobile = /Mobi|Android|iPhone|iPad/i.test(ua);
  return { label: `${browser} sur ${os}`, mobile };
}

const COUNTRY_NAMES: Record<string, string> = {
  CF: "Centrafrique",
  CM: "Cameroun",
  TD: "Tchad",
  CG: "Congo",
  CD: "RD Congo",
  GA: "Gabon",
  GQ: "Guinée équatoriale",
  SN: "Sénégal",
  CI: "Côte d'Ivoire",
  BJ: "Bénin",
  TG: "Togo",
  BF: "Burkina Faso",
  ML: "Mali",
  NE: "Niger",
  GN: "Guinée",
  MA: "Maroc",
  TN: "Tunisie",
  DZ: "Algérie",
  FR: "France",
  BE: "Belgique",
  CH: "Suisse",
  CA: "Canada",
  US: "États-Unis",
  GB: "Royaume-Uni",
  DE: "Allemagne",
};

function flag(code: string) {
  return /^[A-Z]{2}$/.test(code) ? String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0))) : "";
}

export function describePlace(p: { country?: string | null; region?: string | null; city?: string | null; ip?: string | null }): string {
  if (!p.country && !p.city) {
    if (!p.ip || /^(::1|127\.|::ffff:127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(p.ip)) return "Réseau local (test)";
    return "Lieu inconnu";
  }
  const country = p.country ? `${flag(p.country)} ${COUNTRY_NAMES[p.country] ?? p.country}` : "";
  return [p.city, country].filter(Boolean).join(", ");
}

export function mapUrl(p: { country?: string | null; region?: string | null; city?: string | null }): string | null {
  if (!p.city && !p.country) return null;
  const q = [p.city, p.region, p.country ? (COUNTRY_NAMES[p.country] ?? p.country) : null].filter(Boolean).join(", ");
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(q)}`;
}
