import { LIVE_THRESHOLD, type PromptAnswer } from "@/shared/prompts/types";

export interface BoardRow {
  id: string;
  display: string;
  share: number; // percent, 0-100
}

export type ClimbTier = "summit" | "high" | "clouds" | "rooftops" | "lamppost" | "ground";

// Points come from where your answer ranks on the board.
// Only the number one answer earns the full 100.
export const RANK_TIERS: { tier: ClimbTier; upTo: number; points: number }[] = [
  { tier: "summit", upTo: 1, points: 100 },
  { tier: "high", upTo: 4, points: 64 },
  { tier: "clouds", upTo: 9, points: 32 },
  { tier: "rooftops", upTo: 12, points: 16 },
  { tier: "lamppost", upTo: 15, points: 8 },
  { tier: "ground", upTo: Infinity, points: 4 },
];

export function tierForRank(rank: number): { tier: ClimbTier; points: number } {
  const t = RANK_TIERS.find((x) => rank <= x.upTo)!;
  return { tier: t.tier, points: t.points };
}

/** Estimated shares until 30 answers, then live counts. Sorted, most common first. */
export function board(answers: PromptAnswer[], counts: Map<string, number>, total: number): BoardRow[] {
  let rows: BoardRow[];
  if (total >= LIVE_THRESHOLD) {
    rows = answers.map((a) => ({ id: a.id, display: a.aliases[0], share: (100 * (counts.get(a.id) ?? 0)) / total }));
  } else {
    const sum = answers.reduce((s, a) => s + (a.share ?? 0), 0) || 1;
    rows = answers.map((a) => ({ id: a.id, display: a.aliases[0], share: (100 * (a.share ?? 0)) / sum }));
  }
  return rows.sort((a, b) => b.share - a.share);
}

export function rankOf(rows: BoardRow[], id: string | null): number | null {
  if (!id) return null;
  const i = rows.findIndex((r) => r.id === id);
  return i < 0 ? null : i + 1;
}

export function pointsFor(rows: BoardRow[], id: string | null): number {
  const rank = rankOf(rows, id);
  return rank === null ? 0 : tierForRank(rank).points;
}
