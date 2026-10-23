"use client";

import { useActionState } from "react";
import { resendVerification } from "../../(auth)/actions";

export function ResendVerification() {
  const [state, action, pending] = useActionState(resendVerification, undefined);
  if (state?.success) return <p className="mt-2 text-sm">{state.success}</p>;
  return (
    <form action={action}>
      <button type="submit" disabled={pending} className="mt-2 text-sm font-semibold underline disabled:opacity-60">
        {pending ? "Envoi…" : "Renvoyer l'email de confirmation"}
      </button>
    </form>
  );
}
