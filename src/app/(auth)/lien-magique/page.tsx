import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ConfirmMagicLinkForm } from "../forms";

export const metadata: Metadata = { title: "Connexion par lien" };

async function Form({ searchParams }: { searchParams: PageProps<"/lien-magique">["searchParams"] }) {
  const { jeton } = await searchParams;
  if (typeof jeton !== "string" || !jeton) {
    return (
      <p className="text-sm text-gray-700">
        Lien incomplet.{" "}
        <Link href="/connexion" className="text-teal-800 underline">
          Retour à la connexion
        </Link>
      </p>
    );
  }
  return <ConfirmMagicLinkForm token={jeton} />;
}

export default function MagicLinkPage(props: PageProps<"/lien-magique">) {
  return (
    <>
      <h1 className="mb-1 text-xl font-bold text-gray-900">Connexion par lien</h1>
      <p className="mb-6 text-sm text-gray-600">Cliquez sur le bouton pour ouvrir votre espace.</p>
      <Suspense>
        <Form searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
