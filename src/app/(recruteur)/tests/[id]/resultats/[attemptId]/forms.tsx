"use client";

import { useActionState } from "react";
import { ActionButton, FormMessage } from "@/components/form";
import { btn, input } from "@/components/ui";
import { overrideAnswerScore, saveRecruiterNote } from "../actions";

export function NoteForm({ attemptId, note }: { attemptId: string; note: string }) {
  const [state, action] = useActionState(saveRecruiterNote.bind(null, attemptId), undefined);
  return (
    <form action={action} className="space-y-2">
      <FormMessage state={state} />
      <textarea name="note" rows={4} defaultValue={note} aria-label="Note interne" className={input} placeholder="Note visible uniquement par votre équipe." />
      <ActionButton className={btn.secondary}>Enregistrer la note</ActionButton>
    </form>
  );
}

export function OverrideForm({ answerId, current, max }: { answerId: string; current: number | null; max: number }) {
  const [state, action] = useActionState(overrideAnswerScore.bind(null, answerId), undefined);
  return (
    <form action={action} className="mt-2 flex flex-wrap items-center gap-2">
      <label className="text-sm text-stone-700" htmlFor={`o-${answerId}`}>
        Modifier la note :
      </label>
      <input
        id={`o-${answerId}`}
        name="score"
        inputMode="decimal"
        defaultValue={current ?? ""}
        placeholder={`0 à ${max}`}
        className="w-24 rounded border border-stone-300 px-2 py-1.5 text-sm"
      />
      <span className="text-sm text-stone-600">/ {max}</span>
      <ActionButton className={btn.small}>Enregistrer</ActionButton>
      <div className="w-full">
        <FormMessage state={state} />
      </div>
    </form>
  );
}
