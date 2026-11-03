// Logo de KTZ Évalue : une coche dans un badge, avec une étincelle dorée (l'IA).
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ktz-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fb923c" />
          <stop offset="1" stopColor="#c2410c" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#ktz-g)" />
      <path d="M11.5 20.5l5.5 5.5L29 13.5" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="31" cy="9" r="4.5" fill="#fbbf24" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

export function Logo({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      <span className={`text-lg font-extrabold tracking-tight ${light ? "text-white" : "text-stone-900"}`}>
        KTZ <span className={light ? "text-brand-400" : "text-brand-600"}>Évalue</span>
      </span>
    </span>
  );
}
