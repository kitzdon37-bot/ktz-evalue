"use client";

import { useEffect, useRef, useState } from "react";

// Nombre qui défile jusqu'à sa valeur quand il apparaît à l'écran.
// Sans JavaScript (ou si l'animation ne peut pas se lancer), la valeur finale reste affichée.
export function CountUp({ value, prefix = "", suffix = "", duration = 1600 }: { value: number; prefix?: string; suffix?: string; duration?: number }) {
  const [n, setN] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || value === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let timer = 0;
    const run = () => {
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
      // Filet de sécurité : la valeur finale s'affiche quoi qu'il arrive.
      timer = window.setTimeout(() => setN(value), duration + 300);
    };
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      run();
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {n.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
}
