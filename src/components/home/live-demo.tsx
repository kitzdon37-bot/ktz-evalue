"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

// Démonstration animée de la page de test du candidat, sur un téléphone :
// une question QCM, puis « remettre dans l'ordre », puis un exercice de code, en boucle.
// L'animation s'arrête quand le téléphone sort de l'écran, et reste figée si le visiteur
// a demandé moins d'animations.

const TICK_MS = 100;
const SCENE_TICKS = 52; // ≈ 5 secondes par question
const CODE = ["function ttc(ht) {", "  return Math.round(ht * 1.19);", "}"];
const CODE_LENGTH = CODE.join("\n").length;

function useTicker() {
  const [t, setT] = useState(14);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (ref.current) io.observe(ref.current);
    const id = window.setInterval(() => {
      if (visible && !document.hidden) setT((x) => x + 1);
    }, TICK_MS);
    return () => {
      window.clearInterval(id);
      io.disconnect();
    };
  }, []);
  return { t, ref };
}

function Qcm({ t }: { t: number }) {
  const chosen = t >= 12;
  const pressed = t >= 24 && t < 30;
  const saved = t >= 30;
  return (
    <>
      <p className="text-[9px] font-extrabold uppercase tracking-wider text-brand-600">QCM · une seule réponse</p>
      <p className="mt-1 text-[12px] font-bold leading-snug text-brand-600">Facture de 2 000 000 FCFA HT, TVA 19 %. Quel est le montant TTC ?</p>
      <div className="mt-2.5 space-y-1.5 text-[11px]">
        {["2 190 000 FCFA", "2 380 000 FCFA", "2 019 000 FCFA"].map((c, i) => {
          const on = chosen && i === 1;
          return (
            <div
              key={c}
              className={`flex items-center gap-2 rounded-xl border-2 px-2 py-1.5 transition-all duration-300 ${on ? "border-brand-500 bg-brand-50 text-stone-900 shadow-md shadow-brand-500/20" : "border-stone-200 text-stone-700"}`}
            >
              <span
                className={`grid h-5 w-5 place-items-center rounded-md text-[9px] font-extrabold transition-all duration-300 ${on ? "scale-110 bg-brand-500 text-white" : "border border-stone-200 bg-stone-50 text-stone-500"}`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{c}</span>
              <span className={`grid h-4 w-4 place-items-center rounded-full transition-all duration-300 ${on ? "scale-100 bg-brand-500" : "scale-75 border border-stone-200"}`}>
                {on && <Check className="h-2.5 w-2.5 text-white" strokeWidth={4} />}
              </span>
            </div>
          );
        })}
      </div>
      <div
        className={`mt-2.5 rounded-xl py-2 text-center text-[11px] font-bold text-white transition-all duration-200 ${saved ? "bg-emerald-500" : "bg-brand-600"} ${pressed ? "scale-95" : ""}`}
      >
        {saved ? "✓ Réponse enregistrée" : chosen ? "Valider ma réponse" : "Passer cette question"}
      </div>
    </>
  );
}

const EVENTS = ["Union africaine", "OUA", "Indépendance de la RCA"];
const SORTED = [2, 1, 0]; // bon ordre : indépendance (1960), OUA (1963), UA (2002)

function Ordering({ t }: { t: number }) {
  // Position de chaque élément : d'abord mélangés, puis rangés un par un.
  // Étape 1 : « Indépendance » glisse en tête ; étape 2 : « OUA » passe avant « Union africaine ».
  const order = t < 14 ? [0, 1, 2] : t < 26 ? [2, 0, 1] : SORTED;
  const moving = t >= 14 && t < 22 ? 2 : t >= 26 && t < 34 ? 1 : -1;
  const pos = (item: number) => order.indexOf(item);
  return (
    <>
      <p className="text-[9px] font-extrabold uppercase tracking-wider text-brand-600">Remettre dans l&apos;ordre</p>
      <p className="mt-1 text-[12px] font-bold leading-snug text-brand-600">Du plus ancien au plus récent :</p>
      <div className="relative mt-2.5 h-[104px] text-[11px]">
        {EVENTS.map((e, item) => (
          <div
            key={e}
            className={`absolute inset-x-0 flex items-center gap-2 rounded-xl border-2 bg-white px-2 py-1.5 transition-all duration-500 ease-out ${item === moving ? "z-10 scale-[1.04] border-brand-500 shadow-lg shadow-brand-500/25" : "border-stone-200"}`}
            style={{ top: pos(item) * 35 }}
          >
            <span className="flex flex-col gap-[3px]" aria-hidden="true">
              <span className="h-[2px] w-2.5 rounded bg-stone-300" />
              <span className="h-[2px] w-2.5 rounded bg-stone-300" />
            </span>
            <span className="grid h-4 w-4 place-items-center rounded-full bg-brand-500 text-[8px] font-extrabold text-white">{pos(item) + 1}</span>
            <span className="text-stone-800">{e}</span>
          </div>
        ))}
      </div>
      <div className={`mt-1.5 rounded-xl py-2 text-center text-[11px] font-bold text-white transition-colors duration-300 ${t >= 36 ? "bg-emerald-500" : "bg-brand-600"}`}>
        {t >= 36 ? "✓ Bon ordre !" : "Valider ma réponse"}
      </div>
    </>
  );
}

function Code({ t }: { t: number }) {
  const typed = Math.min(CODE_LENGTH, Math.max(0, (t - 4) * 3));
  const text = CODE.join("\n").slice(0, typed);
  const done = typed >= CODE_LENGTH;
  return (
    <>
      <p className="text-[9px] font-extrabold uppercase tracking-wider text-brand-600">Exercice de code · JavaScript</p>
      <p className="mt-1 text-[12px] font-bold leading-snug text-brand-600">Écrivez ttc(ht) avec une TVA de 19 %.</p>
      <pre className="mt-2 h-[62px] overflow-hidden rounded-lg bg-ink-800 p-2 font-mono text-[9px] leading-relaxed text-stone-100">
        {text}
        <span className="caret">▍</span>
      </pre>
      <div className="mt-1.5 space-y-1 font-mono text-[9px]">
        {[
          ["ttc(1000)", "1190"],
          ["ttc(2000000)", "2380000"],
        ].map(([call, out], i) => {
          const ok = done && t >= 38 + i * 4;
          return (
            <div key={call} className={`flex items-center justify-between rounded-md px-1.5 py-1 transition-colors duration-300 ${ok ? "bg-emerald-50 text-emerald-800" : "bg-stone-50 text-stone-500"}`}>
              <span>
                {call} → {out}
              </span>
              <span className="font-sans font-bold">{ok ? "✓ Réussi" : "…"}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function LiveDemo() {
  const { t, ref } = useTicker();
  const scene = Math.floor(t / SCENE_TICKS) % 3;
  const local = t % SCENE_TICKS;
  const index = 4 + scene;
  const seconds = 59 - Math.floor(local / 10);
  const fading = local >= SCENE_TICKS - 4;

  return (
    <div ref={ref} className="w-[240px] rounded-[2.3rem] border-[9px] border-ink-900 bg-ink-900 shadow-2xl shadow-stone-900/40">
      <div className="overflow-hidden rounded-[1.7rem] bg-[#f7f5f1]">
        <div className="flex items-center justify-between px-4 pb-2 pt-3.5 text-[10px] text-stone-500">
          <span>
            Question <b className="text-stone-900">{index}</b> sur 15
          </span>
          <span className="relative grid h-9 w-9 place-items-center">
            <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#ece8e1" strokeWidth="3.5" />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="#f97316"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="94.2"
                strokeDashoffset={(94.2 * (1 - seconds / 60)).toFixed(1)}
                className="transition-[stroke-dashoffset] duration-1000 ease-linear"
              />
            </svg>
            <span className="text-[9px] font-extrabold tabular-nums text-stone-900">0:{String(seconds).padStart(2, "0")}</span>
          </span>
        </div>
        <div className="mx-4 h-1.5 overflow-hidden rounded-full bg-stone-200">
          <div className="bar-shine h-1.5 rounded-full bg-brand-500 transition-[width] duration-700" style={{ width: `${(index / 15) * 100}%` }} />
        </div>
        <div
          key={scene}
          className={`demo-card relative m-3 overflow-hidden rounded-2xl bg-white p-3.5 shadow-sm transition-all duration-300 ${fading ? "-translate-x-3 opacity-0" : ""}`}
        >
          <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600" />
          {scene === 0 && <Qcm t={local} />}
          {scene === 1 && <Ordering t={local} />}
          {scene === 2 && <Code t={local} />}
        </div>
        <p className="pb-3 text-center text-[9px] text-stone-400">Réponses sauvegardées sur le téléphone</p>
      </div>
    </div>
  );
}
