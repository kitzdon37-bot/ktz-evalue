import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "../forms";

export const metadata: Metadata = { title: "Créer un compte" };

export default function SignupPage() {
  return (
    <>
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-stone-900">Créer un compte entreprise</h1>
      <p className="mb-6 text-sm text-stone-600">Gratuit pour essayer. Aucune carte bancaire demandée.</p>
      <SignupForm />
      <p className="mt-6 text-center text-sm text-stone-600">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
          Se connecter
        </Link>
      </p>
    </>
  );
}
