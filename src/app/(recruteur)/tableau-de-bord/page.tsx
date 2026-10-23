import type { Metadata } from "next";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { requireCompany } from "@/lib/tenant";
import { ResendVerification } from "./resend-verification";

export const metadata: Metadata = { title: "Tableau de bord" };

async function Dashboard() {
  const user = await requireCompany();
  const companyId = user.companyId;

  // Chaque compteur est filtré sur l'entreprise de l'utilisateur connecté.
  const [activeTests, invitations, toReview, company] = await Promise.all([
    db.test.count({ where: { companyId, status: "PUBLISHED" } }),
    db.invitation.count({ where: { companyId } }),
    db.attempt.count({ where: { companyId, status: "COMPLETED", recruiterStatus: "TO_REVIEW" } }),
    db.company.findUnique({ where: { id: companyId }, select: { creditsRemaining: true } }),
  ]);

  const stats = [
    { label: "Tests en cours", value: activeTests },
    { label: "Invitations envoyées", value: invitations },
    { label: "Tests terminés à examiner", value: toReview },
    { label: "Crédits restants", value: company?.creditsRemaining ?? 0 },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">Bonjour {user.name}</h1>
      <p className="mt-1 text-gray-600">{user.companyName}</p>

      {!user.emailVerified && (
        <div role="status" className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900">
          <p className="text-sm">
            Confirmez votre adresse email ({user.email}) en cliquant sur le lien que nous vous avons envoyé.
          </p>
          <ResendVerification />
        </div>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-gray-200 bg-white p-4">
            <dt className="text-sm text-gray-600">{s.label}</dt>
            <dd className="mt-1 text-3xl font-bold text-gray-900">{s.value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-8 rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center">
        <h2 className="text-lg font-semibold text-gray-900">Aucun test pour le moment</h2>
        <p className="mt-1 text-sm text-gray-600">
          La création de tests avec l&apos;IA arrive à la prochaine étape.
        </p>
      </section>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="text-gray-600">Chargement…</p>}>
      <Dashboard />
    </Suspense>
  );
}
