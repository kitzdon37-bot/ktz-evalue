import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  CheckCircle2,
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
import { Reveal } from "@/components/reveal";

// Page d'accueil publique. Entièrement statique : aucun calcul serveur par visite.
// Photos libres de droits (Unsplash), hébergées dans /public/images.

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
  { name: "Comptable", img: "/images/metiers/comptable.jpg", alt: "Comptable concentré devant son ordinateur" },
  { name: "Assistant administratif", img: "/images/metiers/assistant.jpg", alt: "Assistante administrative souriante à son bureau" },
  { name: "Commercial", img: "/images/metiers/commercial.jpg", alt: "Commerçant souriant devant son étal" },
  { name: "Logisticien", img: "/images/metiers/logisticien.jpg", alt: "Logisticien casqué vérifiant un document dans un entrepôt" },
  { name: "Chauffeur", img: "/images/metiers/chauffeur.jpg", alt: "Chauffeur souriant devant son véhicule" },
  { name: "Agent humanitaire", img: "/images/metiers/humanitaire.jpg", alt: "Équipe en réunion autour d'un ordinateur" },
  { name: "Informaticien", img: "/images/metiers/informaticien.jpg", alt: "Deux informaticiens travaillant devant un écran" },
];

const RANKING: [string, number][] = [
  ["Marie Y.", 86],
  ["Jean N.", 74],
  ["Aïcha D.", 61],
];

function RankingCard({ className = "" }: { className?: string }) {
  return (
    <div className={`w-60 rounded-2xl bg-white p-4 text-stone-900 shadow-lift ring-1 ring-stone-200/70 ${className}`}>
      <p className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-500">
        Classement <BarChart3 className="h-3.5 w-3.5 text-brand-500" />
      </p>
      {RANKING.map(([name, score], i) => (
        <div key={name} className="mb-2.5 last:mb-0">
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-semibold text-stone-800">
              {i + 1}. {name}
            </span>
            <span className="font-bold">{score}</span>
          </div>
          <div className="h-1.5 rounded-full bg-stone-100">
            <div className={`h-1.5 rounded-full ${score >= 70 ? "bg-emerald-500" : "bg-sun-400"}`} style={{ width: `${score}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="w-[230px] rounded-[2.2rem] border-[9px] border-ink-900 bg-ink-900 shadow-2xl shadow-black/50">
      <div className="overflow-hidden rounded-[1.6rem] bg-stone-50">
        <div className="flex items-center justify-between px-4 pb-2 pt-3.5 text-[10px] text-stone-500">
          <span>
            Question <b className="text-stone-900">4</b> sur 15
          </span>
          <span className="grid h-8 w-8 place-items-center rounded-full border-[3px] border-brand-500 text-[9px] font-extrabold text-stone-900">0:52</span>
        </div>
        <div className="mx-4 h-1.5 rounded-full bg-stone-200">
          <div className="h-1.5 w-1/4 rounded-full bg-brand-500" />
        </div>
        <div className="m-3 rounded-2xl bg-white p-3.5 shadow-sm">
          <p className="text-[9px] font-extrabold uppercase tracking-wider text-brand-600">QCM · une seule réponse</p>
          <p className="mt-1 text-[12px] font-bold leading-snug text-stone-900">
            Une facture de 2 000 000 FCFA HT, avec une TVA de 19 %. Quel est le montant TTC ?
          </p>
          <div className="mt-2.5 space-y-1.5 text-[11px]">
            {["2 190 000 FCFA", "2 380 000 FCFA", "2 019 000 FCFA"].map((c, i) => (
              <div
                key={c}
                className={`flex items-center gap-2 rounded-xl border-2 px-2 py-1.5 ${i === 1 ? "border-brand-500 text-stone-900 shadow-sm shadow-brand-500/20" : "border-stone-200 text-stone-700"}`}
              >
                <span className={`grid h-5 w-5 place-items-center rounded-md text-[9px] font-extrabold ${i === 1 ? "bg-brand-500 text-white" : "border border-stone-200 bg-stone-50 text-stone-500"}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                {c}
              </div>
            ))}
          </div>
          <div className="mt-2.5 rounded-xl bg-brand-600 py-2 text-center text-[11px] font-bold text-white">Valider ma réponse</div>
        </div>
        <p className="pb-3 text-center text-[9px] text-stone-400">Réponse sauvegardée sur le téléphone</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <Reveal />

      {/* ── Bandeau principal ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink-900 text-white">
        <div className="bg-pattern absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-brand-500/30 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-sun-400/10 blur-3xl" aria-hidden="true" />

        <header className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5">
          <Logo light />
          <nav className="flex items-center gap-1 text-sm sm:gap-2">
            <a href="#recruteurs" className="hidden rounded-lg px-3 py-2 font-medium text-white/75 hover:text-white md:inline">
              Recruteurs
            </a>
            <a href="#candidats" className="hidden rounded-lg px-3 py-2 font-medium text-white/75 hover:text-white md:inline">
              Candidats
            </a>
            <a href="#metiers" className="hidden rounded-lg px-3 py-2 font-medium text-white/75 hover:text-white md:inline">
              Modèles
            </a>
            <Link href="/connexion" className="rounded-lg px-3 py-2 font-semibold text-white/90 hover:text-white">
              Se connecter
            </Link>
            <Link href="/inscription" className="btn-shine hidden rounded-full bg-brand-500 px-4 py-2 font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-600 sm:inline-flex">
              Essayer gratuitement
            </Link>
          </nav>
        </header>

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-24 pt-8 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-12">
          <div>
            <p className="rise mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-brand-200 ring-1 ring-white/15">
              <span className="live-dot" aria-hidden="true" /> Tests de recrutement générés par IA
            </p>
            <h1 className="rise text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.6rem]" style={{ "--i": 1 } as React.CSSProperties}>
              Recrutez sur les compétences, <span className="text-brand-400">pas seulement sur le CV.</span>
            </h1>
            <p className="rise mt-6 max-w-xl text-lg leading-relaxed text-white/75" style={{ "--i": 2 } as React.CSSProperties}>
              Créez en quelques minutes un test adapté à votre offre, envoyez-le par WhatsApp, et recevez un classement
              fiable de vos candidats avant l&apos;entretien.
            </p>
            <div className="rise mt-9 flex flex-col gap-3 sm:flex-row" style={{ "--i": 3 } as React.CSSProperties}>
              <Link
                href="/inscription"
                className="btn-shine group inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-7 py-4 text-base font-bold text-white shadow-xl shadow-brand-500/30 transition hover:bg-brand-600"
              >
                Essayer gratuitement
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#comment"
                className="inline-flex items-center justify-center rounded-full px-7 py-4 text-base font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/10"
              >
                Voir comment ça marche
              </a>
            </div>
            <ul className="rise mt-9 grid gap-2.5 text-sm text-white/75 sm:grid-cols-2" style={{ "--i": 4 } as React.CSSProperties}>
              {["Sans compte pour le candidat", "Invitations par WhatsApp", "Paiement Mobile Money", "Interface 100 % en français"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-500 text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Photo d'un candidat + téléphone + cartes flottantes */}
          <div className="rise relative mx-auto w-full max-w-md lg:max-w-none" style={{ "--i": 2 } as React.CSSProperties}>
            <div className="relative ml-auto aspect-[4/5] w-[88%] overflow-hidden rounded-[2rem] shadow-2xl shadow-black/40 ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/hero-candidat.jpg" alt="Jeune candidat souriant qui passe un test sur son téléphone" className="kenburns h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-transparent" />
            </div>
            <div className="float-y absolute -left-2 bottom-6 hidden sm:block lg:-left-10">
              <PhoneMockup />
            </div>
            <div className="float-y-slow absolute -right-2 top-8 hidden sm:block lg:-right-8">
              <RankingCard />
            </div>
            <div className="absolute right-6 bottom-6 flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-stone-900 shadow-lift sm:right-10">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-brand-600">
                <Wifi className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold">Marche en 3G</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bande d'arguments ─────────────────────────────────────────────── */}
      <section className="border-b border-stone-200/70 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-9 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Wifi, "Connexion faible", "Page légère, reprise après coupure"],
            [Wallet, "Prix en XAF", "Orange Money, Moov ou carte"],
            [FileText, "Contexte local", "OHADA, FCFA, bailleurs, terrain"],
            [ShieldCheck, "Données protégées", "Chaque entreprise ne voit que ses candidats"],
          ].map(([Icon, title, text], i) => {
            const I = Icon as typeof Wifi;
            return (
              <div key={title as string} data-reveal style={{ "--i": i } as React.CSSProperties} className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
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

      {/* ── Pour les recruteurs ───────────────────────────────────────────── */}
      <section id="recruteurs" className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-24 lg:grid-cols-2">
        <div className="relative">
          <div data-photo className="aspect-[4/3] rounded-[2rem] shadow-lift">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/recruteurs-resultats.jpg" alt="Équipe de recrutement qui examine les résultats des candidats" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <RankingCard className="float-y absolute -bottom-10 -right-2 hidden sm:block lg:-right-10" />
        </div>
        <div data-reveal>
          <span className="eyebrow">Pour les recruteurs</span>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-4xl">
            Fini les piles de CV : <span className="text-brand-600">voyez qui sait vraiment faire le travail.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-stone-600">
            Préparez un test fiable en moins de 10 minutes, envoyez-le à tous vos candidats d&apos;un coup, et recevez un classement
            avec le score par compétence et un indice de fiabilité.
          </p>
          <ul className="mt-7 space-y-3">
            {[
              "Questions générées par l'IA à partir de votre offre, que vous relisez",
              "Correction automatique et notes modifiables",
              "Rapport PDF et questions à reposer en entretien",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-stone-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Pour les candidats ────────────────────────────────────────────── */}
      <section id="candidats" className="bg-gradient-to-b from-brand-50/80 to-transparent">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-24 lg:grid-cols-2">
          <div data-reveal className="order-2 lg:order-1">
            <span className="eyebrow">Pour les candidats</span>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-4xl">
              Un test simple, sur téléphone, <span className="text-brand-600">même avec une connexion faible.</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-stone-600">
              Le candidat ouvre le lien reçu par WhatsApp, sans créer de compte. Une question à la fois, un chronomètre clair, et ses
              réponses sont gardées sur le téléphone si le réseau coupe.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                ["9 Ko", "par page de test"],
                ["0", "compte à créer"],
                ["3G", "suffit pour passer le test"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-stone-200/70">
                  <p className="text-2xl font-extrabold tracking-tight text-brand-600">{v}</p>
                  <p className="text-sm text-stone-600">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative order-1 lg:order-2">
            <div data-photo className="aspect-[4/3] rounded-[2rem] shadow-lift">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/candidat-telephone.jpg" alt="Candidate souriante qui passe un test sur son téléphone" loading="lazy" className="h-full w-full object-cover object-[50%_35%]" />
            </div>
            <div className="float-y absolute -left-2 -top-6 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lift ring-1 ring-stone-200/70 sm:-left-8">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="h-5 w-5" strokeWidth={3} />
              </span>
              <div>
                <p className="text-sm font-bold text-stone-900">Réponse enregistrée</p>
                <p className="text-xs text-stone-500">même sans réseau</p>
              </div>
            </div>
            <div className="float-y-slow absolute -bottom-6 right-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lift ring-1 ring-stone-200/70">
              <span className="grid h-10 w-10 place-items-center rounded-full border-4 border-brand-500 text-[10px] font-extrabold text-stone-900">0:42</span>
              <div>
                <p className="text-sm font-bold text-stone-900">Question 6 sur 15</p>
                <p className="text-xs text-stone-500">
                  <Timer className="mr-1 inline h-3 w-3" />
                  chronomètre visible
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Fonctionnalités ───────────────────────────────────────────────── */}
      <section id="fonctionnalites" className="mx-auto max-w-6xl px-4 py-24">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Fonctionnalités</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">Tout le recrutement par test, au même endroit</h2>
          <p className="mt-4 text-lg text-stone-600">Du texte de l&apos;offre jusqu&apos;au classement final, sans formation et sans carte bancaire.</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <div
              key={title}
              data-reveal
              style={{ "--i": i % 3 } as React.CSSProperties}
              className="group rounded-3xl border border-stone-200/80 bg-white p-7 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg shadow-brand-500/25 transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-stone-900">{title}</h3>
              <p className="mt-2 leading-relaxed text-stone-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comment ça marche ─────────────────────────────────────────────── */}
      <section id="comment" className="relative overflow-hidden bg-ink-900 text-white">
        <div className="absolute -right-32 top-0 h-80 w-80 rounded-full bg-brand-500/25 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 py-24">
          <div data-reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow text-brand-300">Comment ça marche</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Trois étapes, moins de 10 minutes</h2>
          </div>
          <div className="relative mt-16">
            <div data-draw aria-hidden="true" className="absolute left-[16%] right-[16%] top-7 hidden h-0.5 bg-gradient-to-r from-brand-500/30 via-brand-400 to-brand-500/30 md:block" />
            <ol className="relative grid gap-6 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.n} data-reveal style={{ "--i": i } as React.CSSProperties} className="text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-500 text-xl font-extrabold text-white shadow-lg shadow-brand-500/40 ring-8 ring-ink-900">
                    {s.n}
                  </span>
                  <div className="mt-6 rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur">
                    <h3 className="text-lg font-bold">{s.title}</h3>
                    <p className="mt-2 text-white/70">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Bibliothèque de modèles par métier ────────────────────────────── */}
      <section id="metiers" className="mx-auto max-w-6xl px-4 py-24">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Bibliothèque</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">Des tests prêts à l&apos;emploi par métier</h2>
          <p className="mt-4 text-lg text-stone-600">Utilisez un modèle tel quel ou adaptez-le à votre poste en quelques clics.</p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
          {PROFESSIONS.map((p, i) => (
            <Link
              key={p.name}
              href="/inscription"
              data-reveal
              style={{ "--i": i % 4 } as React.CSSProperties}
              className={`group relative block overflow-hidden rounded-3xl shadow-soft transition-shadow duration-300 hover:shadow-lift ${i === 0 ? "col-span-2 md:row-span-2" : ""}`}
            >
              <div data-photo className={`${i === 0 ? "aspect-[16/10] md:aspect-auto md:h-full" : "aspect-[4/5]"} rounded-3xl bg-stone-200`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.img} alt={p.alt} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-ink-950/85 via-ink-950/10 to-transparent transition-colors duration-300 group-hover:from-brand-800/90" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
                <span className="text-sm font-bold leading-tight text-white sm:text-base">{p.name}</span>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/20 text-white backdrop-blur transition group-hover:bg-white group-hover:text-brand-600">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
          {/* Tuile finale : métier absent → test sur mesure avec l'IA */}
          <Link
            href="/inscription"
            data-reveal
            style={{ "--i": 3 } as React.CSSProperties}
            className="group relative col-span-2 flex min-h-48 flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-lift"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" aria-hidden="true" />
            <Sparkles className="relative h-8 w-8" />
            <div className="relative">
              <p className="text-xl font-extrabold leading-tight">Votre métier n&apos;est pas dans la liste ?</p>
              <p className="mt-1 text-white/85">L&apos;IA prépare un test sur mesure à partir de votre offre, en quelques minutes.</p>
              <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-brand-700">
                Créer mon test <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Appel à l'action : photo d'équipe en parallaxe ────────────────── */}
      <section className="px-4 pb-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-ink-900 px-6 py-16 text-center text-white shadow-lift sm:px-12 sm:py-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-parallax src="/images/equipe.jpg" alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-ink-950/90 via-ink-900/80 to-brand-900/70" />
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500/40 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Votre prochain recrutement <span className="text-brand-400">commence ici</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Créez votre compte entreprise et préparez votre premier test aujourd&apos;hui. Essai gratuit, sans carte bancaire.</p>
            <Link
              href="/inscription"
              className="btn-shine group mt-9 inline-flex items-center gap-2 rounded-full bg-brand-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-brand-500/30 transition hover:bg-brand-600"
            >
              Créer mon compte gratuitement
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
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
