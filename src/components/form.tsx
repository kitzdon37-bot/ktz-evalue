"use client";

import { useFormStatus } from "react-dom";
import type { FormState } from "@/lib/auth/schemas";

export function Field({
  label,
  name,
  type = "text",
  autoComplete,
  errors,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  errors?: string[];
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-800">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        aria-invalid={errors ? true : undefined}
        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/30"
      />
      {hint && !errors && <p className="text-sm text-gray-500">{hint}</p>}
      {errors?.map((e) => (
        <p key={e} className="text-sm text-red-700">
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
      className="w-full rounded-md bg-teal-700 px-4 py-3 text-base font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
    >
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
      {isMine ? pendingText : children}
    </button>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  return (
    <>
      {state?.success && (
        <p role="status" className="rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-900">
          {state.success}
        </p>
      )}
      {state?.message && (
        <p role="alert" className="whitespace-pre-line rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.message}
        </p>
      )}
    </>
  );
}
