import "server-only";
import type { Player } from "./identity";
import type { ResultRow } from "./results";
import { recordStreak } from "./streaks";

// Runs after a result is saved.
export async function afterResult(player: Player, row: ResultRow): Promise<void> {
  if (player.userId && !row.is_catch_up) await recordStreak(player.userId, row.game, row.day);
}
