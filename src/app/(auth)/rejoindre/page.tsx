import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/auth/tokens";
import { AcceptInvitationForm } from "../forms";

export const metadata: Metadata = { title: "Rejoindre une équipe" };

async function Content({ searchParams }: { searchParams: PageProps<"/rejoindre">["searchParams"] }) {
  const { jeton } = await searchParams;
  const invitation =
    typeof jeton === "string" && jeton
      ? await db.teamInvitation.findUnique({
          where: { tokenHash: hashToken(jeton) },
          select: { email: true, acceptedAt: true, expiresAt: true, company: { select: { name: true } } },
        })
      : null;
  if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
    return (
      <p className="text-sm text-gray-700">
        Cette invitation n&apos;est plus valable. Demandez une nouvelle invitation à votre responsable, ou{" "}
        <Link href="/connexion" className="text-teal-800 underline">
          connectez-vous
        </Link>
        .
      </p>
    );
  }
  return (
    <>
      <p className="mb-6 text-sm text-gray-600">
        Vous êtes invité(e) à rejoindre l&apos;équipe de recrutement de <strong>{invitation.company.name}</strong>.
      </p>
      <AcceptInvitationForm token={jeton as string} email={invitation.email} />
    </>
  );
}

export default function JoinPage(props: PageProps<"/rejoindre">) {
  return (
    <>
      <h1 className="mb-1 text-xl font-bold text-gray-900">Rejoindre l&apos;équipe</h1>
      <Suspense>
        <Content searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
