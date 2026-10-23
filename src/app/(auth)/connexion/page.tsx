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
      <p role="status" className="mb-4 rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-900">
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
      <h1 className="mb-6 text-xl font-bold text-gray-900">Connexion</h1>
      <Suspense>
        <EmailStatus searchParams={props.searchParams} />
      </Suspense>
      <LoginForm />
      <p className="mt-3 text-right text-sm">
        <Link href="/mot-de-passe-oublie" className="text-teal-800 underline">
          Mot de passe oublié ?
        </Link>
      </p>

      <details className="mt-6 border-t border-gray-200 pt-4">
        <summary className="cursor-pointer text-sm font-semibold text-gray-800">
          Se connecter sans mot de passe (lien par email)
        </summary>
        <div className="mt-4">
          <MagicLinkForm />
        </div>
      </details>

      <p className="mt-6 text-center text-sm text-gray-600">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold text-teal-800 underline">
          Créer un compte
        </Link>
      </p>
    </>
  );
}
