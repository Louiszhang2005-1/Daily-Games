import "server-only";
import { SERVERS } from "@/games/servers";
import { afterResult } from "./hooks";
import { todayET, yesterdayET } from "./day";
import { isGameId, parseVariant, puzzleId, variantKey, type FinishResult, type GameId } from "./game";
import type { Player } from "./identity";
import { percentileFor } from "./scoring";
import { randomId } from "./rng";
import { getStore } from "./store";

export interface ResultRow {
  id: string;
  puzzle_id: string;
  game: GameId;
  day: string;
  variant: string;
  language: string;
  level: string | null;
  player_key: string;
  user_id: string | null;
  guest_id: string | null;
  raw_score: number;
  percentile: number | null; // set when the day locks
  time_ms: number | null;
  details: Record<string, unknown>;
  finished_at: string;
  is_catch_up: boolean;
}

export interface SubmitInput {
  game: string;
  day: string;
  variant: string;
  payload: unknown;
  timeMs?: number;
}

export async function toFinishResult(row: ResultRow, alreadyPlayed: boolean): Promise<FinishResult> {
  const p = row.percentile !== null ? { percentile: row.percentile, provisional: false } : await percentileFor(row);
  return {
    raw: row.raw_score,
    percentile: p.percentile,
    provisional: p.provisional,
    details: row.details,
    alreadyPlayed,
    isCatchUp: row.is_catch_up,
  };
}

export async function submitResult(input: SubmitInput, player: Player): Promise<FinishResult | { error: string }> {
  if (!isGameId(input.game)) return { error: "unknown game" };
  const today = todayET();
  const isCatchUp = input.day !== today;
  if (isCatchUp && !(player.userId && input.day === yesterdayET())) return { error: "day not playable" };
  if (!player.userId && !player.guestId) return { error: "no player id" };

  const v = parseVariant(input.variant);
  const server = SERVERS[input.game];
  const loaded = await server.load(input.day, v);
  if (!loaded) return { error: "no puzzle" };

  const id = puzzleId(input.game, input.day, v);
  const store = getStore();
  // One result per game, day and language: a crossword player picks Easy or Medium, not both.
  const existing = await store.select<ResultRow>("results", {
    game: input.game,
    day: input.day,
    language: v.lang,
    player_key: player.key,
  });
  if (existing[0]) return toFinishResult(existing[0], true);

  const scored = server.score(loaded.full, input.payload);
  if ("error" in scored) return scored;

  const row: ResultRow = {
    id: randomId(),
    puzzle_id: id,
    game: input.game,
    day: input.day,
    variant: variantKey(v),
    language: v.lang,
    level: v.level ?? null,
    player_key: player.key,
    user_id: player.userId,
    guest_id: player.userId ? null : player.guestId,
    raw_score: scored.raw,
    percentile: null,
    time_ms: typeof input.timeMs === "number" ? Math.round(input.timeMs) : null,
    details: scored.details,
    finished_at: new Date().toISOString(),
    is_catch_up: isCatchUp,
  };
  const inserted = await store.insert("results", row);
  if (!inserted) {
    const again = await store.select<ResultRow>("results", { puzzle_id: id, player_key: player.key });
    if (again[0]) return toFinishResult(again[0], true);
  }
  await afterResult(player, row);
  return toFinishResult(row, false);
}

export async function resultsForPlayer(player: Player, day: string): Promise<ResultRow[]> {
  return getStore().select<ResultRow>("results", { player_key: player.key, day });
}
