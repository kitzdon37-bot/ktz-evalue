import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { nowMs, ONLINE_MS, requirePlatformAdmin, timeAgo } from "@/lib/admin";
import { describePlace } from "@/lib/auth/login-log";
import { Loading, PageTitle } from "@/components/ui";
import { OnlineDot } from "../parts";

export const metadata: Metadata = { title: "Utilisateurs" };

async function Content({ searchParams }: PageProps<"/admin/utilisateurs">) {
  await requirePlatformAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const users = await db.user.findMany({
    where: {
      deletedAt: null,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { company: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isPlatformAdmin: true,
      createdAt: true,
      passwordHash: true,
      company: { select: { name: true } },
      sessions: { orderBy: { lastSeenAt: "desc" }, take: 1, select: { lastSeenAt: true } },
      loginEvents: {
        where: { success: true },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true, method: true, country: true, region: true, city: true, ip: true },
      },
      _count: { select: { loginEvents: { where: { success: true } } } },
    },
  });
  const now = nowMs();

  return (
    <>
      <PageTitle eyebrow="Administration" title="Utilisateurs" subtitle={`${users.length} compte(s)${q ? ` pour « ${q} »` : ""}, du plus récent au plus ancien.`} />
      <form className="mb-4 flex gap-2" action="/admin/utilisateurs">
        <input
          name="q"
          defaultValue={q}
          placeholder="Nom, email ou entreprise"
          className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm sm:w-80"
        />
        <button className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white">Chercher</button>
      </form>
      <ul className="grid gap-3 md:grid-cols-2">
        {users.map((u) => {
          const last = u.loginEvents[0];
          const seen = u.sessions[0]?.lastSeenAt;
          return (
            <li key={u.id}>
              <Link
                href={`/admin/utilisateurs/${u.id}`}
                className="block rounded-2xl border border-stone-200 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-stone-900">
                      {u.name}{" "}
                      {u.isPlatformAdmin && <span className="ml-1 rounded-full bg-ink-900 px-2 py-0.5 text-[10px] font-bold uppercase text-white">Admin</span>}
                    </p>
                    <p className="text-xs text-stone-500 [overflow-wrap:anywhere]">{u.email}</p>
                    <p className="text-xs text-stone-500">{u.company?.name ?? "Équipe KTZ"}</p>
                  </div>
                  <OnlineDot online={Boolean(seen && now - seen.getTime() < ONLINE_MS)} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-stone-600">
                  <p>
                    <span className="block font-semibold text-stone-800">Dernière connexion</span>
                    {last ? `${timeAgo(last.createdAt, now)} · ${describePlace(last)}` : "jamais (depuis l'ajout du journal)"}
                  </p>
                  <p>
                    <span className="block font-semibold text-stone-800">Compte</span>
                    créé {timeAgo(u.createdAt, now)} · {u._count.loginEvents} connexion(s)
                    {!u.passwordHash && " · Google"}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default function UsersPage(props: PageProps<"/admin/utilisateurs">) {
  return (
    <Suspense fallback={<Loading />}>
      <Content {...props} />
    </Suspense>
  );
}
