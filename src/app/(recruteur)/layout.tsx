import Link from "next/link";
import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { Logo } from "@/components/logo";
import { logout } from "../(auth)/actions";
import { NavLinks, NavLinksFallback } from "./nav-links";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

// En-tête de l'espace recruteur. La partie qui dépend de l'utilisateur connecté
// est chargée à part (Suspense) pour que le reste de la page s'affiche tout de suite.
async function UserMenu() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right leading-tight md:block">
        <p className="text-sm font-semibold text-stone-900">{user.name}</p>
        {user.companyName && <p className="text-xs text-stone-500">{user.companyName}</p>}
      </div>
      {user.companyLogoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- logo servi par le site (/logo/…)
        <img src={user.companyLogoUrl} alt={user.companyName ?? "Logo"} className="h-9 w-auto max-w-24 rounded-lg bg-white object-contain p-0.5 ring-1 ring-stone-200" />
      ) : (
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 text-sm font-bold text-white ring-2 ring-white">
          {initials(user.name)}
        </span>
      )}
      <form action={logout}>
        <button
          type="submit"
          title="Déconnexion"
          aria-label="Déconnexion"
          className="grid h-9 w-9 place-items-center rounded-xl text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/tableau-de-bord" aria-label="KTZ Évalue — tableau de bord">
            <Logo />
          </Link>
          <Suspense>
            <UserMenu />
          </Suspense>
        </div>
        <div className="mx-auto max-w-6xl px-3 pb-3">
          <Suspense fallback={<NavLinksFallback />}>
            <NavLinks />
          </Suspense>
        </div>
      </header>
      <main className="stagger mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-stone-200/70 py-6 text-center text-xs text-stone-500">
        KTZ Évalue · Tests de recrutement pour l&apos;Afrique francophone
      </footer>
    </div>
  );
}
