import { isOAuthConfigured } from "@/lib/auth/oauth";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

// Bouton « Continuer avec Google », affiché seulement quand la connexion Google est configurée.
// Lien simple (sans JavaScript) : il marche partout, même sur un vieux téléphone.
export function OAuthButtons({ separator }: { separator: "before" | "after" }) {
  if (!isOAuthConfigured("google")) return null;
  const line = (
    <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
      <span className="h-px flex-1 bg-stone-200" /> ou <span className="h-px flex-1 bg-stone-200" />
    </div>
  );
  return (
    <>
      {separator === "before" && line}
      {/* Lien classique (pas <Link>) : c'est une route API qui redirige vers Google, rien à précharger. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        href="/api/auth/oauth/google"
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-800 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-400 hover:shadow-md"
      >
        <GoogleIcon /> Continuer avec Google
      </a>
      {separator === "after" && line}
    </>
  );
}

const OAUTH_MESSAGES: Record<string, string> = {
  annule: "La connexion avec Google a été annulée. Vous pouvez réessayer ou utiliser votre email.",
  expire: "La connexion avec Google a pris trop de temps. Cliquez de nouveau sur « Continuer avec Google ».",
  echec: "Google n'a pas pu confirmer votre compte. Réessayez, ou connectez-vous avec votre email.",
  indisponible: "La connexion avec Google n'est pas encore activée. Utilisez votre email et votre mot de passe.",
  invitation:
    "Une invitation à rejoindre une équipe attend cette adresse. Ouvrez le lien reçu par email pour créer votre compte dans la bonne entreprise.",
  "compte-supprime": "Ce compte a été supprimé. Contactez KTZ Évalue si vous pensez qu'il s'agit d'une erreur.",
};

export function OAuthMessage({ reason }: { reason?: string | string[] }) {
  const text = typeof reason === "string" ? OAUTH_MESSAGES[reason] : undefined;
  if (!text) return null;
  return (
    <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
      {text}
    </p>
  );
}
