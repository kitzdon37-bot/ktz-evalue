"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton } from "@/components/form";
import {
  confirmMagicLink,
  login,
  requestMagicLink,
  requestPasswordReset,
  resetPassword,
  signup,
} from "./actions";

const PASSWORD_HINT = "Au moins 10 caractères, avec des lettres et des chiffres.";

export function SignupForm() {
  const [state, action] = useActionState(signup, undefined);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <Field label="Votre nom" name="name" autoComplete="name" errors={state?.errors?.name} />
      <Field
        label="Nom de l'entreprise"
        name="companyName"
        autoComplete="organization"
        errors={state?.errors?.companyName}
      />
      <Field label="Email professionnel" name="email" type="email" autoComplete="email" errors={state?.errors?.email} />
      <Field
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete="new-password"
        errors={state?.errors?.password}
        hint={PASSWORD_HINT}
      />
      <SubmitButton>Créer mon compte</SubmitButton>
    </form>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(login, undefined);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <Field label="Email" name="email" type="email" autoComplete="email" errors={state?.errors?.email} />
      <Field
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete="current-password"
        errors={state?.errors?.password}
      />
      <SubmitButton>Se connecter</SubmitButton>
    </form>
  );
}

export function MagicLinkForm() {
  const [state, action] = useActionState(requestMagicLink, undefined);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <Field label="Email" name="email" type="email" autoComplete="email" errors={state?.errors?.email} />
      <SubmitButton>Recevoir un lien de connexion</SubmitButton>
    </form>
  );
}

export function ConfirmMagicLinkForm({ token }: { token: string }) {
  const [state, action] = useActionState(confirmMagicLink, undefined);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <input type="hidden" name="token" value={token} />
      <SubmitButton>Me connecter</SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, undefined);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <Field label="Email" name="email" type="email" autoComplete="email" errors={state?.errors?.email} />
      <SubmitButton>Recevoir un lien</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword, undefined);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <input type="hidden" name="token" value={token} />
      <Field
        label="Nouveau mot de passe"
        name="password"
        type="password"
        autoComplete="new-password"
        errors={state?.errors?.password}
        hint={PASSWORD_HINT}
      />
      <SubmitButton>Enregistrer le mot de passe</SubmitButton>
    </form>
  );
}
