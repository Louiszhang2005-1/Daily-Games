import "server-only";
import { cookies } from "next/headers";
import { getSessionUser, type SessionUser } from "./auth";

// Every browser gets a guest id cookie (set in middleware.ts).
// A player key is "u:<userId>" when logged in, else "g:<guestId>".

export const GUEST_COOKIE = "gid";

export interface Player {
  key: string;
  userId: string | null;
  guestId: string | null;
  user: SessionUser | null;
}

export async function getPlayer(): Promise<Player> {
  const user = await getSessionUser();
  const guestId = (await cookies()).get(GUEST_COOKIE)?.value ?? null;
  if (user) return { key: `u:${user.id}`, userId: user.id, guestId, user };
  return { key: `g:${guestId ?? "anonymous"}`, userId: null, guestId, user: null };
}
