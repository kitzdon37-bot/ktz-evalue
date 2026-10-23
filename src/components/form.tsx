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

export function FormMessage({ state }: { state: FormState }) {
  if (state?.message) {
    return (
      <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
        {state.message}
      </p>
    );
  }
  if (state?.success) {
    return (
      <p role="status" className="rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-900">
        {state.success}
      </p>
    );
  }
  return null;
}
