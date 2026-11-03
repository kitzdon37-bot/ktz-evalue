import "server-only";
import PDFDocument from "pdfkit";

export type CandidateReport = {
  companyName: string;
  companyColor: string | null;
  logo: Buffer | null;
  testTitle: string;
  candidateName: string;
  candidateContact: string;
  completedAt: Date | null;
  durationText: string;
  globalScore: number | null;
  passThreshold: number;
  passed: boolean | null;
  pending: boolean;
  skills: { name: string; weight: number; score: number | null }[];
  reliabilityLabel: string | null;
  reliabilitySummary: string | null;
  interviewQuestions: string[];
  recruiterStatus: string;
};

// Rapport PDF d'un candidat : logo, scores, fiabilité, points forts et points à vérifier en entretien.
export function renderCandidateReport(r: CandidateReport): Promise<Buffer> {
  const color = /^#[0-9a-fA-F]{6}$/.test(r.companyColor ?? "") ? r.companyColor! : "#ea580c";
  const doc = new PDFDocument({ size: "A4", margin: 50, info: { Title: `${r.candidateName} — ${r.testTitle}`, Author: "KTZ Évalue" } });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  const width = doc.page.width - 100;

  // En-tête
  if (r.logo) {
    try {
      doc.image(r.logo, 50, 45, { fit: [120, 45] });
    } catch {
      // logo illisible : on continue sans
    }
  }
  doc.fillColor(color).font("Helvetica-Bold").fontSize(11).text(r.companyName, 50, 50, { width, align: "right" });
  doc.fillColor("#6b7280").font("Helvetica").fontSize(9).text("Rapport d'évaluation — KTZ Évalue", { width, align: "right" });
  doc.moveDown(3);

  doc.fillColor("#111827").font("Helvetica-Bold").fontSize(20).text(r.candidateName, 50);
  doc.font("Helvetica").fontSize(10).fillColor("#4b5563").text(r.candidateContact);
  doc.text(`${r.testTitle}${r.completedAt ? ` · terminé le ${r.completedAt.toLocaleDateString("fr-FR", { timeZone: "Africa/Bangui" })}` : ""} · durée ${r.durationText}`);
  doc.moveDown(1.2);

  // Score global
  const boxY = doc.y;
  doc.roundedRect(50, boxY, width, 62, 6).fill("#f3f4f6");
  doc.fillColor("#111827").font("Helvetica-Bold").fontSize(28).text(r.globalScore === null ? "—" : `${Math.round(r.globalScore)}/100`, 66, boxY + 14);
  const verdict = r.globalScore === null ? (r.pending ? "Correction en cours" : "Non disponible") : r.passed ? "Réussi" : "Non réussi";
  doc.font("Helvetica").fontSize(11).fillColor("#374151").text(`${verdict} · seuil ${r.passThreshold}/100`, 220, boxY + 18);
  doc.text(`Fiabilité : ${r.reliabilityLabel ?? "—"} · Statut : ${r.recruiterStatus}`, 220, boxY + 35);
  doc.y = boxY + 80;

  // Scores par compétence
  doc.x = 50;
  doc.fillColor("#111827").font("Helvetica-Bold").fontSize(13).text("Score par compétence");
  doc.moveDown(0.5);
  for (const s of r.skills) {
    const y = doc.y;
    doc.font("Helvetica").fontSize(10).fillColor("#111827").text(`${s.name} (${s.weight} %)`, 50, y, { width: 230 });
    doc.roundedRect(290, y + 2, 200, 8, 4).fill("#e5e7eb");
    if (s.score !== null) doc.roundedRect(290, y + 2, Math.max(4, (200 * s.score) / 100), 8, 4).fill(color);
    doc.fillColor("#111827").font("Helvetica-Bold").text(s.score === null ? "—" : `${Math.round(s.score)}`, 500, y, { width: 45, align: "right" });
    doc.y = Math.max(doc.y, y + 18);
  }
  doc.moveDown(1);

  // Points forts / points à vérifier
  const strong = r.skills.filter((s) => s.score !== null && s.score >= 70).map((s) => s.name);
  const weak = r.skills.filter((s) => s.score !== null && s.score < 50).map((s) => s.name);
  doc.x = 50;
  doc.font("Helvetica-Bold").fontSize(13).fillColor("#111827").text("Points forts");
  doc.font("Helvetica").fontSize(10).fillColor("#374151").text(strong.length ? strong.join(", ") : "Aucune compétence au-dessus de 70/100.");
  doc.moveDown(0.8);
  doc.font("Helvetica-Bold").fontSize(13).fillColor("#111827").text("Points à vérifier en entretien");
  doc.font("Helvetica").fontSize(10).fillColor("#374151");
  if (weak.length) doc.text(`Compétences sous 50/100 : ${weak.join(", ")}.`);
  if (r.interviewQuestions.length) {
    doc.moveDown(0.3);
    for (const q of r.interviewQuestions) doc.text(`• ${q}`, { width });
  }
  if (!weak.length && !r.interviewQuestions.length) doc.text("Rien de particulier.");
  doc.moveDown(0.8);

  // Fiabilité
  doc.font("Helvetica-Bold").fontSize(13).fillColor("#111827").text("Fiabilité du passage");
  doc.font("Helvetica").fontSize(10).fillColor("#374151").text(`${r.reliabilityLabel ?? "—"} : ${r.reliabilitySummary ?? "aucun signal"}.`);
  doc.fontSize(8).fillColor("#6b7280").text("Ces signaux sont des indices : aucun candidat n'est exclu automatiquement.");

  doc.fontSize(8).fillColor("#9ca3af").text(`Document confidentiel — généré le ${new Date().toLocaleDateString("fr-FR", { timeZone: "Africa/Bangui" })} par KTZ Évalue.`, 50, doc.page.height - 60, { width, align: "center" });
  doc.end();
  return done;
}
