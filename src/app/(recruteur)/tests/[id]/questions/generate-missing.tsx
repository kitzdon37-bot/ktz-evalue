"use client";

import { useActionState } from "react";
import { ActionButton, FormMessage } from "@/components/form";
import { btn } from "@/components/ui";
import { generateMissingQuestions } from "../../actions";

export function GenerateMissing({ testId, missing }: { testId: string; missing: number }) {
  const [state, action] = useActionState(generateMissingQuestions.bind(null, testId), undefined);
  return (
    <form action={action} className="space-y-2">
      <FormMessage state={state} />
      <ActionButton className={btn.primary} pendingText="Génération en cours (1 à 2 minutes)…">
        Générer {missing} question(s) avec l&apos;IA
      </ActionButton>
    </form>
  );
}
