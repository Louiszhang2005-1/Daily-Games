import "server-only";
import { todayET, yesterdayET } from "../day";
import type { GameId, Lang } from "../game";
import { getPlayer } from "../identity";
import { buildIndex, isNonsense, matchAnswer, normalize, type MatchIndex } from "../matcher";
import { getStore } from "../store";
import type { Prompt } from "./types";

interface CountRow {
  puzzle_id: string;
  prompt_index: number;
  canonical_id: string;
  count: number;
}

interface RejectRow {
  puzzle_id: string;
  prompt_index: number;
  normalized_text: string;
  game: string;
  language: string;
  prompt_key: string;
  count: number;
  review_status: string;
}

const indexCache = new Map<string, MatchIndex>();

export function matchPrompt(prompt: Prompt, text: string | null): string | null {
  if (!text || isNonsense(text)) return null;
  const cacheKey = `${prompt.key}:${prompt.text}`;
  let idx = indexCache.get(cacheKey);
  if (!idx) {
    idx = buildIndex(prompt.answers.map((a) => ({ id: a.id, aliases: a.aliases })));
    indexCache.set(cacheKey, idx);
  }
  return matchAnswer(idx, text)?.id ?? null;
}

export async function promptCounts(puzzleId: string, promptIndex: number): Promise<{ counts: Map<string, number>; total: number }> {
  const rows = await getStore().select<CountRow>("answer_counts", { puzzle_id: puzzleId, prompt_index: promptIndex });
  const counts = new Map(rows.map((r) => [r.canonical_id, r.count]));
  const total = rows.reduce((a, r) => a + r.count, 0);
  return { counts, total };
}

export async function bumpCount(puzzleId: string, promptIndex: number, canonicalId: string): Promise<void> {
  const store = getStore();
  const key = { puzzle_id: puzzleId, prompt_index: promptIndex, canonical_id: canonicalId };
  const [row] = await store.select<CountRow>("answer_counts", key);
  await store.upsert("answer_counts", { ...key, count: (row?.count ?? 0) + 1 }, ["puzzle_id", "prompt_index", "canonical_id"]);
}

/** Every rejected answer is stored for the nightly review. */
export async function logRejected(game: GameId, lang: Lang, puzzleId: string, promptIndex: number, prompt: Prompt, text: string) {
  const norm = normalize(text);
  if (!norm) return;
  const store = getStore();
  const key = { puzzle_id: puzzleId, prompt_index: promptIndex, normalized_text: norm };
  const [row] = await store.select<RejectRow>("rejected_answers", key);
  await store.upsert(
    "rejected_answers",
    { ...key, game, language: lang, prompt_key: prompt.key, count: (row?.count ?? 0) + 1, review_status: row?.review_status ?? "pending" },
    ["puzzle_id", "prompt_index", "normalized_text"],
  );
}

export async function dayAllowed(day: string): Promise<boolean> {
  if (day === todayET()) return true;
  const player = await getPlayer();
  return Boolean(player.userId) && day === yesterdayET();
}
