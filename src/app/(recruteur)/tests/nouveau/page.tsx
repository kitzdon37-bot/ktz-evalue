import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireEditor } from "@/lib/tenant";
import { isAiConfigured } from "@/lib/ai";
import { BackLink, PageTitle } from "@/components/ui";
import { NewTestForm } from "./new-test-form";

export const metadata: Metadata = { title: "Nouveau test" };
// La génération par IA peut prendre jusqu'à une minute.
export const maxDuration = 120;

async function Content() {
  await requireEditor();
  return <NewTestForm aiAvailable={isAiConfigured()} />;
}

export default function NewTestPage() {
  return (
    <>
      <BackLink href="/tests">Tests</BackLink>
      <PageTitle
        title="Nouveau test — étape 1 sur 3"
        subtitle="Décrivez le poste. Vous relirez et validerez tout avant l'envoi aux candidats."
      />
      <p className="mb-4 text-sm text-gray-700">
        Vous préférez partir d&apos;un test prêt à l&apos;emploi ?{" "}
        <Link href="/bibliotheque" className="font-semibold text-teal-800 underline">
          Choisir un modèle dans la bibliothèque
        </Link>
      </p>
      <Suspense fallback={<p className="text-gray-600">Chargement…</p>}>
        <Content />
      </Suspense>
    </>
  );
}
