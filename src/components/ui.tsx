import Link from "next/link";
import { ArrowLeft, CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from "lucide-react";

// Classes communes, pour garder une apparence cohérente sur tout le site.
const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60";

export const btn = {
  primary: `${base} bg-brand-700 px-4 py-2.5 text-sm text-white shadow-sm shadow-brand-900/20 hover:bg-brand-800 hover:shadow-md active:scale-[0.98]`,
  accent: `${base} bg-sun-400 px-4 py-2.5 text-sm text-stone-900 shadow-sm hover:bg-sun-300 active:scale-[0.98]`,
  secondary: `${base} border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 shadow-sm hover:border-stone-300 hover:bg-stone-50`,
  ghost: `${base} px-3 py-2 text-sm text-stone-700 hover:bg-stone-100`,
  danger: `${base} border border-red-200 bg-white px-4 py-2.5 text-sm text-red-700 hover:bg-red-50`,
  small: `${base} rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:border-stone-300`,
};

export const input =
  "block w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-base text-stone-900 shadow-sm placeholder:text-stone-400 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15";

export const label = "block text-sm font-semibold text-stone-800";

export function PageTitle({
  title,
  subtitle,
  action,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-wider text-brand-600">{eyebrow}</p>}
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-stone-600">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-stone-200/80 bg-white p-5 shadow-soft sm:p-6 ${className}`}>{children}</div>;
}

export function CardTitle({ icon: Icon, children, aside }: { icon?: LucideIcon; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-base font-bold text-stone-900">
        {Icon && (
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
            <Icon className="h-4 w-4" />
          </span>
        )}
        {children}
      </h2>
      {aside}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-stone-100 text-stone-700 ring-stone-200",
  PUBLISHED: "bg-brand-50 text-brand-800 ring-brand-200",
  CLOSED: "bg-sun-50 text-sun-700 ring-sun-200",
  ARCHIVED: "bg-stone-100 text-stone-500 ring-stone-200",
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[status] ?? ""}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "PUBLISHED" ? "bg-brand-500" : status === "CLOSED" ? "bg-sun-500" : "bg-stone-400"}`} />
      {label}
    </span>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warning" | "error" | "success"; children: React.ReactNode }) {
  const styles = {
    info: { box: "border-sky-200 bg-sky-50 text-sky-950", icon: Info, ic: "text-sky-600" },
    warning: { box: "border-sun-200 bg-sun-50 text-stone-900", icon: TriangleAlert, ic: "text-sun-600" },
    error: { box: "border-red-200 bg-red-50 text-red-900", icon: CircleAlert, ic: "text-red-600" },
    success: { box: "border-brand-200 bg-brand-50 text-brand-950", icon: CircleCheck, ic: "text-brand-600" },
  }[tone];
  const Icon = styles.icon;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex gap-3 rounded-xl border px-4 py-3 text-sm ${styles.box}`}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${styles.ic}`} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-brand-700">
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      {children}
    </Link>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: LucideIcon;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-12 text-center">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-sun-50 text-brand-700 ring-1 ring-brand-100">
        <Icon className="h-7 w-7" />
      </div>
      <p className="text-lg font-bold text-stone-900">{title}</p>
      {children && <div className="mx-auto mt-1 max-w-md text-sm text-stone-600">{children}</div>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-stone-200/70" />
      <div className="h-4 w-96 max-w-full animate-pulse rounded bg-stone-200/60" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-32 animate-pulse rounded-2xl bg-stone-200/50" />
        <div className="h-32 animate-pulse rounded-2xl bg-stone-200/50" />
      </div>
    </div>
  );
}
