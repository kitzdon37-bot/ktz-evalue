import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "../forms";

export const metadata: Metadata = { title: "Créer un compte" };

export default function SignupPage() {
  return (
    <>
      <h1 className="mb-1 text-xl font-bold text-gray-900">Créer un compte entreprise</h1>
      <p className="mb-6 text-sm text-gray-600">Gratuit pour essayer. Aucune carte bancaire demandée.</p>
      <SignupForm />
      <p className="mt-6 text-center text-sm text-gray-600">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="font-semibold text-teal-800 underline">
          Se connecter
        </Link>
      </p>
    </>
  );
}
