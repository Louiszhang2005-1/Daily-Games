"use server";

import { parseVariant, puzzleId as makeId } from "@/shared/game";
import { isNonsense } from "@/shared/matcher";
import { dayAllowed, logRejected, matchPrompt, promptCounts } from "@/shared/prompts/server";
import { board, pointsFor, type BoardRow } from "./logic";
import { server } from "./server";

export interface CommonReveal {
  matched: string | null; // canonical id
  points: number;
  reason: "ok" | "empty" | "nonsense" | "unlisted";
  board: BoardRow[]; // top answers
}

export async function answerCommon(day: string, variant: string, index: number, text: string | null): Promise<CommonReveal> {
  const v = parseVariant(variant);
  const none: CommonReveal = { matched: null, points: 0, reason: "empty", board: [] };
  if (!(await dayAllowed(day))) return none;
  const loaded = await server.load(day, v);
  const p = loaded?.full.prompts[index];
  if (!p) return none;
  const { counts, total } = await promptCounts(makeId("common", day, v), index);
  const rows = board(p.answers, counts, total);
  const top = rows.slice(0, 6).map((r) => ({ ...r, share: Math.round(r.share) }));
  if (!text) return { ...none, board: top };
  if (isNonsense(text)) return { matched: null, points: 0, reason: "nonsense", board: top };
  const id = matchPrompt(p, text);
  if (!id) return { matched: null, points: 0, reason: "unlisted", board: top };
  const mine = rows.find((r) => r.id === id);
  const shown = top.some((r) => r.id === id) || !mine ? top : [...top, { ...mine, share: Math.round(mine.share) }];
  return { matched: id, points: pointsFor(rows, id), reason: "ok", board: shown };
}

export async function reportCommon(day: string, variant: string, index: number, text: string): Promise<void> {
  const v = parseVariant(variant);
  if (!text || !(await dayAllowed(day))) return;
  const loaded = await server.load(day, v);
  const p = loaded?.full.prompts[index];
  if (p) await logRejected("common", v.lang, makeId("common", day, v), index, p, text.slice(0, 80));
}
