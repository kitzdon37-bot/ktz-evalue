import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/admin";
import { Loading, PageTitle } from "@/components/ui";
import { LOGIN_EVENT_SELECT, LoginEvents } from "../parts";

export const metadata: Metadata = { title: "Journal des connexions" };

const PAGE = 50;
const FILTERS = [
  { key: "", label: "Toutes" },
  { key: "reussies", label: "Réussies" },
  { key: "refusees", label: "Refusées" },
];

async function Content({ searchParams }: PageProps<"/admin/connexions">) {
  await requirePlatformAdmin();
  const sp = await searchParams;
  const filtre = typeof sp.filtre === "string" ? sp.filtre : "";
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const page = Math.max(1, Number.parseInt(String(sp.page ?? "1"), 10) || 1);

  const where = {
    ...(filtre === "reussies" ? { success: true } : filtre === "refusees" ? { success: false } : {}),
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" as const } },
            { city: { contains: q, mode: "insensitive" as const } },
            { ip: { contains: q } },
            { user: { name: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };
  const [rows, total] = await Promise.all([
    db.loginEvent.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE, select: LOGIN_EVENT_SELECT }),
    db.loginEvent.count({ where }),
  ]);
  const link = (p: Record<string, string | number>) => {
    const params = new URLSearchParams({ ...(filtre && { filtre }), ...(q && { q }), ...Object.fromEntries(Object.entries(p).map(([k, v]) => [k, String(v)])) });
    for (const [k, v] of [...params]) if (!v) params.delete(k);
    const s = params.toString();
    return `/admin/connexions${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageTitle eyebrow="Administration" title="Journal des connexions" subtitle={`${total} connexion(s) enregistrée(s). Gardées 12 mois.`} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={link({ filtre: f.key, page: "" })}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${filtre === f.key ? "bg-brand-600 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200 hover:ring-stone-300"}`}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <form className="flex gap-2" action="/admin/connexions">
          {filtre && <input type="hidden" name="filtre" value={filtre} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Nom, email, ville ou IP"
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm sm:w-64"
          />
          <button className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white">Chercher</button>
        </form>
      </div>
      <LoginEvents rows={rows} />
      {total > PAGE && (
        <div className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link href={link({ page: page - 1 })} className="font-semibold text-brand-700 hover:underline">
              ← Plus récentes
            </Link>
          ) : (
            <span />
          )}
          <span className="text-stone-500">
            Page {page} sur {Math.ceil(total / PAGE)}
          </span>
          {page * PAGE < total ? (
            <Link href={link({ page: page + 1 })} className="font-semibold text-brand-700 hover:underline">
              Plus anciennes →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </>
  );
}

export default function ConnexionsPage(props: PageProps<"/admin/connexions">) {
  return (
    <Suspense fallback={<Loading />}>
      <Content {...props} />
    </Suspense>
  );
}
