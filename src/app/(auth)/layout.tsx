import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/logo";

const POINTS = [
  "Un test adapté à votre offre en moins de 10 minutes",
  "Envoyé aux candidats par WhatsApp ou email",
  "Passé sur téléphone, même avec une connexion faible",
  "Un classement fiable avant l'entretien",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-full flex-1 lg:grid-cols-[1fr_1.1fr]">
      {/* Panneau de présentation (ordinateur seulement) */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="bg-pattern absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-sun-400/20 blur-3xl" aria-hidden="true" />
        <Link href="/" className="relative">
          <Logo light />
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
            Recrutez sur les compétences, <span className="text-sun-300">pas seulement sur le CV.</span>
          </h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-white/85">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-400/25 text-brand-200">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/60">Pour les entreprises, ONG et organisations d&apos;Afrique francophone.</p>
      </aside>

      {/* Formulaire */}
      <div className="flex flex-col items-center justify-center px-4 py-10 sm:px-8">
        <Link href="/" className="mb-8 lg:hidden">
          <Logo />
        </Link>
        <div className="w-full max-w-md rounded-3xl border border-stone-200/80 bg-white p-7 shadow-lift sm:p-9">{children}</div>
      </div>
    </main>
  );
}
