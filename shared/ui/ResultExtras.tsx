"use client";

import type { FinishResult, GameId } from "../game";

// Extra buttons on the results screen (image card, 1v1 link).
// Filled in by feature/sharing.
export function ResultExtras(_props: { game: GameId; day: string; result: FinishResult }) {
  return null;
}
