import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "../forms";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-1 text-xl font-bold text-gray-900">Mot de passe oublié</h1>
      <p className="mb-6 text-sm text-gray-600">
        Indiquez votre email : vous recevrez un lien pour choisir un nouveau mot de passe.
      </p>
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm">
        <Link href="/connexion" className="text-teal-800 underline">
          Retour à la connexion
        </Link>
      </p>
    </>
  );
}
