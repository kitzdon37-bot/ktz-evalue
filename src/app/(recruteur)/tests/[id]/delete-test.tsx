"use client";

import { useActionState, useState } from "react";
import { Trash2, TriangleAlert } from "lucide-react";
import { ActionButton, FormMessage } from "@/components/form";
import { btn, input } from "@/components/ui";
import { deleteTest } from "../actions";

// Suppression définitive d'un test, avec confirmation. Si des candidats ont été invités,
// il faut taper « SUPPRIMER » : leurs résultats seront effacés eux aussi.
export function DeleteTest({ testId, candidates, isDraft }: { testId: string; candidates: number; isDraft: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(deleteTest.bind(null, testId), undefined);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={`${btn.danger} w-full`}>
        <Trash2 className="h-4 w-4" /> {isDraft ? "Supprimer le brouillon" : "Supprimer le test"}
      </button>
    );
  }

  return (
    <form action={action} className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm">
      <p className="flex gap-2 text-red-900">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
        <span>
          <strong>Suppression définitive.</strong>{" "}
          {candidates > 0 ? (
            <>
              Le test, ses questions et les résultats de <strong>{candidates} candidat(s)</strong> seront effacés. Cette action ne peut pas
              être annulée. Pour garder les résultats, préférez « Archiver ».
            </>
          ) : (
            <>Le test et toutes ses questions seront effacés. Cette action ne peut pas être annulée.</>
          )}
        </span>
      </p>
      {candidates > 0 && (
        <div>
          <label htmlFor={`confirm-${testId}`} className="block text-xs font-semibold text-red-900">
            Tapez SUPPRIMER pour confirmer
          </label>
          <input id={`confirm-${testId}`} name="confirm" autoComplete="off" className={`${input} mt-1`} placeholder="SUPPRIMER" />
        </div>
      )}
      <FormMessage state={state} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <ActionButton className={`${btn.danger} flex-1 bg-red-600 text-white hover:bg-red-700`} pendingText="Suppression…">
          <Trash2 className="h-4 w-4" /> Supprimer définitivement
        </ActionButton>
        <button type="button" onClick={() => setOpen(false)} className={`${btn.secondary} flex-1`}>
          Annuler
        </button>
      </div>
    </form>
  );
}
