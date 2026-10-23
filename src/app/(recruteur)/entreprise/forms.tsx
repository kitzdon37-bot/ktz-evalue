"use client";

import { useActionState } from "react";
import { ActionButton, FormMessage } from "@/components/form";
import { btn, input, label } from "@/components/ui";
import { COUNTRIES } from "@/lib/countries";
import { inviteMember, updateCompany } from "./actions";

function Errors({ list }: { list?: string[] }) {
  return list?.map((e) => (
    <p key={e} className="mt-1 text-sm text-red-700">
      {e}
    </p>
  ));
}

export function CompanyForm({
  values,
  readOnly,
}: {
  values: { name: string; sector: string; country: string; city: string; primaryColor: string };
  readOnly: boolean;
}) {
  const [state, action] = useActionState(updateCompany, undefined);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <fieldset disabled={readOnly} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className={label}>
            Nom de l&apos;entreprise (affiché aux candidats)
          </label>
          <input id="name" name="name" defaultValue={values.name} className={`${input} mt-1`} />
          <Errors list={state?.errors?.name} />
        </div>
        <div>
          <label htmlFor="sector" className={label}>
            Secteur
          </label>
          <input id="sector" name="sector" defaultValue={values.sector} placeholder="Ex. : ONG, banque, BTP" className={`${input} mt-1`} />
        </div>
        <div>
          <label htmlFor="country" className={label}>
            Pays
          </label>
          <select id="country" name="country" defaultValue={values.country} className={`${input} mt-1`}>
            {Object.entries(COUNTRIES).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="city" className={label}>
            Ville
          </label>
          <input id="city" name="city" defaultValue={values.city} placeholder="Ex. : Bangui" className={`${input} mt-1`} />
        </div>
        <div>
          <label htmlFor="primaryColor" className={label}>
            Couleur principale
          </label>
          <input
            id="primaryColor"
            name="primaryColor"
            type="color"
            defaultValue={values.primaryColor || "#0f766e"}
            className="mt-1 h-11 w-20 rounded-md border border-gray-300"
          />
          <Errors list={state?.errors?.primaryColor} />
        </div>
      </fieldset>
      {!readOnly && <ActionButton className={btn.primary}>Enregistrer</ActionButton>}
    </form>
  );
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
