import { STATUS_LABELS, type CorrectionRow } from "./correction";

// Textes envoyés à la fin d'un test : remerciement au candidat, résultats + correction à l'employeur.
// Fonctions pures (sans envoi), testées dans tests/end-of-test.test.ts.

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function candidateThanks(v: {
  candidateName: string;
  companyName: string;
  testTitle: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
}) {
  const firstName = v.candidateName.trim().split(/\s+/)[0] || v.candidateName;
  const contact = [v.contactEmail, v.contactPhone].filter(Boolean).join(" ou ");
  const lines = [
    `Bonjour ${firstName},`,
    `Merci d'avoir passé le test « ${v.testTitle} » pour ${v.companyName}. Vos réponses ont bien été enregistrées.`,
    `${v.companyName} étudie maintenant les résultats et reviendra vers vous très bientôt pour la suite du recrutement.`,
    ...(contact ? [`Pour toute question : ${contact}.`] : []),
    `Bonne chance !`,
  ];
  const text = lines.join("\n\n");
  const html = `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#1f2937;max-width:520px">${lines
    .map((l) => `<p>${esc(l)}</p>`)
    .join("")}<p style="font-size:13px;color:#6b7280">${esc(v.companyName)} · envoyé avec KTZ Évalue</p></div>`;
  return { subject: `Merci pour votre test — ${v.companyName}`, text, html, whatsapp: lines.join("\n\n") };
}

const COLORS = { juste: "#047857", partiel: "#b45309", faux: "#b91c1c", attente: "#0369a1", "sans-reponse": "#6b7280" } as const;
const BG = { juste: "#ecfdf5", partiel: "#fffbeb", faux: "#fef2f2", attente: "#f0f9ff", "sans-reponse": "#f5f5f4" } as const;

export function employerResults(v: {
  candidateName: string;
  candidateContact: string;
  testTitle: string;
  globalScore: number | null;
  passThreshold: number;
  passed: boolean | null;
  pending: boolean;
  durationText: string;
  reliabilityLabel: string | null;
  skills: { name: string; score: number | null }[];
  correction: CorrectionRow[];
  url: string;
}) {
  const score = v.globalScore === null ? null : Math.round(v.globalScore);
  const verdict = score === null ? (v.pending ? "correction en cours" : "score non disponible") : v.passed ? "réussi" : "non réussi";
  const ok = v.correction.filter((r) => r.status === "juste").length;
  const subject = `${v.candidateName} a terminé « ${v.testTitle} » — ${score === null ? "résultats" : `${score}/100`}`;

  const text = [
    `${v.candidateName} (${v.candidateContact || "contact non renseigné"}) a terminé le test « ${v.testTitle} ».`,
    `Score global : ${score === null ? "—" : `${score}/100`} (${verdict}, seuil ${v.passThreshold}/100) · durée ${v.durationText} · fiabilité : ${v.reliabilityLabel ?? "—"}.`,
    `Par compétence :\n${v.skills.map((s) => `- ${s.name} : ${s.score === null ? "—" : `${Math.round(s.score)}/100`}`).join("\n")}`,
    `Correction (${ok} juste(s) sur ${v.correction.length}) :\n${v.correction
      .map((r) => `${r.n}. [${STATUS_LABELS[r.status]}${r.points === null ? "" : ` ${r.points}/${r.max}`}] ${r.prompt}\n   Réponse : ${r.given}\n   Attendu : ${r.expected}`)
      .join("\n")}`,
    `Le rapport PDF complet est joint. Fiche du candidat : ${v.url}`,
  ].join("\n\n");

  const skillRows = v.skills
    .map(
      (s) =>
        `<tr><td style="padding:4px 8px 4px 0">${esc(s.name)}</td><td style="padding:4px 0;font-weight:bold;text-align:right">${s.score === null ? "—" : `${Math.round(s.score)}/100`}</td></tr>`,
    )
    .join("");
  const correctionRows = v.correction
    .map(
      (r) => `<tr><td style="padding:10px;border-top:1px solid #e7e5e4;vertical-align:top">
<div style="font-size:12px;color:#78716c">Question ${r.n} · ${esc(r.skill)}</div>
<div style="margin:2px 0 6px;color:#1c1917">${esc(r.prompt)}</div>
<div style="font-size:14px"><b>Réponse :</b> ${esc(r.given)}</div>
<div style="font-size:14px;color:#047857"><b>Attendu :</b> ${esc(r.expected)}</div>
${r.comment ? `<div style="font-size:13px;color:#0c4a6e;font-style:italic">Avis de correction : ${esc(r.comment)}</div>` : ""}
</td><td style="padding:10px;border-top:1px solid #e7e5e4;vertical-align:top;text-align:right;white-space:nowrap"><span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:bold;color:${COLORS[r.status]};background:${BG[r.status]}">${STATUS_LABELS[r.status]}</span><div style="font-size:13px;margin-top:4px">${r.points === null ? "—" : `${r.points}/${r.max} pt`}</div></td></tr>`,
    )
    .join("");

  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.45;color:#1f2937;max-width:640px">
<p><b>${esc(v.candidateName)}</b> a terminé le test « ${esc(v.testTitle)} ».<br><span style="color:#6b7280;font-size:13px">${esc(v.candidateContact)}</span></p>
<table style="width:100%;border-collapse:collapse;background:#fff7ed;border-radius:12px"><tr>
<td style="padding:14px 16px;font-size:32px;font-weight:bold;color:#c2410c">${score === null ? "—" : `${score}<span style="font-size:16px;color:#78716c">/100</span>`}</td>
<td style="padding:14px 16px;font-size:14px;color:#44403c">${esc(verdict.charAt(0).toUpperCase() + verdict.slice(1))} · seuil ${v.passThreshold}/100<br>Durée ${esc(v.durationText)} · fiabilité : ${esc(v.reliabilityLabel ?? "—")}<br>${ok} réponse(s) juste(s) sur ${v.correction.length}</td>
</tr></table>
<h3 style="margin:22px 0 6px">Par compétence</h3><table style="width:100%;border-collapse:collapse;font-size:14px">${skillRows}</table>
<h3 style="margin:22px 0 6px">Correction question par question</h3><table style="width:100%;border-collapse:collapse;font-size:14px">${correctionRows}</table>
<p style="margin-top:22px"><a href="${esc(v.url)}" style="display:inline-block;background:#ea580c;color:#fff;padding:12px 22px;border-radius:999px;font-weight:bold;text-decoration:none">Voir la fiche du candidat</a></p>
<p style="font-size:13px;color:#6b7280">Le rapport PDF complet (scores, fiabilité, questions d'entretien et correction) est joint à cet email.<br>KTZ Évalue</p></div>`;
  return { subject, text, html };
}
