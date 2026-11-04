"use client";

import { useEffect, useState } from "react";

// Mot qui change en douceur dans le titre (« Trouvez les meilleurs comptables / chauffeurs… »).
// Tous les mots occupent la même case : la largeur ne saute pas d'un mot à l'autre.
// Le style (dégradé…) est appliqué à chaque mot : un dégradé posé sur le conteneur
// ferait réapparaître les mots masqués.
export function RotatingWord({ words, className = "" }: { words: string[]; className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % words.length), 2200);
    return () => window.clearInterval(id);
  }, [words.length]);

  return (
    <span className="relative inline-grid overflow-hidden align-bottom">
      {/* Le mot courant pour les lecteurs d'écran ; l'animation est décorative. */}
      <span className="sr-only">{words[i]}</span>
      {words.map((w, k) => (
        <span
          key={w}
          aria-hidden="true"
          className="col-start-1 row-start-1 whitespace-nowrap pb-[0.08em] transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            transform: k === i ? "translateY(0)" : k === (i - 1 + words.length) % words.length ? "translateY(-105%)" : "translateY(105%)",
            opacity: k === i ? 1 : 0,
            visibility: k === i || k === (i - 1 + words.length) % words.length ? "visible" : "hidden",
          }}
        >
          {/* Le dégradé est sur un élément intérieur immobile : Chrome ne l'affiche pas toujours sur un élément qui bouge. */}
          <span className={`inline-block ${className}`}>{w}</span>
        </span>
      ))}
    </span>
  );
}
