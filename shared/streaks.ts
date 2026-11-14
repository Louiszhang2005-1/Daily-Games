import "server-only";
import { addDays, todayET } from "./day";
import { getStore } from "./store";

// Per-game streaks and the hub streak (at least one game a day), counted on ET days.
// Playing yesterday's game (catch-up) never fixes a broken streak.

interface StreakRow {
  user_id: string;
  game: string; // game id or "hub"
  current: number;
  best: number;
  last_day: string | null;
}

export interface Streak {
  current: number;
  best: number;
}

function alive(row: StreakRow | undefined, today: string): Streak {
  if (!row) return { current: 0, best: 0 };
  const ok = row.last_day === today || row.last_day === addDays(today, -1);
  return { current: ok ? row.current : 0, best: row.best };
}

export async function recordStreak(userId: string, game: string, day: string): Promise<void> {
  const store = getStore();
  for (const key of [game, "hub"]) {
    const [row] = await store.select<StreakRow>("streaks", { user_id: userId, game: key });
    if (row?.last_day === day) continue;
    const current = row?.last_day === addDays(day, -1) ? row.current + 1 : 1;
    await store.upsert(
      "streaks",
      { user_id: userId, game: key, current, best: Math.max(row?.best ?? 0, current), last_day: day },
      ["user_id", "game"],
    );
  }
}

export async function getStreak(userId: string, game = "hub"): Promise<Streak> {
  const [row] = await getStore().select<StreakRow>("streaks", { user_id: userId, game });
  return alive(row, todayET());
}

/** Logging in moves a browser's guest streak to the account (keeps whichever is longer). */
export async function importStreak(userId: string, local: { current: number; best: number; lastDay: string | null }): Promise<void> {
  const today = todayET();
  const store = getStore();
  const [row] = await store.select<StreakRow>("streaks", { user_id: userId, game: "hub" });
  const mine = alive(row, today);
  const localAlive = local.lastDay === today || local.lastDay === addDays(today, -1);
  const current = Math.max(mine.current, localAlive ? Math.min(local.current, 3650) : 0);
  const best = Math.max(mine.best, Math.min(local.best, 3650), current);
  const lastDay = current === mine.current ? (row?.last_day ?? local.lastDay) : local.lastDay;
  await store.upsert("streaks", { user_id: userId, game: "hub", current, best, last_day: lastDay }, ["user_id", "game"]);
}
