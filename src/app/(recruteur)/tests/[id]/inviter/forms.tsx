"use client";

import { useActionState, useState } from "react";
import { ActionButton, FormMessage } from "@/components/form";
import { btn, input, label } from "@/components/ui";
import { inviteCandidates, updatePublicLink } from "./actions";

export function InviteCandidatesForm({ testId }: { testId: string }) {
  const [state, action] = useActionState(inviteCandidates.bind(null, testId), undefined);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <div>
        <label htmlFor="list" className={label}>
          Candidats — un par ligne : nom ; email ; téléphone
        </label>
        <textarea
          id="list"
          name="list"
          rows={5}
          className={`${input} mt-1 font-mono text-sm`}
          placeholder={"Marie Yakité ; marie@exemple.cf ; 75 12 34 56\nJean Ndomaté ; ; +236 72 00 00 00"}
        />
        <p className="mt-1 text-sm text-gray-600">L&apos;email ou le téléphone suffit. Les numéros à 8 chiffres sont considérés comme centrafricains (+236).</p>
      </div>
      <div>
        <label htmlFor="file" className={label}>
          Ou importer un fichier (CSV ou Excel .xlsx)
        </label>
        <input id="file" name="file" type="file" accept=".csv,.xlsx,.txt" className="mt-1 block w-full text-sm" />
      </div>
      <fieldset className="flex flex-wrap gap-4">
        <legend className={label}>Envoyer l&apos;invitation par</legend>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" name="byEmail" defaultChecked className="h-5 w-5" /> Email
        </label>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" name="byWhatsapp" defaultChecked className="h-5 w-5" /> WhatsApp
        </label>
      </fieldset>
      <ActionButton className={btn.primary} pendingText="Envoi des invitations…">
        Inviter
      </ActionButton>
    </form>
  );
}

export function CopyButton({ text, label: text2 = "Copier le lien" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={btn.small}
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
    >
      {copied ? "Copié !" : text2}
    </button>
  );
}

export function PublicLinkForm({
  testId,
  url,
  max,
  used,
  shareText,
}: {
  testId: string;
  url: string | null;
  max: number | null;
  used: number;
  shareText: string;
}) {
  const [state, action] = useActionState(updatePublicLink.bind(null, testId), undefined);
  return (
    <div className="space-y-3">
      {url && (
        <div className="space-y-2 rounded-md bg-gray-50 p-3">
          <p className="break-all font-mono text-sm text-gray-900">{url}</p>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={url} />
            <a
              className={btn.small}
              href={`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Partager sur WhatsApp
            </a>
          </div>
          <p className="text-sm text-gray-600">
            {used} candidat(s) inscrit(s) par ce lien{max ? ` sur ${max} maximum` : ""}.
          </p>
        </div>
      )}
      <form action={action} className="space-y-3">
        <FormMessage state={state} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="enabled" defaultChecked={!!url} className="h-5 w-5" /> Lien public activé
        </label>
        <div className="max-w-xs">
          <label htmlFor="max" className={label}>
            Nombre maximal de passages (facultatif)
          </label>
          <input id="max" name="max" type="number" min={1} defaultValue={max ?? ""} className={`${input} mt-1`} />
        </div>
        <ActionButton className={btn.secondary}>Enregistrer</ActionButton>
      </form>
    </div>
  );
}
