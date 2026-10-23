import { createHash, randomBytes } from "node:crypto";

// Jeton aléatoire envoyé à l'utilisateur (cookie ou lien dans un email).
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

// On n'enregistre en base que l'empreinte du jeton : une fuite de la base
// ne permet pas de se connecter.
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
