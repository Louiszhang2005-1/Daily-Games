import "server-only";
import { METAS } from "@/games/metas";
import { addDays } from "./day";
import type { GameId, Lang } from "./game";
import type { ResultRow } from "./results";
import { applyCap, dailyTotal, PROVISIONAL_MIN, rankPercentile } from "./scoring";
import { getStore } from "./store";

// Leaderboards. Only logged-in players appear, but every counted result (guests too)
// shapes the percentiles.

interface UserRow {
  id: string;
  display_name: string;
}

export interface BoardEntry {
  userId: string;
  name: string;
  total: number | null;
  games: Partial<Record<GameId, number>>;
  played: number;
}

/** Percentile for every row, computed per ranking group in one pass. */
export async function percentileMap(rows: ResultRow[]): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  const groups = new Map<string, ResultRow[]>();
  for (const r of rows) groups.set(r.puzzle_id, [...(groups.get(r.puzzle_id) ?? []), r]);
  const store = getStore();
  for (const group of groups.values()) {
    const first = group[0];
    const meta = METAS[first.game];
    let pool = group.map((r) => r.raw_score);
    if (pool.length < PROVISIONAL_MIN && group.some((r) => r.percentile === null)) {
      const past = await store.select<ResultRow>("results", {
        game: first.game,
        variant: first.variant,
        day: { gte: addDays(first.day, -14), lte: addDays(first.day, -1) },
      });
      pool = [...pool, ...past.map((r) => r.raw_score)];
    }
    for (const r of group)
      out.set(r.id, r.percentile ?? applyCap(rankPercentile(r.raw_score, pool, meta.lowerIsBetter), meta, r.level));
  }
  return out;
}

export async function userNames(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const users = await getStore().select<UserRow>("users", { id: { in: ids } });
  return new Map(users.map((u) => [u.id, u.display_name]));
}

/** All results of a day in a language (the whole ranking groups, guests included). */
export async function dayResults(day: string, lang: Lang): Promise<ResultRow[]> {
  return getStore().select<ResultRow>("results", { day, language: lang });
}

export async function dailyBoard(
  day: string,
  lang: Lang,
  opts: { userIds?: Set<string>; excludeCatchUp?: boolean } = {},
): Promise<BoardEntry[]> {
  const rows = await dayResults(day, lang);
  const pct = await percentileMap(rows);
  const byUser = new Map<string, BoardEntry>();
  for (const r of rows) {
    if (!r.user_id) continue;
    if (opts.userIds && !opts.userIds.has(r.user_id)) continue;
    if (opts.excludeCatchUp && r.is_catch_up) continue;
    const e = byUser.get(r.user_id) ?? { userId: r.user_id, name: "", total: null, games: {}, played: 0 };
    e.games[r.game] = pct.get(r.id);
    e.played++;
    byUser.set(r.user_id, e);
  }
  const names = await userNames([...byUser.keys()]);
  const list = [...byUser.values()].map((e) => ({
    ...e,
    name: names.get(e.userId) ?? "?",
    total: dailyTotal(Object.values(e.games).filter((x): x is number => typeof x === "number")),
  }));
  return list.sort((a, b) => (b.total ?? -1) - (a.total ?? -1));
}

export async function gameBoard(day: string, lang: Lang, game: GameId): Promise<{ userId: string; name: string; pct: number; summary: string }[]> {
  const rows = (await dayResults(day, lang)).filter((r) => r.game === game);
  const pct = await percentileMap(rows);
  const users = rows.filter((r) => r.user_id);
  const names = await userNames(users.map((r) => r.user_id!));
  return users
    .map((r) => ({
      userId: r.user_id!,
      name: names.get(r.user_id!) ?? "?",
      pct: pct.get(r.id) ?? 0,
      summary: (r.details.summary as Record<Lang, string> | undefined)?.[lang] ?? String(r.raw_score),
    }))
    .sort((a, b) => b.pct - a.pct);
}

/** All-time archive: average daily total over a day range. */
export async function rangeBoard(from: string, to: string, lang: Lang): Promise<{ userId: string; name: string; avg: number; days: number }[]> {
  const rows = await getStore().select<ResultRow>("results", { day: { gte: from, lte: to }, language: lang });
  const pct = await percentileMap(rows);
  const perUserDay = new Map<string, Map<string, number[]>>();
  for (const r of rows) {
    if (!r.user_id) continue;
    const days = perUserDay.get(r.user_id) ?? new Map<string, number[]>();
    days.set(r.day, [...(days.get(r.day) ?? []), pct.get(r.id) ?? 0]);
    perUserDay.set(r.user_id, days);
  }
  const names = await userNames([...perUserDay.keys()]);
  return [...perUserDay.entries()]
    .map(([userId, days]) => {
      const totals = [...days.values()].map((ps) => dailyTotal(ps) ?? 0);
      return { userId, name: names.get(userId) ?? "?", avg: dailyTotal(totals) ?? 0, days: totals.length };
    })
    .sort((a, b) => b.avg - a.avg);
}
