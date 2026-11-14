import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { todayET } from "./day";
import { hashString } from "./rng";
import { getStore } from "./store";
import { recordStreak } from "./streaks";

// Sign in with Google or an email magic link (Supabase Auth).
// Without Supabase keys (local development), a dev-only sign-in by display name is used.

export interface SessionUser {
  id: string;
  displayName: string;
  language: "en" | "fr";
}

interface UserRow {
  id: string;
  display_name: string;
  language: "en" | "fr";
  created_at: string;
}

export const DEV_COOKIE = "dev_uid";

export function authMode(): "supabase" | "dev" {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "supabase" : "dev";
}

export function authAvailable(): boolean {
  return authMode() === "supabase" || process.env.NODE_ENV !== "production" || process.env.ALLOW_DEV_LOGIN === "1";
}

export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* called from a server component: middleware refreshes the session */
        }
      },
    },
  });
}

const FIRST = ["Crossword", "Wordy", "Globe", "Clue", "Rare", "Lucky", "Swift", "Clever", "Quiet", "Bold", "Daily", "Cosmic", "Sunny", "Witty", "Nimble", "Mellow"];
const SECOND = ["Caribou", "Otter", "Falcon", "Panda", "Lynx", "Heron", "Moose", "Gecko", "Koala", "Badger", "Puffin", "Walrus", "Ibex", "Marmot", "Tapir", "Narwhal"];

export function generateName(seed: string): string {
  const h = hashString(seed);
  return `${FIRST[h % FIRST.length]}${SECOND[(h >>> 8) % SECOND.length]}${(h >>> 16) % 100}`;
}

export async function ensureUser(id: string, hint?: string | null, language: "en" | "fr" = "en"): Promise<UserRow> {
  const store = getStore();
  const [row] = await store.select<UserRow>("users", { id });
  if (row) return row;
  const fresh: UserRow = {
    id,
    display_name: (hint ?? "").trim().slice(0, 32) || generateName(id),
    language,
    created_at: new Date().toISOString(),
  };
  await store.insert("users", fresh);
  return fresh;
}

const toSession = (r: UserRow): SessionUser => ({ id: r.id, displayName: r.display_name, language: r.language });

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  try {
    if (authMode() === "supabase") {
      const sb = await supabaseServer();
      const { data } = await sb.auth.getUser();
      if (!data.user) return null;
      return toSession(await ensureUser(data.user.id));
    }
    if (!authAvailable()) return null;
    const id = (await cookies()).get(DEV_COOKIE)?.value;
    if (!id) return null;
    const [row] = await getStore().select<UserRow>("users", { id });
    return row ? toSession(row) : null;
  } catch (err) {
    console.error("getSessionUser", err);
    return null;
  }
});

/** A guest who logs in the same day keeps today's results (unless the account already played that game). */
export async function claimGuestResults(guestId: string | null | undefined, userId: string): Promise<number> {
  if (!guestId) return 0;
  const store = getStore();
  const day = todayET();
  const guestRows = await store.select<{ id: string; game: string; language: string }>("results", { player_key: `g:${guestId}`, day });
  const mine = await store.select<{ game: string; language: string }>("results", { player_key: `u:${userId}`, day });
  let moved = 0;
  for (const r of guestRows) {
    if (mine.some((m) => m.game === r.game && m.language === r.language)) continue;
    await store.update("results", { id: r.id }, { player_key: `u:${userId}`, user_id: userId, guest_id: null });
    await recordStreak(userId, r.game, day);
    moved++;
  }
  return moved;
}

