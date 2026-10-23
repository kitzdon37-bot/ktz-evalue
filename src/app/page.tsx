import Link from "next/link";

// Page d'accueil provisoire (la vraie page publique arrive aux étapes 11-12).
// Page statique : aucun calcul serveur par visite.
export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">KTZ Évalue</p>
      <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
        Évaluez vos candidats avant l&apos;entretien.
      </h1>
      <p className="mt-4 text-lg text-gray-700">
        Générez en quelques minutes un test adapté à votre offre d&apos;emploi, envoyez-le par lien ou WhatsApp, et
        recevez un classement fiable de vos candidats.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/inscription"
          className="rounded-md bg-teal-700 px-5 py-3 text-center font-semibold text-white hover:bg-teal-800"
        >
          Essayer gratuitement
        </Link>
        <Link
          href="/connexion"
          className="rounded-md border border-gray-300 px-5 py-3 text-center font-semibold text-gray-800 hover:bg-gray-100"
        >
          Se connecter
        </Link>
      </div>
    </main>
  );
}
