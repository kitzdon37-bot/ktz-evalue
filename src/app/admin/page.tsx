import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { nowMs, ONLINE_MS, requirePlatformAdmin, timeAgo } from "@/lib/admin";
import { METHOD_LABELS } from "@/lib/auth/login-log";
import { Card, CardTitle, Loading, PageTitle } from "@/components/ui";
import { DeviceCell, LOGIN_EVENT_SELECT, LoginEvents, PlaceCell, StatTile } from "./parts";

export const metadata: Metadata = { title: "Administration" };

async function Content() {
  await requirePlatformAdmin();
  const now = nowMs();
  const onlineSince = new Date(now - ONLINE_MS);
  const day = new Date(now - 24 * 3600 * 1000);
  const week = new Date(now - 7 * 24 * 3600 * 1000);

  const [users, companies, newUsers, logins24, failed24, online, recent, failed] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.company.count({ where: { deletedAt: null } }),
    db.user.count({ where: { deletedAt: null, createdAt: { gte: week } } }),
    db.loginEvent.count({ where: { success: true, createdAt: { gte: day } } }),
    db.loginEvent.count({ where: { success: false, createdAt: { gte: day } } }),
    db.session.findMany({
      where: { lastSeenAt: { gte: onlineSince }, expiresAt: { gt: new Date(now) } },
      orderBy: { lastSeenAt: "desc" },
      take: 50,
      select: {
        id: true,
        lastSeenAt: true,
        createdAt: true,
        method: true,
        ip: true,
        userAgent: true,
        country: true,
        region: true,
        city: true,
        user: { select: { id: true, name: true, email: true, company: { select: { name: true } } } },
      },
    }),
    db.loginEvent.findMany({ where: { success: true }, orderBy: { createdAt: "desc" }, take: 15, select: LOGIN_EVENT_SELECT }),
    db.loginEvent.findMany({ where: { success: false }, orderBy: { createdAt: "desc" }, take: 8, select: LOGIN_EVENT_SELECT }),
  ]);
  // Une même personne peut être connectée sur plusieurs appareils : une ligne par personne.
  const seen = new Set<string>();
  const onlineUsers = online.filter((s) => (seen.has(s.user.id) ? false : (seen.add(s.user.id), true)));

  return (
    <>
      <PageTitle eyebrow="Administration" title="Vue d'ensemble" subtitle="Qui utilise KTZ Évalue, en ce moment et ces derniers jours." />

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="En ligne" value={onlineUsers.length} hint="actifs ces 5 dernières minutes" />
        <StatTile label="Connexions 24 h" value={logins24} hint={`${failed24} tentative(s) refusée(s)`} />
        <StatTile label="Utilisateurs" value={users} hint={`${newUsers} nouveau(x) cette semaine`} />
        <StatTile label="Entreprises" value={companies} />
      </div>

      <Card className="mb-8">
        <CardTitle aside={<span className="live-dot" aria-hidden="true" />}>En ligne maintenant</CardTitle>
        {onlineUsers.length === 0 ? (
          <p className="text-sm text-stone-600">Personne n&apos;est actif en ce moment.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {onlineUsers.map((s) => (
              <li key={s.id} className="grid gap-2 py-3 text-sm md:grid-cols-[1.3fr_1fr_1fr_auto] md:items-center">
                <div className="min-w-0">
                  <Link href={`/admin/utilisateurs/${s.user.id}`} className="font-semibold text-brand-700 hover:underline">
                    {s.user.name}
                  </Link>
                  <p className="text-xs text-stone-500 [overflow-wrap:anywhere]">
                    {s.user.email}
                    {s.user.company && ` · ${s.user.company.name}`}
                  </p>
                </div>
                <PlaceCell place={s} />
                <DeviceCell ua={s.userAgent} />
                <p className="text-xs text-stone-500 md:text-right">
                  actif {timeAgo(s.lastSeenAt, now)}
                  <br />
                  {METHOD_LABELS[s.method ?? ""] ?? "Connexion"} {timeAgo(s.createdAt, now)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-stone-900">Dernières connexions</h2>
        <Link href="/admin/connexions" className="text-sm font-semibold text-brand-700 hover:underline">
          Tout le journal →
        </Link>
      </div>
      <LoginEvents rows={recent} />

      <h2 className="mb-3 mt-10 text-lg font-extrabold text-stone-900">Tentatives refusées</h2>
      <LoginEvents rows={failed} />
    </>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Content />
    </Suspense>
  );
}
