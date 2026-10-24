import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm, MagicLinkForm } from "../forms";

export const metadata: Metadata = { title: "Connexion" };

// Message affiché après un clic sur le lien de confirmation d'email.
async function EmailStatus({ searchParams }: { searchParams: PageProps<"/connexion">["searchParams"] }) {
  const { email } = await searchParams;
  if (email === "confirme") {
    return (
      <p role="status" className="mb-4 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-900">
        Votre adresse email est confirmée. Vous pouvez vous connecter.
      </p>
    );
  }
  if (email === "lien-invalide") {
    return (
      <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
        Ce lien de confirmation n&apos;est plus valable. Connectez-vous pour en recevoir un nouveau.
      </p>
    );
  }
  return null;
}

export default function LoginPage(props: PageProps<"/connexion">) {
  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">Bon retour parmi nous</h1>
      <p className="mb-6 mt-1 text-sm text-stone-600">Connectez-vous à votre espace recruteur.</p>
      <Suspense>
        <EmailStatus searchParams={props.searchParams} />
      </Suspense>
      <LoginForm />
      <p className="mt-3 text-right text-sm">
        <Link href="/mot-de-passe-oublie" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
          Mot de passe oublié ?
        </Link>
      </p>

      <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
        <span className="h-px flex-1 bg-stone-200" /> ou <span className="h-px flex-1 bg-stone-200" />
      </div>
      <details className="group rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 open:bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-stone-800">
          Recevoir un lien de connexion par email
          <span className="text-stone-400 transition group-open:rotate-180">▾</span>
        </summary>
        <div className="mt-4">
          <MagicLinkForm />
        </div>
      </details>

      <p className="mt-6 text-center text-sm text-stone-600">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
          Créer un compte
        </Link>
      </p>
    </>
  );
}
