"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, Users } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/admin/connexions", label: "Connexions", icon: Activity },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="grid grid-cols-3 gap-1 sm:flex" aria-label="Navigation administration">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition sm:flex-row sm:gap-2 sm:px-3.5 sm:py-2 sm:text-sm ${
              active ? "bg-brand-600 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
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
