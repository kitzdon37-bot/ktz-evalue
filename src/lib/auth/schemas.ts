import * as z from "zod";

// On enlève les espaces et les majuscules avant de vérifier le format.
const email = z
  .string({ error: "Indiquez votre email." })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Adresse email invalide." }));

const password = z
  .string()
  .min(10, { error: "Le mot de passe doit contenir au moins 10 caractères." })
  .max(200, { error: "Le mot de passe est trop long." })
  .regex(/[a-zA-Z]/, { error: "Le mot de passe doit contenir au moins une lettre." })
  .regex(/[0-9]/, { error: "Le mot de passe doit contenir au moins un chiffre." });

export const SignupSchema = z.object({
  name: z.string().trim().min(2, { error: "Indiquez votre nom (2 caractères minimum)." }).max(100),
  companyName: z
    .string()
    .trim()
    .min(2, { error: "Indiquez le nom de l'entreprise (2 caractères minimum)." })
    .max(120),
  email,
  password,
});

export const LoginSchema = z.object({
  email,
  password: z.string().min(1, { error: "Indiquez votre mot de passe." }).max(200),
});

export const EmailSchema = z.object({ email });

export const ResetPasswordSchema = z.object({
  token: z.string().min(10).max(200),
  password,
});

export type FormState =
  | {
      errors?: Record<string, string[] | undefined>;
      message?: string;
      success?: string;
    }
  | undefined;
