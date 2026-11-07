import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { AdminNav } from "./nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-stone-50">
      <header className="sticky top-0 z-20 border-b border-stone-800 bg-ink-900 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-3" aria-label="Administration KTZ Évalue">
            <Logo light />
            <span className="hidden items-center gap-1 rounded-full bg-brand-500/20 px-2.5 py-1 text-xs font-bold text-brand-300 ring-1 ring-brand-400/40 sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5" /> Administration
            </span>
          </Link>
          <Link href="/tableau-de-bord" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Espace recruteur</span>
          </Link>
        </div>
        <div className="mx-auto max-w-6xl px-3 pb-3">
          <Suspense>
            <AdminNav />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
