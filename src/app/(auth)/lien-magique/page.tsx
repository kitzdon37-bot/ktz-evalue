import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ConfirmMagicLinkForm } from "../forms";

export const metadata: Metadata = { title: "Connexion par lien" };

async function Form({ searchParams }: { searchParams: PageProps<"/lien-magique">["searchParams"] }) {
  const { jeton } = await searchParams;
  if (typeof jeton !== "string" || !jeton) {
    return (
      <p className="text-sm text-stone-700">
        Lien incomplet.{" "}
        <Link href="/connexion" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
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
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-stone-900">Connexion par lien</h1>
      <p className="mb-6 text-sm text-stone-600">Cliquez sur le bouton pour ouvrir votre espace.</p>
      <Suspense>
        <Form searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
