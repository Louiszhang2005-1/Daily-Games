import "server-only";
import { addDays } from "@/shared/day";
import type { GameId, Lang } from "@/shared/game";
import type { PuzzleRow } from "@/shared/puzzles";
import { getStore } from "@/shared/store";

// The puzzle archive: every published puzzle is kept, and new puzzles are checked
// against it so answers don't repeat within their window.

export async function recentPuzzles(game: GameId, lang: Lang, day: string, windowDays: number): Promise<PuzzleRow[]> {
  return getStore().select<PuzzleRow>("daily_puzzles", {
    game,
    language: lang,
    day: { gte: addDays(day, -windowDays), lte: addDays(day, windowDays) },
  });
}

export async function recentAnswerKeys(game: GameId, lang: Lang, day: string, windowDays: number): Promise<Set<string>> {
  const rows = await recentPuzzles(game, lang, day, windowDays);
  return new Set(rows.filter((r) => r.day !== day).flatMap((r) => r.answer_key.split("|")));
}

export async function puzzleExists(id: string): Promise<boolean> {
  return (await getStore().select("daily_puzzles", { id })).length > 0;
}
