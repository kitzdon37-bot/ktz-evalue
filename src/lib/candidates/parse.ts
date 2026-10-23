// Lecture d'une liste de candidats (texte collé, CSV ou Excel) : nom, email, téléphone.
// Les colonnes sont reconnues par leur contenu, dans n'importe quel ordre.
// Fonctions pures, testées dans tests/candidates.test.ts.
import { normalizePhone } from "@/lib/phone";

export type ParsedCandidate = { name: string; email: string | null; phone: string | null };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEADER_RE = /^(nom|name|pr[ée]nom|email|e-mail|mail|t[ée]l[ée]phone|phone|t[ée]l|whatsapp|contact)/i;

// Découpe un texte CSV ou collé en lignes et colonnes (séparateurs ; , ou tabulation).
export function splitRows(text: string): string[][] {
  return text
    .replace(/^﻿/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const sep = line.includes("\t") ? "\t" : line.includes(";") ? ";" : ",";
      return line.split(sep).map((cell) => cell.trim().replace(/^"(.*)"$/, "$1").trim());
    });
}

export function parseCandidates(rows: string[][], country = "CF") {
  const valid: ParsedCandidate[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();

  rows.forEach((cells, i) => {
    const line = i + 1;
    const nonEmpty = cells.filter(Boolean);
    if (nonEmpty.length === 0) return;
    // Ligne d'en-tête (« Nom ; Email ; Téléphone ») : ignorée.
    if (i === 0 && nonEmpty.every((c) => HEADER_RE.test(c))) return;

    let email: string | null = null;
    let phone: string | null = null;
    const nameParts: string[] = [];
    for (const cell of nonEmpty) {
      if (!email && EMAIL_RE.test(cell)) email = cell.toLowerCase();
      else if (!phone && /^[+\d][\d\s.\-()]{6,}$/.test(cell)) phone = normalizePhone(cell, country) ?? "invalide";
      else nameParts.push(cell);
    }
    const name = nameParts.join(" ").replace(/\s+/g, " ").trim();
    if (phone === "invalide") {
      errors.push(`Ligne ${line} : numéro de téléphone non reconnu.`);
      return;
    }
    if (!email && !phone) {
      errors.push(`Ligne ${line} : il faut un email ou un numéro de téléphone.`);
      return;
    }
    if (name.length < 2) {
      errors.push(`Ligne ${line} : nom manquant.`);
      return;
    }
    const key = email ?? phone!;
    if (seen.has(key)) return; // doublon dans la liste
    seen.add(key);
    valid.push({ name: name.slice(0, 100), email, phone });
  });

  return { valid, errors };
}
