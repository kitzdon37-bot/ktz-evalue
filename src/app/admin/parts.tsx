import Link from "next/link";
import { MapPin, Monitor, Smartphone } from "lucide-react";
import { describeDevice, describePlace, mapUrl, METHOD_LABELS } from "@/lib/auth/login-log";
import { formatDateTime, nowMs, timeAgo } from "@/lib/admin";

type Place = { country: string | null; region: string | null; city: string | null; ip: string | null };

export function PlaceCell({ place }: { place: Place }) {
  const url = mapUrl(place);
  const text = describePlace(place);
  return (
    <span className="inline-flex flex-col">
      <span className="inline-flex items-center gap-1 text-stone-800">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-600" />
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline" title="Voir sur la carte">
            {text}
          </a>
        ) : (
          text
        )}
      </span>
      {place.ip && <span className="font-mono text-[11px] text-stone-500">{place.ip}</span>}
    </span>
  );
}

export function DeviceCell({ ua }: { ua: string | null }) {
  const d = describeDevice(ua);
  const Icon = d.mobile ? Smartphone : Monitor;
  return (
    <span className="inline-flex items-center gap-1.5 text-stone-700" title={ua ?? ""}>
      <Icon className="h-3.5 w-3.5 shrink-0 text-stone-500" /> {d.label}
    </span>
  );
}

export function OnlineDot({ online }: { online: boolean }) {
  return online ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
      <span className="live-dot" aria-hidden="true" /> En ligne
    </span>
  ) : null;
}

export type LoginEventRow = {
  id: string;
  email: string;
  method: string;
  success: boolean;
  reason: string | null;
  ip: string | null;
  userAgent: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  createdAt: Date;
  user: { id: string; name: string; company: { name: string } | null } | null;
};

// Liste des connexions : cartes empilées sur téléphone, tableau sur ordinateur.
export function LoginEvents({ rows, showUser = true }: { rows: LoginEventRow[]; showUser?: boolean }) {
  if (rows.length === 0) return <p className="text-sm text-stone-600">Aucune connexion pour le moment.</p>;
  const now = nowMs();
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="hidden bg-stone-50 text-xs uppercase tracking-wider text-stone-500 md:table-header-group">
          <tr>
            <th className="px-4 py-2.5 font-semibold">Quand</th>
            {showUser && <th className="px-4 py-2.5 font-semibold">Qui</th>}
            <th className="px-4 py-2.5 font-semibold">Comment</th>
            <th className="px-4 py-2.5 font-semibold">Lieu</th>
            <th className="px-4 py-2.5 font-semibold">Appareil</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map((e) => (
            <tr key={e.id} className="grid grid-cols-1 gap-1 px-4 py-3 md:table-row md:px-0 md:py-0">
              <td className="md:px-4 md:py-3">
                <span className="font-semibold text-stone-900">{timeAgo(e.createdAt, now)}</span>
                <span className="block text-xs text-stone-500">{formatDateTime(e.createdAt)}</span>
              </td>
              {showUser && (
                <td className="md:px-4 md:py-3">
                  {e.user ? (
                    <Link href={`/admin/utilisateurs/${e.user.id}`} className="font-semibold text-brand-700 hover:underline">
                      {e.user.name}
                    </Link>
                  ) : (
                    <span className="font-semibold text-stone-700">Inconnu</span>
                  )}
                  <span className="block text-xs text-stone-500 [overflow-wrap:anywhere]">
                    {e.email}
                    {e.user?.company && ` · ${e.user.company.name}`}
                  </span>
                </td>
              )}
              <td className="md:px-4 md:py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${e.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                >
                  {e.success ? "Réussie" : "Refusée"}
                </span>{" "}
                <span className="text-stone-700">{METHOD_LABELS[e.method] ?? e.method}</span>
                {e.reason && <span className="block text-xs text-red-700">{e.reason}</span>}
              </td>
              <td className="md:px-4 md:py-3">
                <PlaceCell place={e} />
              </td>
              <td className="md:px-4 md:py-3">
                <DeviceCell ua={e.userAgent} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatTile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-stone-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-stone-500">{hint}</p>}
    </div>
  );
}

export const LOGIN_EVENT_SELECT = {
  id: true,
  email: true,
  method: true,
  success: true,
  reason: true,
  ip: true,
  userAgent: true,
  country: true,
  region: true,
  city: true,
  createdAt: true,
  user: { select: { id: true, name: true, company: { select: { name: true } } } },
} as const;
