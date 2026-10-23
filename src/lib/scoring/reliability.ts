// Indice de fiabilité d'un passage (section 7 du cahier des charges) :
// « Élevée », « À vérifier » ou « Faible », avec la liste lisible des signaux.
// Aucun candidat n'est exclu automatiquement : le recruteur décide.
// Fonctions pures, testées dans tests/results.test.ts.

export type IntegritySignal = {
  type: string;
  durationMs: number | null;
};

export type ReliabilityLevel = "HIGH" | "TO_CHECK" | "LOW";

export const RELIABILITY_LABELS: Record<ReliabilityLevel, string> = {
  HIGH: "Élevée",
  TO_CHECK: "À vérifier",
  LOW: "Faible",
};

const LONG_ABSENCE_MS = 10_000;

// Poids de chaque signal dans l'indice (faible = 1, moyen = 2, fort = 4).
function weight(s: IntegritySignal): number {
  switch (s.type) {
    case "TAB_HIDDEN":
      return (s.durationMs ?? 0) > LONG_ABSENCE_MS ? 3 : 2;
    case "FULLSCREEN_EXIT":
      return 1;
    case "PASTE":
      return 4;
    case "FAST_ANSWER":
      return 2;
    case "DEVICE_CHANGE":
      return 2;
    case "SIMILAR_TEXT":
      return 4;
    case "NO_FACE":
    case "CAMERA_OFF":
      return 2;
    case "MULTIPLE_FACES":
      return 4;
    default:
      return 1;
  }
}

const NAMES: Record<string, [string, string]> = {
  TAB_HIDDEN: ["sortie d'onglet", "sorties d'onglet"],
  FULLSCREEN_EXIT: ["sortie du plein écran", "sorties du plein écran"],
  PASTE: ["texte collé", "textes collés"],
  FAST_ANSWER: ["réponse anormalement rapide", "réponses anormalement rapides"],
  DEVICE_CHANGE: ["changement d'appareil", "changements d'appareil"],
  SIMILAR_TEXT: ["réponse très proche de celle d'un autre candidat", "réponses très proches de celles d'autres candidats"],
  NO_FACE: ["photo sans visage", "photos sans visage"],
  MULTIPLE_FACES: ["photo avec plusieurs personnes", "photos avec plusieurs personnes"],
  CAMERA_OFF: ["caméra coupée", "caméra coupée"],
};

function seconds(ms: number) {
  return `${Math.max(1, Math.round(ms / 1000))} s`;
}

export function reliability(signals: IntegritySignal[]): { level: ReliabilityLevel; summary: string } {
  const total = signals.reduce((a, s) => a + weight(s), 0);
  const level: ReliabilityLevel = total <= 2 ? "HIGH" : total <= 6 ? "TO_CHECK" : "LOW";

  const groups = new Map<string, IntegritySignal[]>();
  for (const s of signals) groups.set(s.type, [...(groups.get(s.type) ?? []), s]);
  const parts: string[] = [];
  for (const [type, list] of groups) {
    const [one, many] = NAMES[type] ?? [type.toLowerCase(), type.toLowerCase()];
    let text = `${list.length} ${list.length > 1 ? many : one}`;
    if (type === "TAB_HIDDEN") {
      const durations = list.filter((s) => s.durationMs).map((s) => seconds(s.durationMs!));
      if (durations.length) text += ` (${durations.slice(0, 5).join(", ")}${durations.length > 5 ? "…" : ""})`;
    }
    parts.push(text);
  }
  return { level, summary: parts.length ? parts.join(", ") : "Aucun signal" };
}

// ───── Textes très proches entre candidats ─────

function shingles(text: string, size = 3): Set<string> {
  const words = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  const out = new Set<string>();
  for (let i = 0; i + size <= words.length; i++) out.add(words.slice(i, i + size).join(" "));
  return out;
}

// Similarité de Jaccard entre deux textes (0 = rien en commun, 1 = identiques).
export function textSimilarity(a: string, b: string): number {
  const sa = shingles(a);
  const sb = shingles(b);
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const s of sa) if (sb.has(s)) inter++;
  return inter / (sa.size + sb.size - inter);
}

export const SIMILARITY_THRESHOLD = 0.6;
export const SIMILARITY_MIN_LENGTH = 80;
