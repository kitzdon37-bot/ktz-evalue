import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { db } from "@/lib/db";
import { formatDateTime, nowMs, ONLINE_MS, requirePlatformAdmin, timeAgo } from "@/lib/admin";
import { METHOD_LABELS } from "@/lib/auth/login-log";
import { ActionButton } from "@/components/form";
import { BackLink, btn, Card, CardTitle, Loading } from "@/components/ui";
import { revokeSession, revokeSessions } from "../../actions";
import { DeviceCell, LOGIN_EVENT_SELECT, LoginEvents, OnlineDot, PlaceCell, StatTile } from "../../parts";

export const metadata: Metadata = { title: "Utilisateur" };

const ROLE_LABELS = { OWNER: "Propriétaire", RECRUITER: "Recruteur", VIEWER: "Lecteur" } as const;

async function Content({ params }: PageProps<"/admin/utilisateurs/[id]">) {
  const admin = await requirePlatformAdmin();
  const { id } = await params;
  const u = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isPlatformAdmin: true,
      emailVerifiedAt: true,
      createdAt: true,
      deletedAt: true,
      passwordHash: true,
      failedLogins: true,
      lockedUntil: true,
      company: {
        select: {
          id: true,
          name: true,
          sector: true,
          city: true,
          country: true,
          website: true,
          contactPhone: true,
          _count: { select: { tests: true, invitations: true, attempts: true, users: true } },
        },
      },
      sessions: {
        where: { expiresAt: { gt: new Date() } },
        orderBy: { lastSeenAt: "desc" },
        select: { id: true, createdAt: true, lastSeenAt: true, method: true, ip: true, userAgent: true, country: true, region: true, city: true },
      },
      _count: { select: { loginEvents: true, testsCreated: true } },
    },
  });
  if (!u) notFound();
  const events = await db.loginEvent.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, take: 100, select: LOGIN_EVENT_SELECT });
  const now = nowMs();
  const online = u.sessions.some((s) => now - s.lastSeenAt.getTime() < ONLINE_MS);

  const facts: [string, string][] = [
    ["Email", `${u.email}${u.emailVerifiedAt ? " (confirmé)" : " (non confirmé)"}`],
    ["Rôle", `${ROLE_LABELS[u.role]}${u.isPlatformAdmin ? " · administrateur KTZ" : ""}`],
    ["Connexion par", u.passwordHash ? "mot de passe (et Google si même adresse)" : "Google ou lien par email (pas de mot de passe)"],
    ["Compte créé", formatDateTime(u.createdAt)],
    ["Sécurité", u.lockedUntil && u.lockedUntil > new Date() ? `bloqué jusqu'à ${formatDateTime(u.lockedUntil)}` : `${u.failedLogins} essai(s) raté(s) récent(s)`],
  ];
  if (u.deletedAt) facts.push(["Supprimé le", formatDateTime(u.deletedAt)]);

  return (
    <>
      <BackLink href="/admin/utilisateurs">Utilisateurs</BackLink>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">{u.name}</h1>
          <p className="text-stone-600 [overflow-wrap:anywhere]">
            {u.email}
            {u.company && ` · ${u.company.name}`}
          </p>
          <OnlineDot online={online} />
        </div>
        {u.id !== admin.id && u.sessions.length > 0 && (
          <form action={revokeSessions.bind(null, u.id)}>
            <ActionButton className={btn.danger}>
              <LogOut className="h-4 w-4" /> Déconnecter de tous ses appareils
            </ActionButton>
          </form>
        )}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Connexions" value={u._count.loginEvents} />
        <StatTile label="Appareils connectés" value={u.sessions.length} />
        <StatTile label="Tests créés" value={u._count.testsCreated} />
        <StatTile label="Candidats invités" value={u.company?._count.invitations ?? 0} hint={`${u.company?._count.attempts ?? 0} test(s) passé(s)`} />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Informations</CardTitle>
          <dl className="space-y-2 text-sm">
            {facts.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[8rem_1fr] gap-2">
                <dt className="text-stone-500">{k}</dt>
                <dd className="text-stone-900 [overflow-wrap:anywhere]">{v}</dd>
              </div>
            ))}
            {u.company && (
              <div className="grid grid-cols-[8rem_1fr] gap-2">
                <dt className="text-stone-500">Entreprise</dt>
                <dd className="text-stone-900">
                  {u.company.name}
                  {u.company.sector && ` · ${u.company.sector}`}
                  {u.company.city && ` · ${u.company.city}`} ({u.company.country}) · {u.company._count.users} membre(s), {u.company._count.tests} test(s)
                  {u.company.website && (
                    <>
                      {" · "}
                      <a href={u.company.website} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline">
                        site
                      </a>
                    </>
                  )}
                  {u.company.contactPhone && ` · ${u.company.contactPhone}`}
                </dd>
              </div>
            )}
          </dl>
        </Card>

        <Card>
          <CardTitle>Appareils connectés</CardTitle>
          {u.sessions.length === 0 ? (
            <p className="text-sm text-stone-600">Aucune session ouverte.</p>
          ) : (
            <ul className="divide-y divide-stone-100 text-sm">
              {u.sessions.map((s) => (
                <li key={s.id} className="flex flex-wrap items-start justify-between gap-2 py-3">
                  <div className="space-y-1">
                    <div>
                      <DeviceCell ua={s.userAgent} />
                    </div>
                    <div>
                      <PlaceCell place={s} />
                    </div>
                    <p className="text-xs text-stone-500">
                      {METHOD_LABELS[s.method ?? ""] ?? "Connexion"} {timeAgo(s.createdAt, now)} · actif {timeAgo(s.lastSeenAt, now)}
                    </p>
                  </div>
                  {u.id !== admin.id && (
                    <form action={revokeSession.bind(null, s.id)}>
                      <ActionButton className={btn.small}>Fermer</ActionButton>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <h2 className="mb-3 text-lg font-extrabold text-stone-900">Historique des connexions</h2>
      <LoginEvents rows={events} showUser={false} />
    </>
  );
}

export default function UserPage(props: PageProps<"/admin/utilisateurs/[id]">) {
  return (
    <Suspense fallback={<Loading />}>
      <Content {...props} />
    </Suspense>
  );
}
