"use client";

import { useActionState } from "react";
import { ActionButton, FormMessage } from "@/components/form";
import { btn, input, label } from "@/components/ui";
import { inviteMember } from "./actions";

function Errors({ list }: { list?: string[] }) {
  return list?.map((e) => (
    <p key={e} className="mt-1 text-sm text-red-700">
      {e}
    </p>
  ));
}

export function InviteForm() {
  const [state, action] = useActionState(inviteMember, undefined);
  return (
    <form action={action} className="space-y-3">
      <FormMessage state={state} />
      <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
        <div>
          <label htmlFor="invite-email" className={label}>
            Email du membre
          </label>
          <input id="invite-email" name="email" type="email" required className={`${input} mt-1`} />
          <Errors list={state?.errors?.email} />
        </div>
        <div>
          <label htmlFor="invite-role" className={label}>
            Rôle
          </label>
          <select id="invite-role" name="role" defaultValue="RECRUITER" className={`${input} mt-1`}>
            <option value="RECRUITER">Recruteur (crée et modifie)</option>
            <option value="VIEWER">Lecteur (consulte)</option>
          </select>
        </div>
      </div>
      <ActionButton className={btn.primary}>Envoyer l&apos;invitation</ActionButton>
    </form>
  );
}
