import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { logout } from "../(auth)/actions";

// En-tête de l'espace recruteur. La partie qui dépend de l'utilisateur connecté
// est chargée à part (Suspense) pour que le reste de la page s'affiche tout de suite.
async function UserMenu() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="hidden text-gray-700 sm:inline">
        {user.name}
        {user.companyName && <span className="text-gray-500"> · {user.companyName}</span>}
      </span>
      <form action={logout}>
        <button type="submit" className="rounded-md border border-gray-300 px-3 py-2 text-gray-800 hover:bg-gray-100">
          Déconnexion
        </button>
      </form>
    </div>
  );
}

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/tableau-de-bord" className="text-lg font-bold text-teal-800">
            KTZ Évalue
          </Link>
          <Suspense>
            <UserMenu />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
