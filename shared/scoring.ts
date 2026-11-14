import "server-only";
import { METAS } from "@/games/metas";
import { SERVERS } from "@/games/servers";
import { addDays } from "./day";
import { parseVariant, type GameId, type GameMeta } from "./game";
import type { ResultRow } from "./results";
import { getStore } from "./store";

// Every game's raw score becomes a 0-100 rank percentile within its ranking group
// (game + day + language, + level for the crossword). Ties share a percentile.

export const PROVISIONAL_MIN = 30;
const HISTORY_DAYS = 14;

/** Mid-rank percentile: beat everyone below, half-credit for ties. */
export function rankPercentile(raw: number, pool: number[], lowerIsBetter = false): number {
  if (pool.length === 0) return 50;
  let worse = 0;
  let equal = 0;
  for (const r of pool) {
    if (r === raw) equal++;
    else if (lowerIsBetter ? r > raw : r < raw) worse++;
  }
  return (100 * (worse + 0.5 * equal)) / pool.length;
}

/** Easy crossword percentiles are scaled so they top out at 80. */
export function applyCap(pct: number, meta: GameMeta, level: string | null): number {
  const cap = level ? (meta.maxPercentile?.[level] ?? 100) : 100;
  return Math.round(((pct * cap) / 100) * 10) / 10;
}

async function groupRaws(puzzleId: string): Promise<number[]> {
  const rows = await getStore().select<ResultRow>("results", { puzzle_id: puzzleId });
  return rows.map((r) => r.raw_score);
}

/** Raw scores for the same game + variant over recent days (for provisional percentiles). */
async function historyRaws(game: GameId, variant: string, day: string): Promise<number[]> {
  const rows = await getStore().select<ResultRow>("results", {
    game,
    variant,
    day: { gte: addDays(day, -HISTORY_DAYS), lte: addDays(day, -1) },
  });
  return rows.map((r) => r.raw_score);
}

export async function percentileFor(row: ResultRow): Promise<{ percentile: number | null; provisional: boolean }> {
  const meta = METAS[row.game];
  const today = await groupRaws(row.puzzle_id);
  let pool = today.length ? today : [row.raw_score];
  let provisional = false;
  if (pool.length < PROVISIONAL_MIN) {
    provisional = true;
    pool = [...pool, ...(await historyRaws(row.game, row.variant, row.day))];
  }
  const pct = rankPercentile(row.raw_score, pool, meta.lowerIsBetter);
  return { percentile: applyCap(pct, meta, row.level), provisional };
}

export interface Difficulty {
  label: "easy" | "medium" | "hard";
  detail: string;
}

/** Today's difficulty from the day's raw scores, compared with recent days. */
export async function difficultyFor(game: string, day: string, variant: string): Promise<Difficulty | null> {
  const g = game as GameId;
  const meta = METAS[g];
  if (!meta) return null;
  const raws = await groupRaws(`${g}:${day}:${variant}`);
  if (raws.length < 3) return null;
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const past = await historyRaws(g, variant, day);
  let label: Difficulty["label"] = "medium";
  if (past.length >= 10) {
    const ratio = mean(raws) / (mean(past) || 1);
    const better = meta.lowerIsBetter ? ratio < 0.9 : ratio > 1.1;
    const worse = meta.lowerIsBetter ? ratio > 1.1 : ratio < 0.9;
    label = better ? "easy" : worse ? "hard" : "medium";
  }
  const detail = SERVERS[g].difficultyDetail?.(raws, parseVariant(variant).lang) ?? "";
  return { label, detail };
}

/** Average of the (capped) percentiles of the games played. No minimum number of games. */
export function dailyTotal(percentiles: number[]): number | null {
  if (percentiles.length === 0) return null;
  return Math.round((percentiles.reduce((a, b) => a + b, 0) / percentiles.length) * 10) / 10;
}

/**
 * Locks a day: final percentiles are written to every result and the puzzles archived.
 * Runs after midnight ET for the day before yesterday (yesterday stays open for catch-up).
 */
export async function lockDay(day: string): Promise<{ results: number; puzzles: number }> {
  const store = getStore();
  const rows = await store.select<ResultRow>("results", { day });
  const groups = new Map<string, ResultRow[]>();
  for (const r of rows) groups.set(r.puzzle_id, [...(groups.get(r.puzzle_id) ?? []), r]);
  for (const group of groups.values()) {
    const meta = METAS[group[0].game];
    const raws = group.map((r) => r.raw_score);
    for (const r of group) {
      const pct = applyCap(rankPercentile(r.raw_score, raws, meta.lowerIsBetter), meta, r.level);
      await store.update("results", { id: r.id }, { percentile: pct });
    }
  }
  await store.update("daily_puzzles", { day }, { status: "archived" });
  return { results: rows.length, puzzles: groups.size };
}
