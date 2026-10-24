// Petits éléments d'affichage des résultats (barres de score, badges).
import { Hourglass, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";

function tone(v: number) {
  return v >= 70 ? "from-brand-400 to-brand-600" : v >= 50 ? "from-sun-300 to-sun-500" : "from-red-400 to-red-500";
}

export function ScoreBar({ score, label }: { score: number | null; label?: string }) {
  const v = score === null ? 0 : Math.max(0, Math.min(100, score));
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex justify-between gap-2 text-sm">
          <span className="truncate text-stone-700">{label}</span>
          <span className="shrink-0 font-bold text-stone-900">{score === null ? <span className="font-medium text-stone-400">en attente</span> : Math.round(v)}</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-stone-100" role="img" aria-label={`${label ?? "Score"} : ${score === null ? "non disponible" : Math.round(v)} sur 100`}>
        {score !== null && <div className={`h-2 rounded-full bg-gradient-to-r ${tone(v)}`} style={{ width: `${Math.max(v, 2)}%` }} />}
      </div>
    </div>
  );
}

const RELIABILITY: Record<string, { cls: string; icon: typeof ShieldCheck }> = {
  HIGH: { cls: "bg-brand-50 text-brand-800 ring-brand-200", icon: ShieldCheck },
  TO_CHECK: { cls: "bg-sun-50 text-sun-700 ring-sun-200", icon: ShieldQuestion },
  LOW: { cls: "bg-red-50 text-red-700 ring-red-200", icon: ShieldAlert },
};

export function ReliabilityBadge({ level, label }: { level: string | null; label: string | null }) {
  if (!level || !label) return <span className="text-sm text-stone-400">—</span>;
  const r = RELIABILITY[level];
  const Icon = r.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${r.cls}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

export function GlobalScore({ score, pending, passed }: { score: number | null; pending: boolean; passed: boolean | null }) {
  if (score === null) {
    return pending ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 ring-1 ring-inset ring-violet-200">
        <Hourglass className="h-3.5 w-3.5" /> Correction en cours
      </span>
    ) : (
      <span className="text-sm text-stone-400">—</span>
    );
  }
  return (
    <span className="inline-flex items-baseline gap-2 whitespace-nowrap">
      <span className="text-2xl font-extrabold tracking-tight text-stone-900">{Math.round(score)}</span>
      <span className="text-sm font-medium text-stone-400">/100</span>
      {passed !== null && (
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${passed ? "bg-brand-50 text-brand-800" : "bg-red-50 text-red-700"}`}>
          {passed ? "Réussi" : "Non réussi"}
        </span>
      )}
    </span>
  );
}
