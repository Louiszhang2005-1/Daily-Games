"use server";

import { parseVariant, puzzleId as makeId } from "@/shared/game";
import { isNonsense } from "@/shared/matcher";
import { dayAllowed, logRejected, matchPrompt, promptCounts } from "@/shared/prompts/server";
import { board, rankOf, tierForRank, type BoardRow, type ClimbTier } from "./logic";
import { server } from "./server";

export interface CommonReveal {
  matched: string | null; // canonical id
  display: string | null;
  rank: number | null;
  tier: ClimbTier | null;
  points: number;
  reason: "ok" | "empty" | "nonsense" | "unlisted";
  board: (BoardRow & { rank: number })[]; // top answers (plus yours if lower)
}

export async function answerCommon(day: string, variant: string, index: number, text: string | null): Promise<CommonReveal> {
  const v = parseVariant(variant);
  const none: CommonReveal = { matched: null, display: null, rank: null, tier: null, points: 0, reason: "empty", board: [] };
  if (!(await dayAllowed(day))) return none;
  const loaded = await server.load(day, v);
  const p = loaded?.full.prompts[index];
  if (!p) return none;
  const { counts, total } = await promptCounts(makeId("common", day, v), index);
  const rows = board(p.answers, counts, total).map((r, i) => ({ ...r, rank: i + 1, share: Math.round(r.share) }));
  const top = rows.slice(0, 5);
  if (!text) return { ...none, board: top };
  if (isNonsense(text)) return { ...none, reason: "nonsense", board: top };
  const id = matchPrompt(p, text);
  if (!id) {
    // Every turned-away answer is logged for the nightly review.
    await logRejected("common", v.lang, makeId("common", day, v), index, p, text.slice(0, 80));
    return { ...none, reason: "unlisted", board: top };
  }
  const rank = rankOf(rows, id)!;
  const mine = rows[rank - 1];
  const { tier, points } = tierForRank(rank);
  return { matched: id, display: mine.display, rank, tier, points, reason: "ok", board: rank <= 5 ? top : [...top, mine] };
}

export async function reportCommon(day: string, variant: string, index: number, text: string): Promise<void> {
  const v = parseVariant(variant);
  if (!text || !(await dayAllowed(day))) return;
  const loaded = await server.load(day, v);
  const p = loaded?.full.prompts[index];
  if (p) await logRejected("common", v.lang, makeId("common", day, v), index, p, text.slice(0, 80));
}
