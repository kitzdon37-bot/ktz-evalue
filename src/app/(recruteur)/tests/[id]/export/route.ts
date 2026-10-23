// Export du classement d'un test en CSV ou en Excel.
import { NextResponse, type NextRequest } from "next/server";
import writeXlsxFile from "write-excel-file/node";
import { requireCompany } from "@/lib/tenant";
import { getTestResults, sortRows } from "@/lib/results-view";

function slug(s: string) {
  return (
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase()
      .slice(0, 50) || "test"
  );
}

function csvCell(v: string | number | null) {
  // Nombres avec une virgule décimale, comme l'attend Excel en français.
  const s = v === null ? "" : typeof v === "number" ? String(v).replace(".", ",") : v;
  // Protège contre l'injection de formules dans Excel (cellule commençant par = + - @),
  // sauf pour les numéros de téléphone (+236…).
  const safe = /^[=+\-@]/.test(s) && !/^\+\d{6,15}$/.test(s) ? `'${s}` : s;
  return /[;"\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export async function GET(req: NextRequest, ctx: RouteContext<"/tests/[id]/export">) {
  const { id } = await ctx.params;
  const user = await requireCompany();
  const { test, skills, rows } = await getTestResults(id, user.companyId);
  const format = req.nextUrl.searchParams.get("format") === "xlsx" ? "xlsx" : "csv";
  const sorted = sortRows(rows, "score");

  const header = [
    "Rang",
    "Nom",
    "Email",
    "Téléphone",
    "Score global /100",
    "Résultat",
    ...skills.map((s) => `${s.name} /100`),
    "Fiabilité",
    "Signaux",
    "Statut",
    "Note interne",
    "Terminé le",
    "Durée (min)",
  ];
  const data = sorted.map((r, i) => [
    r.globalScore !== null ? i + 1 : null,
    r.name,
    r.email,
    r.phone,
    r.globalScore,
    r.passed === null ? (r.gradingPending ? "Correction en cours" : r.finished ? "" : "En cours") : r.passed ? "Réussi" : "Non réussi",
    ...r.skillScores.map((s) => (r.finished ? s.score : null)),
    r.reliabilityLabel,
    r.reliabilitySummary,
    r.recruiterStatusLabel,
    r.recruiterNote,
    r.completedAt ? r.completedAt.toLocaleString("fr-FR", { timeZone: "Africa/Bangui" }) : null,
    r.durationSec === null ? null : Math.round(r.durationSec / 6) / 10,
  ]);
  const filename = `resultats-${slug(test.title)}`;

  if (format === "csv") {
    // Point-virgule et BOM UTF-8 : s'ouvre correctement dans Excel en français.
    const csv = "﻿" + [header, ...data].map((row) => row.map(csvCell).join(";")).join("\r\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const sheet = [
    header.map((h) => ({ value: h, fontWeight: "bold" as const })),
    ...data.map((row) => row.map((v) => (v === null || v === undefined ? null : { value: v }))),
  ];
  const buffer = await writeXlsxFile(sheet, { columns: header.map((h, i) => ({ width: i === 1 ? 28 : Math.max(12, h.length + 2) })) }).toBuffer();
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
