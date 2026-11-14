import "server-only";
import type { Player } from "./identity";
import type { ResultRow } from "./results";

// Runs after a result is saved. Streaks hook in here (feature/accounts-leaderboards).
export async function afterResult(_player: Player, _row: ResultRow): Promise<void> {}
