"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ClipboardList, LayoutDashboard, Library } from "lucide-react";

const NAV = [
  { href: "/tableau-de-bord", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/tests", label: "Tests", icon: ClipboardList },
  { href: "/bibliotheque", label: "Bibliothèque", icon: Library },
  { href: "/entreprise", label: "Entreprise", icon: Building2 },
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
    <nav className="flex gap-1 overflow-x-auto" aria-label="Navigation principale">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            prefetch={false}
            aria-current={active ? "page" : undefined}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
              active ? "bg-brand-700 text-white shadow-sm shadow-brand-900/20" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
