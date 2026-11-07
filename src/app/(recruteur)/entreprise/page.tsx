import type { Metadata } from "next";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { requireCompany } from "@/lib/tenant";
import { ROLE_LABELS } from "@/lib/tests/model";
import { ActionButton } from "@/components/form";
import { btn, Card, Notice, PageTitle , Loading } from "@/components/ui";
import { cancelInvitation, changeRole, removeMember } from "./actions";
import { InviteForm } from "./forms";
import { CompanyForm } from "./company-form";

export const metadata: Metadata = { title: "Entreprise et équipe" };

async function Content({ searchParams }: { searchParams: PageProps<"/entreprise">["searchParams"] }) {
  const { bienvenue } = await searchParams;
  const user = await requireCompany();
  const isOwner = user.role === "OWNER";
  const [company, members, invitations] = await Promise.all([
    db.company.findUniqueOrThrow({
      where: { id: user.companyId },
      select: {
        name: true,
        sector: true,
        country: true,
        city: true,
        primaryColor: true,
        description: true,
        website: true,
        contactEmail: true,
        contactPhone: true,
        logoUrl: true,
      },
    }),
    db.user.findMany({
      where: { companyId: user.companyId, deletedAt: null },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, role: true },
    }),
    isOwner
      ? db.teamInvitation.findMany({
          where: { companyId: user.companyId, acceptedAt: null, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: "desc" },
          select: { id: true, email: true, role: true, expiresAt: true },
        })
      : Promise.resolve([]),
  ]);
  const invitedCount = members.filter((m) => m.role !== "OWNER").length + invitations.length;

  return (
    <>
      <PageTitle eyebrow="Paramètres" title="Entreprise et équipe" subtitle="Ces informations sont visibles par les candidats au début du test." />
      <div className="space-y-6">
        {bienvenue && (
          <Notice tone="success">
            <strong>Bienvenue sur KTZ Évalue !</strong> Votre compte est créé avec Google. Indiquez le vrai nom de votre entreprise
            ci-dessous : il est montré aux candidats au début de chaque test.
          </Notice>
        )}
        <Card>
          <h2 className="mb-4 text-base font-bold text-stone-900">Fiche entreprise</h2>
          <CompanyForm
            readOnly={!isOwner}
            values={{
              name: company.name,
              sector: company.sector ?? "",
              country: company.country,
              city: company.city ?? "",
              primaryColor: company.primaryColor ?? "",
              description: company.description ?? "",
              website: company.website ?? "",
              contactEmail: company.contactEmail ?? "",
              contactPhone: company.contactPhone ?? "",
              logoUrl: company.logoUrl ?? "",
            }}
          />
        </Card>

        <Card>
          <h2 className="mb-1 text-base font-bold text-stone-900">Équipe</h2>
          <p className="mb-4 text-sm text-stone-600">Jusqu&apos;à 3 membres en plus du propriétaire.</p>
          <ul className="divide-y divide-stone-100">
            {members.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span>
                  <span className="block font-medium text-stone-900">
                    {m.name} {m.id === user.id && <span className="text-sm text-stone-500">(vous)</span>}
                  </span>
                  <span className="block text-sm text-stone-600">{m.email}</span>
                </span>
                {isOwner && m.role !== "OWNER" ? (
                  <span className="flex flex-wrap items-center gap-2">
                    <form action={changeRole.bind(null, m.id)} className="flex gap-2">
                      <select name="role" defaultValue={m.role} aria-label={`Rôle de ${m.name}`} className="rounded border border-stone-300 px-2 py-1.5 text-sm">
                        <option value="RECRUITER">{ROLE_LABELS.RECRUITER}</option>
                        <option value="VIEWER">{ROLE_LABELS.VIEWER}</option>
                      </select>
                      <ActionButton className={btn.small}>Changer</ActionButton>
                    </form>
                    <form action={removeMember.bind(null, m.id)}>
                      <ActionButton className={`${btn.small} text-red-700`}>Retirer</ActionButton>
                    </form>
                  </span>
                ) : (
                  <span className="text-sm text-stone-700">{ROLE_LABELS[m.role]}</span>
                )}
              </li>
            ))}
            {invitations.map((inv) => (
              <li key={inv.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span>
                  <span className="block text-stone-900">{inv.email}</span>
                  <span className="block text-sm text-stone-600">
                    Invitation en attente · {ROLE_LABELS[inv.role]} · expire le{" "}
                    {inv.expiresAt.toLocaleDateString("fr-FR", { timeZone: "Africa/Bangui" })}
                  </span>
                </span>
                <form action={cancelInvitation.bind(null, inv.id)}>
                  <ActionButton className={btn.small}>Annuler</ActionButton>
                </form>
              </li>
            ))}
          </ul>
          {isOwner && invitedCount < 3 && (
            <div className="mt-4 border-t border-stone-100 pt-4">
              <InviteForm />
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

export default function CompanyPage(props: PageProps<"/entreprise">) {
  return (
    <Suspense fallback={<Loading />}>
      <Content searchParams={props.searchParams} />
    </Suspense>
  );
}
