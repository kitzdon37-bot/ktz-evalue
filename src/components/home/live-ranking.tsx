"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";

// Classement qui se met à jour tout seul : un nouveau candidat termine son test toutes les
// quelques secondes et prend sa place dans la liste (exemple fictif, noms d'illustration).
const POOL: [string, number][] = [
  ["Grâce K.", 92],
  ["Paul M.", 58],
  ["Fatou S.", 81],
  ["Rodrigue B.", 67],
  ["Esther N.", 88],
  ["Ibrahim A.", 73],
];
const START: [string, number][] = [
  ["Marie Y.", 86],
  ["Jean N.", 74],
  ["Aïcha D.", 61],
];
const ROW = 40;
const VISIBLE = 4;

export function LiveRanking({ className = "" }: { className?: string }) {
  const [rows, setRows] = useState<{ name: string; score: number; fresh: boolean }[]>(
    START.map(([name, score]) => ({ name, score, fresh: false })),
  );
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    const g = window.setTimeout(() => setGrown(true), 400);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => window.clearTimeout(g);
    let k = 0;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      const [name, score] = POOL[k++ % POOL.length];
      setRows((r) => {
        const next = [...r.filter((x) => x.name !== name).map((x) => ({ ...x, fresh: false })), { name, score, fresh: true }];
        next.sort((a, b) => b.score - a.score);
        // On garde les meilleurs, et toujours le nouveau venu.
        const kept = next.slice(0, VISIBLE);
        if (!kept.some((x) => x.fresh)) kept[VISIBLE - 1] = next.find((x) => x.fresh)!;
        return kept.sort((a, b) => b.score - a.score);
      });
    }, 3600);
    return () => {
      window.clearTimeout(g);
      window.clearInterval(id);
    };
  }, []);

  const names = rows.map((r) => r.name);
  return (
    <div className={`w-64 rounded-2xl bg-white/95 p-4 text-stone-900 shadow-lift ring-1 ring-stone-200/70 backdrop-blur ${className}`}>
      <p className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-500">
        <span className="flex items-center gap-2">
          <span className="live-dot" aria-hidden="true" /> Classement en direct
        </span>
        <BarChart3 className="h-3.5 w-3.5 text-brand-500" />
      </p>
      <div className="relative" style={{ height: VISIBLE * ROW }}>
        {rows.map((r) => {
          const i = names.indexOf(r.name);
          return (
            <div
              key={r.name}
              className={`absolute inset-x-0 transition-all duration-700 ease-out ${r.fresh ? "rank-in" : ""}`}
              style={{ transform: `translateY(${i * ROW}px)` }}
            >
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-800">
                  {i + 1}. {r.name}
                  {r.fresh && <span className="ml-1.5 rounded-full bg-brand-100 px-1.5 py-0.5 text-[9px] font-bold text-brand-700">nouveau</span>}
                </span>
                <span className="font-bold tabular-nums">{r.score}</span>
              </div>
              <div className="h-1.5 rounded-full bg-stone-100">
                <div
                  className={`h-1.5 rounded-full transition-[width] duration-1000 ease-out ${r.score >= 70 ? "bg-emerald-500" : "bg-sun-400"}`}
                  style={{ width: grown || r.fresh ? `${r.score}%` : "0%" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
