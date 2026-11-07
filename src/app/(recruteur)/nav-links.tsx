"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ClipboardList, LayoutDashboard, Library } from "lucide-react";

const NAV = [
  { href: "/tableau-de-bord", label: "Tableau de bord", short: "Accueil", icon: LayoutDashboard },
  { href: "/tests", label: "Tests", short: "Tests", icon: ClipboardList },
  { href: "/bibliotheque", label: "Bibliothèque", short: "Bibliothèque", icon: Library },
  { href: "/entreprise", label: "Entreprise", short: "Entreprise", icon: Building2 },
];

// Version affichée pendant le chargement (sans page active), pour ne pas bloquer l'affichage.
export function NavLinksFallback() {
  return <NavList pathname="" />;
}

export function NavLinks() {
  return <NavList pathname={usePathname()} />;
}

function NavList({ pathname }: { pathname: string }) {
  return (
    // Téléphone : 4 onglets égaux (icône + nom court), tous visibles sans défiler.
    <nav className="grid grid-cols-4 gap-1 sm:flex" aria-label="Navigation principale">
      {NAV.map(({ href, label, short, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            prefetch={false}
            aria-current={active ? "page" : undefined}
            className={`group flex flex-col items-center justify-center gap-1 whitespace-nowrap rounded-xl px-1 py-1.5 text-[11px] font-semibold transition duration-300 sm:inline-flex sm:flex-row sm:gap-2 sm:px-3.5 sm:py-2 sm:text-sm ${
              active
                ? "bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-md shadow-brand-900/25"
                : "text-stone-600 hover:bg-brand-50 hover:text-brand-800"
            }`}
          >
            <Icon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
