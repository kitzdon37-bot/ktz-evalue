// Limitation des tentatives de connexion : après MAX_FAILED_LOGINS échecs,
// le compte est bloqué pendant LOCK_MINUTES.
export const MAX_FAILED_LOGINS = 5;
export const LOCK_MINUTES = 15;

export function isLocked(lockedUntil: Date | null, now = new Date()): boolean {
  return lockedUntil !== null && lockedUntil > now;
}

export function afterFailedLogin(failedLogins: number, now = new Date()) {
  const count = failedLogins + 1;
  if (count >= MAX_FAILED_LOGINS) {
    return { failedLogins: 0, lockedUntil: new Date(now.getTime() + LOCK_MINUTES * 60_000) };
  }
  return { failedLogins: count, lockedUntil: null };
}
