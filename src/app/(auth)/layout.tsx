import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/logo";
import { Logo3D, LogoAnimated } from "@/components/logo-3d";

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
      <aside className="relative hidden overflow-hidden bg-ink-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        {/* Photo d'une équipe en réunion, sous un voile sombre */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/recruteurs-resultats.jpg" alt="" aria-hidden="true" className="kenburns absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-br from-ink-950/95 via-ink-900/85 to-ink-900/60" aria-hidden="true" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl" aria-hidden="true" />
        <div className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-sun-400/10 blur-3xl" aria-hidden="true" />
        <Link href="/" className="relative">
          <Logo light />
        </Link>
        <div className="relative -my-6 flex justify-center">
          <Logo3D size={150} />
        </div>
        <div className="relative">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
            Recrutez sur les compétences, <span className="text-brand-400">pas seulement sur le CV.</span>
          </h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-white/85">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-500 text-white">
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
        <Link href="/" className="mb-8 lg:hidden" aria-label="KTZ Évalue — accueil">
          <LogoAnimated />
        </Link>
        <div className="auth-card-in w-full max-w-md rounded-3xl border border-stone-200/80 bg-white p-7 shadow-lift sm:p-9">{children}</div>
      </div>
    </main>
  );
}
