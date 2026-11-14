import "server-only";
import { getStore } from "./store";
import { puzzleId, type GameId, type PuzzleSource, type Variant } from "./game";

export interface PuzzleRow {
  id: string;
  game: GameId;
  day: string;
  variant: string;
  language: string;
  answer_key: string;
  content: unknown;
  source: "generated" | "backup";
  status: "scheduled" | "live" | "yesterday" | "archived";
}

/** A generated (or backup) puzzle stored by the generation job, if any. */
export async function loadStoredPuzzle<Full>(
  game: GameId,
  day: string,
  v: Variant,
): Promise<{ full: Full; source: PuzzleSource } | null> {
  try {
    const rows = await getStore().select<PuzzleRow>("daily_puzzles", { id: puzzleId(game, day, v) });
    const row = rows[0];
    return row ? { full: row.content as Full, source: row.source } : null;
  } catch (err) {
    console.error("loadStoredPuzzle", err);
    return null;
  }
}
