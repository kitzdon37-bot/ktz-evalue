"use client";

import { useFormStatus } from "react-dom";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import type { FormState } from "@/lib/auth/schemas";
import { input } from "./ui";

export function Field({
  label,
  name,
  type = "text",
  autoComplete,
  errors,
  hint,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  errors?: string[];
  hint?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-semibold text-stone-800">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        aria-invalid={errors ? true : undefined}
        className={`${input} py-3 ${errors ? "border-red-300 focus:border-red-400 focus:ring-red-500/15" : ""}`}
      />
      {hint && !errors && <p className="text-xs text-stone-500">{hint}</p>}
      {errors?.map((e) => (
        <p key={e} className="flex items-center gap-1.5 text-sm text-red-700">
          <CircleAlert className="h-3.5 w-3.5 shrink-0" />
          {e}
        </p>
      ))}
    </div>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-3 text-base font-semibold text-white shadow-sm shadow-brand-900/20 transition hover:bg-brand-800 hover:shadow-md active:scale-[0.99] disabled:opacity-70"
    >
      {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
      {pending ? "Veuillez patienter…" : children}
    </button>
  );
}

// Bouton d'envoi avec un nom/valeur (pour distinguer plusieurs actions dans un formulaire)
// et un texte d'attente personnalisable.
export function ActionButton({
  children,
  className,
  name,
  value,
  pendingText = "Veuillez patienter…",
  disabled,
}: {
  children: React.ReactNode;
  className: string;
  name?: string;
  value?: string;
  pendingText?: string;
  disabled?: boolean;
}) {
  const { pending, data } = useFormStatus();
  // Le texte d'attente ne s'affiche que sur le bouton cliqué.
  const isMine = pending && (!name || data?.get(name) === value);
  return (
    <button type="submit" name={name} value={value} disabled={pending || disabled} className={className}>
      {isMine && <LoaderCircle className="h-4 w-4 animate-spin" />}
      {isMine ? pendingText : children}
    </button>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  return (
    <>
      {state?.success && (
        <p role="status" className="flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-sm text-brand-950">
          <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          {state.success}
        </p>
      )}
      {state?.message && (
        <p role="alert" className="flex items-start gap-2 whitespace-pre-line rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-900">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <span>{state.message}</span>
        </p>
      )}
    </>
  );
}
