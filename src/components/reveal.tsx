"use client";

import { useEffect } from "react";

/**
 * Animations du site public (jamais chargé sur la page de test du candidat) :
 *  - [data-reveal] : l'élément apparaît en douceur quand il entre à l'écran
 *    (style="--i:2" pour décaler les éléments d'une même rangée) ;
 *  - [data-photo] : la photo se dévoile en rideau puis se dézoome légèrement ;
 *  - [data-parallax] : la photo de fond défile un peu moins vite que la page.
 * Sans JavaScript ou si l'utilisateur a demandé moins d'animations, tout reste visible.
 */
export function Reveal() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.classList.add("anim-ready");

    const targets = () => document.querySelectorAll<HTMLElement>("[data-reveal]:not(.in), [data-photo]:not(.in), [data-draw]:not(.in)");
    const show = (el: Element) => el.classList.add("in");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            show(e.target);
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );
    targets().forEach((el) => io.observe(el));

    // Filet de sécurité : tout ce qui est déjà entré dans l'écran s'affiche, quoi qu'il arrive.
    let frame = 0;
    const tick = () => {
      frame = 0;
      const limit = window.innerHeight * 0.95;
      targets().forEach((el) => {
        if (el.getBoundingClientRect().top < limit) show(el);
      });
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const box = el.parentElement?.getBoundingClientRect();
        if (!box || box.bottom < 0 || box.top > window.innerHeight) return;
        const t = (box.top + box.height / 2 - window.innerHeight / 2) / window.innerHeight;
        el.style.transform = `translate3d(0, ${(-t * 10).toFixed(2)}%, 0) scale(1.15)`;
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    tick();
    const later = window.setTimeout(tick, 1200);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      io.disconnect();
      window.clearTimeout(later);
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}
