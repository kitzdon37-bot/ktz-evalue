// Mise au format international (E.164) d'un numéro de téléphone saisi librement.
const DIAL_CODES: Record<string, { code: string; length: number }> = {
  CF: { code: "236", length: 8 },
  CM: { code: "237", length: 9 },
  CG: { code: "242", length: 9 },
  CD: { code: "243", length: 9 },
  GA: { code: "241", length: 8 },
  TD: { code: "235", length: 8 },
  SN: { code: "221", length: 9 },
  CI: { code: "225", length: 10 },
};

// Renvoie « +23675123456 », ou null si le numéro n'est pas exploitable.
export function normalizePhone(input: string, country = "CF"): string | null {
  let s = input.trim().replace(/[\s.\-()]/g, "");
  if (!s) return null;
  if (s.startsWith("00")) s = `+${s.slice(2)}`;
  if (s.startsWith("+")) {
    return /^\+\d{8,15}$/.test(s) ? s : null;
  }
  if (!/^\d+$/.test(s)) return null;
  const local = DIAL_CODES[country];
  if (local && s.length === local.length) return `+${local.code}${s}`;
  // Numéro déjà saisi avec l'indicatif, sans le « + ».
  if (s.length >= 10 && s.length <= 15) return `+${s}`;
  return null;
}
