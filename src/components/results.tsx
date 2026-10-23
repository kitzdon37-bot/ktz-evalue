// Petits éléments d'affichage des résultats (barres de score, badges).

export function ScoreBar({ score, label }: { score: number | null; label?: string }) {
  const v = score === null ? 0 : Math.max(0, Math.min(100, score));
  const color = score === null ? "bg-gray-300" : v >= 70 ? "bg-teal-600" : v >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div>
      {label && (
        <div className="mb-1 flex justify-between gap-2 text-sm">
          <span className="text-gray-800">{label}</span>
          <span className="font-semibold text-gray-900">{score === null ? "—" : `${Math.round(v)}/100`}</span>
        </div>
      )}
      <div className="h-2.5 rounded-full bg-gray-200" role="img" aria-label={`${label ?? "Score"} : ${score === null ? "non disponible" : Math.round(v)}`}>
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

const RELIABILITY_STYLES: Record<string, string> = {
  HIGH: "bg-teal-100 text-teal-900",
  TO_CHECK: "bg-amber-100 text-amber-900",
  LOW: "bg-red-100 text-red-800",
};

export function ReliabilityBadge({ level, label }: { level: string | null; label: string | null }) {
  if (!level || !label) return <span className="text-sm text-gray-500">—</span>;
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${RELIABILITY_STYLES[level]}`}>{label}</span>;
}

export function GlobalScore({ score, pending, passed }: { score: number | null; pending: boolean; passed: boolean | null }) {
  if (score === null) {
    return <span className="text-sm text-gray-600">{pending ? "Correction en cours" : "—"}</span>;
  }
  return (
    <span className="whitespace-nowrap">
      <span className="text-lg font-bold text-gray-900">{Math.round(score)}</span>
      <span className="text-sm text-gray-500">/100</span>
      {passed !== null && (
        <span className={`ml-2 text-xs font-semibold ${passed ? "text-teal-800" : "text-red-700"}`}>{passed ? "Réussi" : "Non réussi"}</span>
      )}
    </span>
  );
}
