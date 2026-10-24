import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  FileText,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Timer,
  Wifi,
  Wallet,
} from "lucide-react";
import { Logo } from "@/components/logo";

// Page d'accueil publique. Entièrement statique : aucun calcul serveur par visite.

const FEATURES = [
  {
    icon: Sparkles,
    title: "Un test sur mesure en 10 minutes",
    text: "Collez votre offre d'emploi : l'IA propose les compétences clés et des questions pratiques adaptées au contexte local (OHADA, FCFA, terrain humanitaire). Vous relisez et validez.",
  },
  {
    icon: Smartphone,
    title: "Pensé pour le téléphone et la 3G",
    text: "Pas de compte à créer pour le candidat. La page pèse quelques kilo-octets, chaque réponse est sauvegardée et le test reprend après une coupure.",
  },
  {
    icon: MessageCircle,
    title: "Invitations par WhatsApp",
    text: "Envoyez le lien par WhatsApp ou par email, importez vos listes Excel, et laissez les relances automatiques s'occuper des retardataires.",
  },
  {
    icon: BarChart3,
    title: "Un classement clair et juste",
    text: "Correction automatique des QCM, notation des réponses écrites par l'IA avec votre grille, score par compétence et notes toujours modifiables.",
  },
  {
    icon: ShieldCheck,
    title: "Un indice de fiabilité",
    text: "Sorties de page, copier-coller, réponses trop rapides, textes recopiés : les signaux sont enregistrés et résumés. Vous gardez la décision.",
  },
  {
    icon: BadgeCheck,
    title: "Relié à KTZ Emploi",
    text: "Les candidats qui réussissent peuvent afficher un badge « Compétence vérifiée » sur leur profil KTZ Emploi, avec leur accord.",
  },
];

const STEPS = [
  { n: "1", title: "Décrivez le poste", text: "Collez l'offre ou partez d'un modèle par métier. L'IA prépare les compétences et les questions." },
  { n: "2", title: "Invitez les candidats", text: "Un lien unique par candidat, envoyé par WhatsApp ou email, ou un lien public à partager." },
  { n: "3", title: "Comparez et décidez", text: "Classement, fiche détaillée, rapport PDF et questions à reposer en entretien." },
];

const PROFESSIONS = [
  "Comptable",
  "Assistant administratif",
  "Commercial",
  "Logisticien",
  "Chauffeur",
  "Agent humanitaire",
  "Informaticien",
];

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[270px] sm:w-[290px]">
      <div className="rounded-[2.5rem] border-[10px] border-stone-900 bg-stone-900 shadow-2xl shadow-brand-950/50">
        <div className="overflow-hidden rounded-[1.8rem] bg-stone-50">
          <div className="flex items-center justify-between px-4 pb-2 pt-4 text-[11px] text-stone-500">
            <span>Question 4 / 15</span>
            <span className="inline-flex items-center gap-1 font-bold text-stone-800">
              <Timer className="h-3 w-3" /> 0:52
            </span>
          </div>
          <div className="mx-4 h-1.5 rounded-full bg-stone-200">
            <div className="h-1.5 w-1/4 rounded-full bg-brand-600" />
          </div>
          <div className="m-3 rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-[13px] font-medium leading-snug text-stone-900">
              Une facture s&apos;élève à 2 000 000 FCFA HT, avec une TVA de 19 %. Quel est le montant TTC ?
            </p>
            <div className="mt-3 space-y-2 text-[12px]">
              {["2 190 000 FCFA", "2 380 000 FCFA", "2 019 000 FCFA"].map((c, i) => (
                <div
                  key={c}
                  className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 ${i === 1 ? "border-brand-500 bg-brand-50 text-brand-900" : "border-stone-200 text-stone-700"}`}
                >
                  <span className={`h-3.5 w-3.5 rounded-full border-2 ${i === 1 ? "border-brand-600 bg-brand-600 ring-2 ring-white ring-inset" : "border-stone-300"}`} />
                  {c}
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl bg-brand-700 py-2.5 text-center text-[12px] font-bold text-white">Valider</div>
          </div>
          <p className="pb-4 text-center text-[10px] text-stone-400">Réponse enregistrée automatiquement</p>
        </div>
      </div>
      {/* Carte flottante : aperçu du classement */}
      <div className="absolute -bottom-14 -left-20 hidden w-56 rounded-2xl bg-white p-4 shadow-lift ring-1 ring-stone-200/70 sm:block lg:-left-24">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">Classement</p>
        {[
          ["Marie Y.", 86],
          ["Jean N.", 74],
          ["Aïcha D.", 61],
        ].map(([name, score], i) => (
          <div key={name} className="mb-2.5 last:mb-0">
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-semibold text-stone-800">
                {i + 1}. {name}
              </span>
              <span className="font-bold text-stone-900">{score}</span>
            </div>
            <div className="h-1.5 rounded-full bg-stone-100">
              <div className={`h-1.5 rounded-full ${Number(score) >= 70 ? "bg-brand-500" : "bg-sun-400"}`} style={{ width: `${score}%` }} />
            </div>
          </div>
        ))}
      </div>
      {/* Badge flottant */}
      <div className="absolute -right-8 -top-5 hidden items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-lift ring-1 ring-stone-200/70 sm:flex lg:-right-16">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-sun-100 text-sun-700">
          <Wifi className="h-4 w-4" />
        </span>
        <span className="text-xs font-semibold text-stone-800">Marche en 3G</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* En-tête + bandeau principal */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 text-white">
        <div className="bg-pattern absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-sun-400/15 blur-3xl" aria-hidden="true" />

        <header className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5">
          <Logo light />
          <nav className="flex items-center gap-2 text-sm">
            <a href="#fonctionnalites" className="hidden rounded-lg px-3 py-2 font-medium text-white/80 hover:text-white md:inline">
              Fonctionnalités
            </a>
            <a href="#comment" className="hidden rounded-lg px-3 py-2 font-medium text-white/80 hover:text-white md:inline">
              Comment ça marche
            </a>
            <Link href="/connexion" className="rounded-lg px-3 py-2 font-semibold text-white/90 hover:text-white">
              Se connecter
            </Link>
            <Link href="/inscription" className="hidden rounded-xl bg-white px-4 py-2 font-semibold text-brand-900 shadow-sm hover:bg-brand-50 sm:inline-flex">
              Essayer gratuitement
            </Link>
          </nav>
        </header>

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-24 pt-10 lg:grid-cols-[1.15fr_1fr] lg:pb-28 lg:pt-14">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sun-200 ring-1 ring-white/15">
              <Sparkles className="h-3.5 w-3.5" /> Tests de recrutement générés par IA
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Recrutez sur les compétences, <span className="text-sun-300">pas seulement sur le CV.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
              Créez en quelques minutes un test adapté à votre offre, envoyez-le par WhatsApp, et recevez un classement
              fiable de vos candidats avant l&apos;entretien.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/inscription"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-sun-400 px-6 py-3.5 text-base font-bold text-stone-900 shadow-lg shadow-sun-500/20 transition hover:bg-sun-300"
              >
                Essayer gratuitement
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#comment"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-base font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/10"
              >
                Voir comment ça marche
              </a>
            </div>
            <ul className="mt-8 grid gap-2.5 text-sm text-white/80 sm:grid-cols-2">
              {["Sans compte pour le candidat", "Invitations par WhatsApp", "Paiement Mobile Money", "Interface 100 % en français"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-400/25 text-brand-200">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <PhoneMockup />
        </div>
      </section>

      {/* Bande d'arguments */}
      <section className="border-b border-stone-200/70 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Wifi, "Connexion faible", "Page légère, reprise après coupure"],
            [Wallet, "Prix en XAF", "Orange Money, Moov ou carte"],
            [FileText, "Contexte local", "OHADA, FCFA, bailleurs, terrain"],
            [ShieldCheck, "Données protégées", "Chaque entreprise ne voit que ses candidats"],
          ].map(([Icon, title, text]) => {
            const I = Icon as typeof Wifi;
            return (
              <div key={title as string} className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <I className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold text-stone-900">{title as string}</p>
                  <p className="text-sm text-stone-600">{text as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Fonctionnalités */}
      <section id="fonctionnalites" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Fonctionnalités</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">Tout le recrutement par test, au même endroit</h2>
          <p className="mt-4 text-lg text-stone-600">Du texte de l&apos;offre jusqu&apos;au classement final, sans formation et sans carte bancaire.</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="group rounded-2xl border border-stone-200/80 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-md shadow-brand-900/20">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-stone-900">{title}</h3>
              <p className="mt-2 leading-relaxed text-stone-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="comment" className="bg-gradient-to-b from-brand-50/70 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Comment ça marche</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">Trois étapes, moins de 10 minutes</h2>
          </div>
          <ol className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="relative rounded-2xl bg-white p-6 shadow-soft ring-1 ring-stone-200/70">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-sun-400 text-lg font-extrabold text-stone-900 shadow-sm">{s.n}</span>
                <h3 className="mt-4 text-lg font-bold text-stone-900">{s.title}</h3>
                <p className="mt-2 text-stone-600">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Bibliothèque */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Bibliothèque</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900">Des tests prêts à l&apos;emploi par métier</h2>
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2.5">
          {PROFESSIONS.map((p) => (
            <span key={p} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-800 shadow-soft ring-1 ring-stone-200/70">
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="px-4 pb-20">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-950 px-6 py-14 text-center text-white shadow-lift sm:px-12">
          <div className="bg-pattern absolute inset-0 opacity-50" aria-hidden="true" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Votre prochain recrutement commence ici</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Créez votre compte entreprise et préparez votre premier test aujourd&apos;hui.</p>
            <Link
              href="/inscription"
              className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-sun-400 px-7 py-3.5 text-base font-bold text-stone-900 shadow-lg transition hover:bg-sun-300"
            >
              Créer mon compte gratuitement
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200/70 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-stone-500 sm:flex-row">
          <Logo />
          <p>Tests de recrutement pour les entreprises d&apos;Afrique francophone · Bangui</p>
        </div>
      </footer>
    </div>
  );
}
