import "server-only";

// Session user lookup. Accounts arrive in feature/accounts-leaderboards;
// until then everyone plays as a guest.

export interface SessionUser {
  id: string;
  displayName: string;
  language: "en" | "fr";
}

export async function getSessionUser(): Promise<SessionUser | null> {
  return null;
}

export function authAvailable(): boolean {
  return false;
}
