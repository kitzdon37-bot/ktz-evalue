import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ResetPasswordForm } from "../../forms";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

async function Form({ searchParams }: { searchParams: PageProps<"/mot-de-passe-oublie/nouveau">["searchParams"] }) {
  const { jeton } = await searchParams;
  if (typeof jeton !== "string" || !jeton) {
    return (
      <p className="text-sm text-gray-700">
        Lien incomplet.{" "}
        <Link href="/mot-de-passe-oublie" className="text-teal-800 underline">
          Refaire une demande
        </Link>
      </p>
    );
  }
  return <ResetPasswordForm token={jeton} />;
}

export default function NewPasswordPage(props: PageProps<"/mot-de-passe-oublie/nouveau">) {
  return (
    <>
      <h1 className="mb-6 text-xl font-bold text-gray-900">Choisir un nouveau mot de passe</h1>
      <Suspense>
        <Form searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
