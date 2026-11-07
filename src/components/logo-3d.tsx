"use client";

import { useEffect, useRef } from "react";

// Logo KTZ Évalue en 3D pour la page de connexion : un badge épais qui pivote,
// fait un tour complet de temps en temps, suit la souris, avec anneaux en orbite,
// coche qui se dessine, étincelle qui scintille et reflet qui balaie la face.
// Tout est en CSS (aucune bibliothèque 3D) : léger et fluide, même sur un petit ordinateur.

const LAYERS = 10; // épaisseur du badge (tranches empilées)
const PARTICLES = [
  { left: "12%", delay: "0s", dur: "7s", size: 6 },
  { left: "28%", delay: "2.4s", dur: "9s", size: 4 },
  { left: "46%", delay: "1.1s", dur: "8s", size: 5 },
  { left: "63%", delay: "3.6s", dur: "10s", size: 3 },
  { left: "78%", delay: "0.7s", dur: "7.5s", size: 6 },
  { left: "90%", delay: "4.8s", dur: "9.5s", size: 4 },
];

function Face({ back = false }: { back?: boolean }) {
  return (
    <div className={`l3d-face ${back ? "l3d-back" : ""}`}>
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path className="l3d-check" d="M11.5 20.5l5.5 5.5L29 13.5" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="l3d-shine" />
    </div>
  );
}

export function Logo3D({ size = 170 }: { size?: number }) {
  const sceneRef = useRef<HTMLDivElement>(null);

  // Le badge s'incline vers la souris (ordinateur uniquement).
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const zone = scene.closest("aside") ?? document.body;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = zone.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        scene.style.setProperty("--tilt-y", `${(x * 28).toFixed(2)}deg`);
        scene.style.setProperty("--tilt-x", `${(-y * 22).toFixed(2)}deg`);
      });
    };
    const reset = () => {
      scene.style.setProperty("--tilt-y", "0deg");
      scene.style.setProperty("--tilt-x", "0deg");
    };
    zone.addEventListener("pointermove", onMove as EventListener);
    zone.addEventListener("pointerleave", reset);
    return () => {
      cancelAnimationFrame(frame);
      zone.removeEventListener("pointermove", onMove as EventListener);
      zone.removeEventListener("pointerleave", reset);
    };
  }, []);

  return (
    <div ref={sceneRef} className="l3d-scene" style={{ "--l3d-size": `${size}px` } as React.CSSProperties} aria-hidden="true">
      <div className="l3d-glow" />
      <div className="l3d-ring l3d-ring-1">
        <i />
      </div>
      <div className="l3d-ring l3d-ring-2">
        <i />
      </div>
      <div className="l3d-tilt">
        <div className="l3d-float">
          <div className="l3d-spin">
            {Array.from({ length: LAYERS }, (_, i) => (
              <div key={i} className="l3d-layer" style={{ transform: `translateZ(${-(i + 1) * 2}px)`, filter: `brightness(${0.78 - i * 0.025})` }} />
            ))}
            <Face back />
            <Face />
            <span className="l3d-spark" />
          </div>
        </div>
      </div>
      <div className="l3d-shadow" />
      {PARTICLES.map((p, i) => (
        <span key={i} className="l3d-particle" style={{ left: p.left, animationDelay: p.delay, animationDuration: p.dur, width: p.size, height: p.size }} />
      ))}
    </div>
  );
}

// Petit logo animé (au-dessus du formulaire sur téléphone) : la coche se dessine,
// l'étincelle scintille et le badge oscille doucement en 3D.
export function LogoAnimated() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="l3d-mini">
        <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden="true">
          <defs>
            <linearGradient id="ktz-g-mini" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fb923c" />
              <stop offset="1" stopColor="#c2410c" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#ktz-g-mini)" />
          <path className="l3d-check" d="M11.5 20.5l5.5 5.5L29 13.5" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle className="l3d-mini-spark" cx="31" cy="9" r="4.5" fill="#fbbf24" stroke="#fff" strokeWidth="2" />
        </svg>
      </span>
      <span className="text-xl font-extrabold tracking-tight text-stone-900">
        KTZ <span className="text-gradient">Évalue</span>
      </span>
    </span>
  );
}
