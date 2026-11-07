import Link from "next/link";
import { Logo3D } from "@/components/logo-3d";
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
  Wallet,
  Wifi,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Reveal } from "@/components/reveal";
import { LiveDemo } from "@/components/home/live-demo";
import { LiveRanking } from "@/components/home/live-ranking";
import { RotatingWord } from "@/components/home/rotating-word";
import { CountUp } from "@/components/home/count-up";
import { QuestionTypes } from "@/components/home/question-types";
import { TryQuestion } from "@/components/home/try-question";
import { JOB_SUGGESTIONS } from "@/lib/tests/suggestions";

// Page d'accueil publique. Entièrement statique : aucun calcul serveur par visite.
// Photos libres de droits (Unsplash), hébergées dans /public/images. Animations sobres,
// désactivées si le visiteur a demandé moins d'animations.

const WORDS = ["comptables", "chauffeurs", "développeurs", "infirmiers", "commerciaux", "logisticiens", "juristes"];

const FEATURES = [
  {
    icon: Sparkles,
    title: "Un test sur mesure en 10 minutes",
    text: "Partez de votre offre ou d'un modèle par métier : compétences clés et questions adaptées au contexte local (OHADA, FCFA, terrain humanitaire). Vous relisez et validez.",
  },
  {
    icon: Smartphone,
    title: "Pensé pour le téléphone et la 3G",
    text: "Pas de compte à créer pour le candidat. Pages très légères, réponses sauvegardées sur le téléphone, reprise après une coupure.",
  },
  {
    icon: MessageCircle,
    title: "Invitations par WhatsApp",
    text: "Envoyez le lien par WhatsApp ou par email, importez vos listes Excel, et laissez les relances automatiques s'occuper des retardataires.",
  },
  {
    icon: BarChart3,
    title: "Un classement clair et juste",
    text: "Correction automatique des QCM et du code, réponses écrites notées avec votre grille, score par compétence et notes toujours modifiables.",
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
  { n: "1", title: "Décrivez le poste", text: "Collez l'offre ou partez d'un modèle par métier, puis ajoutez si vous le voulez culture générale, raisonnement ou code." },
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

// Noms courts des métiers du catalogue, pour les bandes défilantes.
const JOBS = JOB_SUGGESTIONS.map((j) => j.title.replace(/\s*\([^)]*\)/g, "").split(" / ")[0]);
const ROW_1 = JOBS.slice(0, Math.ceil(JOBS.length / 2));
const ROW_2 = JOBS.slice(Math.ceil(JOBS.length / 2));

function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  return (
    <div className="marquee-mask overflow-hidden py-1.5">
      <div className={`marquee ${reverse ? "marquee-reverse" : ""}`}>
        {[...items, ...items].map((name, i) => (
          <span
            key={`${name}-${i}`}
            aria-hidden={i >= items.length}
            className="mx-1.5 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: React.ReactNode; text?: string }) {
  return (
    <div data-reveal className="mx-auto max-w-2xl text-center">
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-[2.6rem] sm:leading-[1.1]">{title}</h2>
      {text && <p className="mt-4 text-lg text-stone-600">{text}</p>}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col overflow-x-clip">
      <Reveal />
      <div className="read-progress fixed inset-x-0 top-0 z-50 h-[3px] bg-gradient-to-r from-brand-500 via-brand-400 to-sun-400" aria-hidden="true" />

      {/* ── En-tête collant, effet verre ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-stone-200/60 bg-[#fffaf5]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
          <Logo />
          <nav className="flex items-center gap-1 text-sm sm:gap-2">
            {[
              ["#questions", "Questions"],
              ["#essayer", "Essayer"],
              ["#recruteurs", "Recruteurs"],
              ["#metiers", "Modèles"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="hidden rounded-lg px-3 py-2 font-medium text-stone-600 transition hover:text-brand-700 md:inline">
                {label}
              </a>
            ))}
            <Link href="/connexion" className="rounded-lg px-3 py-2 font-semibold text-stone-800 hover:text-brand-700">
              Se connecter
            </Link>
            <Link
              href="/inscription"
              className="btn-shine hidden rounded-full bg-brand-600 px-4 py-2 font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-700 sm:inline-flex"
            >
              Essayer gratuitement
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Bandeau principal ─────────────────────────────────────────────── */}
      <section className="relative bg-[#fffaf5]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="bg-grid absolute inset-0" />
          <div className="blob blob-1 -left-32 -top-24 h-[30rem] w-[30rem] bg-brand-300/45" />
          <div className="blob blob-2 right-[-8rem] top-24 h-[26rem] w-[26rem] bg-sun-300/40" />
          <div className="blob blob-1 bottom-[-10rem] left-1/3 h-80 w-80 bg-rose-200/40" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-12 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-16">
          <div>
            <a
              href="#questions"
              className="rise group mb-7 inline-flex items-center gap-2 rounded-full bg-white/80 py-1.5 pl-1.5 pr-3.5 text-xs font-semibold text-stone-700 shadow-sm ring-1 ring-stone-200 backdrop-blur transition hover:ring-brand-300"
            >
              <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Nouveau</span>
              Code, raisonnement illustré, culture générale
              <ArrowRight className="h-3.5 w-3.5 text-brand-600 transition-transform group-hover:translate-x-0.5" />
            </a>
            {/* Logo KTZ Évalue en 3D, à côté du titre (ordinateur et téléphone) */}
            <Logo3D compact light size="clamp(62px, 17vw, 112px)" className="float-right -mr-1 -mt-3 ml-1 sm:-mt-6" />
            <h1 className="rise text-[2.6rem] font-extrabold leading-[1.04] tracking-tight text-stone-900 sm:text-6xl lg:text-[4.1rem]" style={{ "--i": 1 } as React.CSSProperties}>
              Trouvez les meilleurs
              <br />
              <RotatingWord words={WORDS} className="text-brand-600" />
              <br />
              <span className="text-stone-900">sur leurs compétences.</span>
            </h1>
            <p className="rise mt-6 max-w-xl text-lg leading-relaxed text-stone-600" style={{ "--i": 2 } as React.CSSProperties}>
              Créez en quelques minutes un test adapté à votre offre, envoyez-le par WhatsApp, et recevez un classement fiable de vos
              candidats avant l&apos;entretien. <strong className="font-semibold text-stone-800">Pas seulement des CV.</strong>
            </p>
            <div className="rise mt-9 flex flex-col gap-3 sm:flex-row" style={{ "--i": 3 } as React.CSSProperties}>
              <Link
                href="/inscription"
                className="btn-shine group inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-7 py-4 text-base font-bold text-white shadow-xl shadow-brand-500/35 transition hover:-translate-y-0.5 hover:bg-brand-700"
              >
                Essayer gratuitement
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#essayer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-base font-semibold text-stone-800 shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-0.5 hover:ring-brand-300"
              >
                <Sparkles className="h-5 w-5 text-brand-600" /> Essayer une question
              </a>
            </div>
            <ul className="rise mt-9 grid gap-2.5 text-sm text-stone-600 sm:grid-cols-2" style={{ "--i": 4 } as React.CSSProperties}>
              {["Sans compte pour le candidat", "Invitations par WhatsApp", "Paiement Mobile Money", "Interface 100 % en français"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-100 text-brand-700">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Photo d'un candidat + démonstration animée + classement en direct */}
          <div className="rise relative mx-auto w-full max-w-md lg:max-w-none" style={{ "--i": 2 } as React.CSSProperties}>
            <div className="relative ml-auto aspect-[4/5] w-[86%] overflow-hidden rounded-[2.2rem] shadow-2xl shadow-brand-900/20 ring-1 ring-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/hero-candidat.jpg" alt="Jeune candidat souriant qui passe un test sur son téléphone" className="kenburns h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/40 via-transparent to-transparent" />
            </div>
            <div className="float-y absolute -left-2 bottom-[-2.5rem] origin-bottom-left scale-[0.78] sm:-left-3 sm:bottom-[-1.5rem] sm:scale-100 lg:-left-12">
              <LiveDemo />
            </div>
            <div className="float-y-slow absolute -right-3 top-6 hidden sm:block lg:-right-10">
              <LiveRanking />
            </div>
            <div className="absolute bottom-6 right-6 flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-2 text-stone-900 shadow-lift backdrop-blur">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-brand-600">
                <Wifi className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold">Marche en 3G</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Métiers qui défilent + chiffres ───────────────────────────────── */}
      <section className="marquee-wrap border-y border-stone-200/70 bg-white py-10">
        <p data-reveal className="mb-5 text-center text-sm font-semibold text-stone-500">
          Des tests prêts à l&apos;emploi pour <span className="text-brand-700">{JOBS.length} métiers</span>, et des modules à ajouter à chacun
        </p>
        <Marquee items={ROW_1} />
        <Marquee items={ROW_2} reverse />
        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
          {[
            { v: JOBS.length, s: "", l: "métiers couverts" },
            { v: 450, s: "+", l: "questions vérifiées" },
            { v: 6, s: "", l: "modules : culture, logique, code, français, anglais, bureautique" },
            { v: 0, s: "", l: "compte à créer pour le candidat" },
          ].map((x, i) => (
            <div key={x.l} data-reveal style={{ "--i": i } as React.CSSProperties} className="text-center">
              <p className="text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl">
                <CountUp value={x.v} suffix={x.s} />
              </p>
              <p className="mt-1 text-sm text-stone-500">{x.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Types de questions ────────────────────────────────────────────── */}
      <section id="questions" className="relative scroll-mt-20 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionTitle
            eyebrow="Bien plus que des QCM"
            title={
              <>
                Des questions <span className="text-gradient">vivantes</span>, qui montrent vraiment ce que le candidat sait faire
              </>
            }
            text="Code exécuté et vérifié, éléments à remettre dans l'ordre, raisonnement illustré, culture générale, mises en situation : tout se passe sur le téléphone du candidat."
          />
          <div className="mt-14">
            <QuestionTypes />
          </div>
        </div>
      </section>

      {/* ── Essayez une question ──────────────────────────────────────────── */}
      <section id="essayer" className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-brand-50/80 via-[#fffaf5] to-transparent py-24">
        <div className="blob blob-2 pointer-events-none -right-24 top-10 h-80 w-80 bg-brand-200/50" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-[1fr_1.15fr]">
          <div data-reveal>
            <span className="eyebrow">À vous de jouer</span>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-[2.6rem] sm:leading-[1.1]">
              Mettez-vous à la place <span className="text-brand-600">du candidat.</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-stone-600">
              Trois vraies questions de la banque KTZ : raisonnement, raisonnement illustré et culture générale. Répondez, et voyez
              aussitôt la correction, comme le recruteur la verra.
            </p>
            <ul className="mt-7 space-y-3 text-stone-700">
              {["Corrigé à l'instant, sans attendre", "Une question à la fois, chronomètre visible", "Réponses gardées même si le réseau coupe"].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal style={{ "--i": 1 } as React.CSSProperties}>
            <TryQuestion />
          </div>
        </div>
      </section>

      {/* ── Pour les recruteurs ───────────────────────────────────────────── */}
      <section id="recruteurs" className="mx-auto grid max-w-6xl scroll-mt-20 items-center gap-14 px-4 py-24 lg:grid-cols-2">
        <div className="relative">
          <div data-photo className="aspect-[4/3] rounded-[2rem] shadow-lift">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/recruteurs-resultats.jpg" alt="Équipe de recrutement qui examine les résultats des candidats" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="float-y absolute -bottom-8 -right-2 hidden items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lift ring-1 ring-stone-200/70 sm:flex lg:-right-8">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-700">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-stone-900">Rapport PDF prêt</p>
              <p className="text-xs text-stone-500">score, fiabilité, questions d&apos;entretien</p>
            </div>
          </div>
          <div className="float-y-slow absolute -left-2 -top-6 hidden items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lift ring-1 ring-stone-200/70 sm:flex lg:-left-8">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-stone-900">Fiabilité élevée</p>
              <p className="text-xs text-stone-500">aucun signal suspect</p>
            </div>
          </div>
        </div>
        <div data-reveal>
          <span className="eyebrow">Pour les recruteurs</span>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-4xl">
            Fini les piles de CV : <span className="text-brand-600">voyez qui sait vraiment faire le travail.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-stone-600">
            Préparez un test fiable en quelques minutes, envoyez-le à tous vos candidats d&apos;un coup, et recevez un classement avec le
            score par compétence et un indice de fiabilité.
          </p>
          <ul className="mt-7 space-y-3">
            {[
              "Modèles par métier, à compléter avec la banque KTZ ou l'IA",
              "Correction automatique, notes modifiables à tout moment",
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
      <section id="candidats" className="bg-gradient-to-b from-brand-50/70 to-transparent">
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
                ["< 30 Ko", "par page de test"],
                ["0", "compte à créer"],
                ["3G", "suffit pour passer le test"],
              ].map(([v, l], i) => (
                <div key={l} data-reveal style={{ "--i": i } as React.CSSProperties} className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-stone-200/70">
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
        <SectionTitle
          eyebrow="Fonctionnalités"
          title="Tout le recrutement par test, au même endroit"
          text="Du texte de l'offre jusqu'au classement final, sans formation et sans carte bancaire."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <div
              key={title}
              data-reveal
              style={{ "--i": i % 3 } as React.CSSProperties}
              className="group relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white p-7 shadow-soft transition duration-500 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
            >
              <div className="glow-follow" aria-hidden="true" />
              <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg shadow-brand-500/25 transition-transform duration-500 group-hover:rotate-[-6deg] group-hover:scale-110">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="relative mt-5 text-lg font-bold text-stone-900">{title}</h3>
              <p className="relative mt-2 leading-relaxed text-stone-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comment ça marche ─────────────────────────────────────────────── */}
      <section id="comment" className="relative overflow-hidden bg-white">
        <div className="blob blob-1 pointer-events-none -left-24 top-10 h-72 w-72 bg-brand-200/50" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 py-24">
          <SectionTitle eyebrow="Comment ça marche" title="Trois étapes, quelques minutes" />
          <div className="relative mt-16">
            <div data-draw aria-hidden="true" className="absolute left-[16%] right-[16%] top-7 hidden h-0.5 bg-gradient-to-r from-brand-200 via-brand-500 to-sun-400 md:block" />
            <ol className="relative grid gap-6 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.n} data-reveal style={{ "--i": i } as React.CSSProperties} className="text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-xl font-extrabold text-white shadow-lg shadow-brand-500/40 ring-8 ring-white">
                    {s.n}
                  </span>
                  <div className="mt-6 rounded-3xl bg-[#fffaf5] p-6 ring-1 ring-stone-200/70 transition duration-500 hover:-translate-y-1 hover:shadow-lift">
                    <h3 className="text-lg font-bold text-stone-900">{s.title}</h3>
                    <p className="mt-2 text-stone-600">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Bibliothèque de modèles par métier ────────────────────────────── */}
      <section id="metiers" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24">
        <SectionTitle eyebrow="Bibliothèque" title="Des tests prêts à l'emploi par métier" text="Utilisez un modèle tel quel ou adaptez-le à votre poste en quelques clics." />
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
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-ink-950/80 via-ink-950/5 to-transparent transition-colors duration-500 group-hover:from-brand-800/90" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
                <span className="text-sm font-bold leading-tight text-white sm:text-base">{p.name}</span>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/20 text-white backdrop-blur transition group-hover:bg-white group-hover:text-brand-600">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
          <Link
            href="/inscription"
            data-reveal
            style={{ "--i": 3 } as React.CSSProperties}
            className="group relative col-span-2 flex min-h-48 flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-lift"
          >
            <div className="blob blob-1 -right-10 -top-10 h-40 w-40 bg-white/25" aria-hidden="true" />
            <Sparkles className="relative h-8 w-8" />
            <div className="relative">
              <p className="text-xl font-extrabold leading-tight">Votre métier n&apos;est pas dans la liste ?</p>
              <p className="mt-1 text-white/85">Créez un test sur mesure à partir de votre offre, en quelques minutes.</p>
              <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-brand-700">
                Créer mon test <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Bande d'arguments ─────────────────────────────────────────────── */}
      <section className="border-y border-stone-200/70 bg-white">
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

      {/* ── Appel à l'action : photo d'équipe en parallaxe ────────────────── */}
      <section className="px-4 py-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.2rem] bg-brand-700 px-6 py-16 text-center text-white shadow-2xl shadow-brand-900/25 sm:px-12 sm:py-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-parallax src="/images/equipe.jpg" alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-700/95 via-brand-600/85 to-sun-500/70" />
          <div className="blob blob-2 -top-24 left-1/2 h-72 w-72 -translate-x-1/2 bg-white/25" aria-hidden="true" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Votre prochain recrutement commence ici</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
              Créez votre compte entreprise et préparez votre premier test aujourd&apos;hui. Essai gratuit, sans carte bancaire.
            </p>
            <Link
              href="/inscription"
              className="btn-shine group mt-9 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-brand-700 shadow-xl shadow-brand-950/25 transition hover:-translate-y-0.5"
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
